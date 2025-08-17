import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  HabitGroup,
  GroupMember,
  GroupPrivacy,
  GroupRole,
} from '../../../database/entities/habit-group.entity';
import { User } from '../../../database/entities/user.entity';
import {
  CreateHabitGroupDto,
  UpdateHabitGroupDto,
  JoinGroupDto,
  UpdateMemberRoleDto,
} from '../dto/habit-group.dto';

@Injectable()
export class HabitGroupService {
  constructor(
    @InjectRepository(HabitGroup)
    private habitGroupRepository: Repository<HabitGroup>,
    @InjectRepository(GroupMember)
    private groupMemberRepository: Repository<GroupMember>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async createHabitGroup(
    userId: number,
    createDto: CreateHabitGroupDto
  ): Promise<HabitGroup> {
    // Check if group name already exists
    const existingGroup = await this.habitGroupRepository.findOne({
      where: { name: createDto.name },
    });

    if (existingGroup) {
      throw new BadRequestException('Group name already exists');
    }

    const group = this.habitGroupRepository.create({
      ...createDto,
      ownerId: userId,
      currentMembers: 1,
    });

    const savedGroup = await this.habitGroupRepository.save(group);

    // Add creator as owner member
    await this.groupMemberRepository.save({
      groupId: savedGroup.id,
      userId,
      role: GroupRole.OWNER,
    });

    return savedGroup;
  }

  async getUserHabitGroups(userId: number): Promise<HabitGroup[]> {
    return this.habitGroupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.members', 'member')
      .leftJoinAndSelect('group.owner', 'owner')
      .where('member.userId = :userId', { userId })
      .orWhere('group.ownerId = :userId', { userId })
      .orWhere('group.privacy = :public', { public: GroupPrivacy.PUBLIC })
      .orderBy('group.lastActivityAt', 'DESC')
      .getMany();
  }

  async getHabitGroupById(
    groupId: number,
    userId: number
  ): Promise<HabitGroup> {
    const group = await this.habitGroupRepository.findOne({
      where: { id: groupId },
      relations: ['members', 'members.user', 'owner', 'habits'],
    });

    if (!group) {
      throw new NotFoundException('Habit group not found');
    }

    // Check if user has access to private groups
    if (group.privacy === GroupPrivacy.PRIVATE) {
      const isMember = group.members.some((member) => member.userId === userId);
      const isOwner = group.ownerId === userId;

      if (!isMember && !isOwner) {
        throw new ForbiddenException('Access denied to private group');
      }
    }

    return group;
  }

  async updateHabitGroup(
    groupId: number,
    userId: number,
    updateDto: UpdateHabitGroupDto
  ): Promise<HabitGroup> {
    const group = await this.getHabitGroupById(groupId, userId);

    // Check if user is owner or admin
    const member = group.members.find((m) => m.userId === userId);
    if (
      !member ||
      (member.role !== GroupRole.OWNER && member.role !== GroupRole.ADMIN)
    ) {
      throw new ForbiddenException('Only owners and admins can update groups');
    }

    // Check if new name conflicts with existing groups
    if (updateDto.name && updateDto.name !== group.name) {
      const existingGroup = await this.habitGroupRepository.findOne({
        where: { name: updateDto.name },
      });

      if (existingGroup) {
        throw new BadRequestException('Group name already exists');
      }
    }

    Object.assign(group, updateDto);
    return this.habitGroupRepository.save(group);
  }

  async deleteHabitGroup(groupId: number, userId: number): Promise<void> {
    const group = await this.getHabitGroupById(groupId, userId);

    if (group.ownerId !== userId) {
      throw new ForbiddenException('Only group owners can delete groups');
    }

    await this.habitGroupRepository.remove(group);
  }

  async joinHabitGroup(
    groupId: number,
    userId: number,
    joinDto: JoinGroupDto
  ): Promise<GroupMember> {
    const group = await this.habitGroupRepository.findOne({
      where: { id: groupId },
      relations: ['members'],
    });

    if (!group) {
      throw new NotFoundException('Habit group not found');
    }

    if (!group.isActive) {
      throw new BadRequestException('Group is not active');
    }

    if (group.currentMembers >= group.maxMembers) {
      throw new BadRequestException('Group is at maximum capacity');
    }

    // Check if user is already a member
    const existingMember = group.members.find(
      (member) => member.userId === userId
    );
    if (existingMember) {
      throw new BadRequestException('User is already a member of this group');
    }

    // Check privacy settings
    if (group.privacy === GroupPrivacy.INVITE_ONLY) {
      throw new BadRequestException(
        'This group requires an invitation to join'
      );
    }

    const member = this.groupMemberRepository.create({
      groupId,
      userId,
      role: GroupRole.MEMBER,
    });

    // Update member count
    group.currentMembers += 1;
    await this.habitGroupRepository.save(group);

    return this.groupMemberRepository.save(member);
  }

  async leaveHabitGroup(groupId: number, userId: number): Promise<void> {
    const group = await this.getHabitGroupById(groupId, userId);

    const member = group.members.find((m) => m.userId === userId);
    if (!member) {
      throw new BadRequestException('User is not a member of this group');
    }

    if (member.role === GroupRole.OWNER) {
      throw new BadRequestException('Group owners cannot leave their groups');
    }

    await this.groupMemberRepository.remove(member);

    // Update member count
    group.currentMembers -= 1;
    await this.habitGroupRepository.save(group);
  }

  async updateMemberRole(
    groupId: number,
    adminUserId: number,
    memberUserId: number,
    updateDto: UpdateMemberRoleDto
  ): Promise<GroupMember> {
    const group = await this.getHabitGroupById(groupId, adminUserId);

    // Check if admin user has permission
    const adminMember = group.members.find((m) => m.userId === adminUserId);
    if (
      !adminMember ||
      (adminMember.role !== GroupRole.OWNER &&
        adminMember.role !== GroupRole.ADMIN)
    ) {
      throw new ForbiddenException(
        'Only owners and admins can update member roles'
      );
    }

    const member = group.members.find((m) => m.userId === memberUserId);
    if (!member) {
      throw new NotFoundException('Member not found in group');
    }

    // Prevent role changes on owners
    if (member.role === GroupRole.OWNER) {
      throw new BadRequestException('Cannot change owner role');
    }

    // Prevent non-owners from promoting to admin
    if (
      updateDto.role === GroupRole.ADMIN &&
      adminMember.role !== GroupRole.OWNER
    ) {
      throw new ForbiddenException('Only owners can promote to admin');
    }

    member.role = updateDto.role;
    return this.groupMemberRepository.save(member);
  }

  async removeMember(
    groupId: number,
    adminUserId: number,
    memberUserId: number
  ): Promise<void> {
    const group = await this.getHabitGroupById(groupId, adminUserId);

    // Check if admin user has permission
    const adminMember = group.members.find((m) => m.userId === adminUserId);
    if (
      !adminMember ||
      (adminMember.role !== GroupRole.OWNER &&
        adminMember.role !== GroupRole.ADMIN)
    ) {
      throw new ForbiddenException('Only owners and admins can remove members');
    }

    const member = group.members.find((m) => m.userId === memberUserId);
    if (!member) {
      throw new NotFoundException('Member not found in group');
    }

    // Prevent removal of owners
    if (member.role === GroupRole.OWNER) {
      throw new BadRequestException('Cannot remove group owner');
    }

    await this.groupMemberRepository.remove(member);

    // Update member count
    group.currentMembers -= 1;
    await this.habitGroupRepository.save(group);
  }

  async searchHabitGroups(
    query: string,
    category?: string,
    privacy?: GroupPrivacy
  ): Promise<HabitGroup[]> {
    const queryBuilder = this.habitGroupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.owner', 'owner')
      .where('group.isActive = :isActive', { isActive: true })
      .andWhere('group.privacy = :public', { public: GroupPrivacy.PUBLIC });

    if (query) {
      queryBuilder.andWhere(
        '(group.name ILIKE :query OR group.description ILIKE :query)',
        {
          query: `%${query}%`,
        }
      );
    }

    if (category) {
      queryBuilder.andWhere('group.category = :category', { category });
    }

    if (privacy) {
      queryBuilder.andWhere('group.privacy = :privacy', { privacy });
    }

    return queryBuilder
      .orderBy('group.currentMembers', 'DESC')
      .addOrderBy('group.createdAt', 'DESC')
      .limit(20)
      .getMany();
  }

  async getGroupStats(groupId: number): Promise<any> {
    const group = await this.habitGroupRepository.findOne({
      where: { id: groupId },
      relations: ['members', 'habits'],
    });

    if (!group) {
      throw new NotFoundException('Habit group not found');
    }

    const memberCount = group.members.length;
    const habitCount = group.habits.length;
    const activeMembers = group.members.filter(
      (m) =>
        m.lastActivityAt &&
        new Date().getTime() - m.lastActivityAt.getTime() <
          7 * 24 * 60 * 60 * 1000
    ).length;

    return {
      memberCount,
      habitCount,
      activeMembers,
      memberActivityRate:
        memberCount > 0 ? (activeMembers / memberCount) * 100 : 0,
    };
  }
}
