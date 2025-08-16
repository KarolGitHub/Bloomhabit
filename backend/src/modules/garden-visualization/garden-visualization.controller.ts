import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GardenThemesService } from './garden-themes.service';
import { GardenLayoutsService } from './garden-layouts.service';
import { Garden3dViewsService } from './garden-3d-views.service';
import { GardenSharesService } from './garden-shares.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateGardenThemeDto,
  UpdateGardenThemeDto,
} from './dto/garden-theme.dto';
import {
  CreateGardenLayoutDto,
  UpdateGardenLayoutDto,
} from './dto/garden-layout.dto';
import {
  CreateGarden3dViewDto,
  UpdateGarden3dViewDto,
} from './dto/garden-3d-view.dto';
import {
  CreateGardenShareDto,
  UpdateGardenShareDto,
} from './dto/garden-share.dto';

@Controller('garden-visualization')
@UseGuards(JwtAuthGuard)
export class GardenVisualizationController {
  constructor(
    private readonly gardenThemesService: GardenThemesService,
    private readonly gardenLayoutsService: GardenLayoutsService,
    private readonly garden3dViewsService: Garden3dViewsService,
    private readonly gardenSharesService: GardenSharesService
  ) {}

  // ===== GARDEN THEMES =====

  @Post('themes')
  async createTheme(
    @Body() createThemeDto: CreateGardenThemeDto,
    @Request() req
  ) {
    return this.gardenThemesService.createTheme(createThemeDto, req.user.id);
  }

  @Get('themes')
  async getThemes(@Query() query: any) {
    return this.gardenThemesService.getThemes(query);
  }

  @Get('themes/available')
  async getAvailableThemes(@Request() req) {
    return this.gardenThemesService.getAvailableThemes(req.user.id);
  }

  @Get('themes/seasonal')
  async getSeasonalThemes(@Query('season') season?: string) {
    return this.gardenThemesService.getSeasonalThemes(season as any);
  }

  @Get('themes/default')
  async getDefaultThemes() {
    return this.gardenThemesService.getDefaultThemes();
  }

  @Get('themes/search')
  async searchThemes(@Query('q') query: string, @Query() filters: any) {
    return this.gardenThemesService.searchThemes(query, filters);
  }

  @Get('themes/:id')
  async getTheme(@Param('id') id: string) {
    return this.gardenThemesService.getTheme(id);
  }

  @Put('themes/:id')
  async updateTheme(
    @Param('id') id: string,
    @Body() updateThemeDto: UpdateGardenThemeDto,
    @Request() req
  ) {
    return this.gardenThemesService.updateTheme(
      id,
      updateThemeDto,
      req.user.id
    );
  }

  @Delete('themes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTheme(@Param('id') id: string, @Request() req) {
    await this.gardenThemesService.deleteTheme(id, req.user.id);
  }

  @Post('themes/:id/rate')
  async rateTheme(
    @Param('id') id: string,
    @Body('rating') rating: number,
    @Request() req
  ) {
    return this.gardenThemesService.rateTheme(id, rating, req.user.id);
  }

  // ===== GARDEN LAYOUTS =====

  @Post('layouts')
  async createLayout(
    @Body() createLayoutDto: CreateGardenLayoutDto,
    @Request() req
  ) {
    return this.gardenLayoutsService.createLayout(createLayoutDto, req.user.id);
  }

  @Get('layouts')
  async getLayouts(@Query() query: any) {
    return this.gardenLayoutsService.getLayouts(query);
  }

  @Get('layouts/public')
  async getPublicLayouts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query() filters: any
  ) {
    return this.gardenLayoutsService.getPublicLayouts(page, limit, filters);
  }

  @Get('layouts/user')
  async getUserLayouts(
    @Request() req,
    @Query('includePrivate') includePrivate: boolean = true
  ) {
    return this.gardenLayoutsService.getUserLayouts(
      req.user.id,
      includePrivate
    );
  }

  @Get('layouts/featured')
  async getFeaturedLayouts() {
    return this.gardenLayoutsService.getFeaturedLayouts();
  }

  @Get('layouts/search')
  async searchLayouts(@Query('q') query: string, @Query() filters: any) {
    return this.gardenLayoutsService.searchLayouts(query, filters);
  }

  @Get('layouts/:id')
  async getLayout(@Param('id') id: string, @Request() req) {
    return this.gardenLayoutsService.getLayout(id, req.user.id);
  }

  @Put('layouts/:id')
  async updateLayout(
    @Param('id') id: string,
    @Body() updateLayoutDto: UpdateGardenLayoutDto,
    @Request() req
  ) {
    return this.gardenLayoutsService.updateLayout(
      id,
      updateLayoutDto,
      req.user.id
    );
  }

  @Delete('layouts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLayout(@Param('id') id: string, @Request() req) {
    await this.gardenLayoutsService.deleteLayout(id, req.user.id);
  }

  @Post('layouts/:id/publish')
  async publishLayout(@Param('id') id: string, @Request() req) {
    return this.gardenLayoutsService.publishLayout(id, req.user.id);
  }

  @Post('layouts/:id/archive')
  async archiveLayout(@Param('id') id: string, @Request() req) {
    return this.gardenLayoutsService.archiveLayout(id, req.user.id);
  }

  @Post('layouts/:id/like')
  async likeLayout(@Param('id') id: string, @Request() req) {
    return this.gardenLayoutsService.likeLayout(id, req.user.id);
  }

  @Post('layouts/:id/download')
  async downloadLayout(@Param('id') id: string, @Request() req) {
    return this.gardenLayoutsService.downloadLayout(id, req.user.id);
  }

  @Post('layouts/:id/rate')
  async rateLayout(
    @Param('id') id: string,
    @Body('rating') rating: number,
    @Request() req
  ) {
    return this.gardenLayoutsService.rateLayout(id, rating, req.user.id);
  }

  // ===== 3D GARDEN VIEWS =====

  @Post('3d-views')
  async create3dView(
    @Body() create3dViewDto: CreateGarden3dViewDto,
    @Request() req
  ) {
    return this.garden3dViewsService.create3dView(create3dViewDto, req.user.id);
  }

  @Get('3d-views')
  async get3dViews(@Query() query: any) {
    return this.garden3dViewsService.get3dViews(query);
  }

  @Get('3d-views/public')
  async getPublic3dViews() {
    return this.garden3dViewsService.getPublic3dViews();
  }

  @Get('3d-views/user')
  async getUser3dViews(
    @Request() req,
    @Query('includePrivate') includePrivate: boolean = true
  ) {
    return this.garden3dViewsService.getUser3dViews(
      req.user.id,
      includePrivate
    );
  }

  @Get('3d-views/camera-presets')
  async getCameraPresets() {
    return this.garden3dViewsService.getCameraPresets();
  }

  @Get('3d-views/view-mode/:viewMode')
  async getViewModePresets(@Param('viewMode') viewMode: string) {
    return this.garden3dViewsService.getViewModePresets(viewMode as any);
  }

  @Get('3d-views/search')
  async search3dViews(@Query('q') query: string, @Query() filters: any) {
    return this.garden3dViewsService.search3dViews(query, filters);
  }

  @Get('3d-views/:id')
  async get3dView(@Param('id') id: string, @Request() req) {
    return this.garden3dViewsService.get3dView(id, req.user.id);
  }

  @Put('3d-views/:id')
  async update3dView(
    @Param('id') id: string,
    @Body() update3dViewDto: UpdateGarden3dViewDto,
    @Request() req
  ) {
    return this.garden3dViewsService.update3dView(
      id,
      update3dViewDto,
      req.user.id
    );
  }

  @Delete('3d-views/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete3dView(@Param('id') id: string, @Request() req) {
    await this.garden3dViewsService.delete3dView(id, req.user.id);
  }

  @Post('3d-views/:id/rate')
  async rate3dView(
    @Param('id') id: string,
    @Body('rating') rating: number,
    @Request() req
  ) {
    return this.garden3dViewsService.rate3dView(id, rating, req.user.id);
  }

  // ===== GARDEN SHARES =====

  @Post('shares')
  async createShare(
    @Body() createShareDto: CreateGardenShareDto,
    @Request() req
  ) {
    return this.gardenSharesService.createShare(createShareDto, req.user.id);
  }

  @Get('shares')
  async getShares(@Query() query: any) {
    return this.gardenSharesService.getShares(query);
  }

  @Get('shares/public')
  async getPublicShares(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query() filters: any
  ) {
    return this.gardenSharesService.getPublicShares(page, limit, filters);
  }

  @Get('shares/user')
  async getUserShares(
    @Request() req,
    @Query('includePrivate') includePrivate: boolean = true
  ) {
    return this.gardenSharesService.getUserShares(req.user.id, includePrivate);
  }

  @Get('shares/featured')
  async getFeaturedShares() {
    return this.gardenSharesService.getFeaturedShares();
  }

  @Get('shares/search')
  async searchShares(@Query('q') query: string, @Query() filters: any) {
    return this.gardenSharesService.searchShares(query, filters);
  }

  @Get('shares/:id')
  async getShare(@Param('id') id: string, @Request() req) {
    return this.gardenSharesService.getShare(id, req.user.id);
  }

  @Get('shares/code/:shareCode')
  async getShareByCode(@Param('shareCode') shareCode: string, @Request() req) {
    return this.gardenSharesService.getShareByCode(shareCode, req.user.id);
  }

  @Put('shares/:id')
  async updateShare(
    @Param('id') id: string,
    @Body() updateShareDto: UpdateGardenShareDto,
    @Request() req
  ) {
    return this.gardenSharesService.updateShare(
      id,
      updateShareDto,
      req.user.id
    );
  }

  @Delete('shares/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteShare(@Param('id') id: string, @Request() req) {
    await this.gardenSharesService.deleteShare(id, req.user.id);
  }

  @Post('shares/:id/like')
  async likeShare(@Param('id') id: string, @Request() req) {
    return this.gardenSharesService.likeShare(id, req.user.id);
  }

  @Post('shares/:id/download')
  async downloadShare(@Param('id') id: string, @Request() req) {
    return this.gardenSharesService.downloadShare(id, req.user.id);
  }

  @Post('shares/:id/rate')
  async rateShare(
    @Param('id') id: string,
    @Body('rating') rating: number,
    @Request() req
  ) {
    return this.gardenSharesService.rateShare(id, rating, req.user.id);
  }

  @Post('shares/:id/report')
  async reportShare(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req
  ) {
    await this.gardenSharesService.reportShare(id, req.user.id, reason);
  }

  // ===== COMBINED ENDPOINTS =====

  @Get('dashboard')
  async getDashboard(@Request() req) {
    const [themes, layouts, views, shares] = await Promise.all([
      this.gardenThemesService.getAvailableThemes(req.user.id),
      this.gardenLayoutsService.getUserLayouts(req.user.id, false),
      this.garden3dViewsService.getUser3dViews(req.user.id, false),
      this.gardenSharesService.getUserShares(req.user.id, false),
    ]);

    return {
      themes: themes.slice(0, 5),
      layouts: layouts.slice(0, 5),
      views: views.slice(0, 5),
      shares: shares.slice(0, 5),
      stats: {
        totalThemes: themes.length,
        totalLayouts: layouts.length,
        totalViews: views.length,
        totalShares: shares.length,
      },
    };
  }

  @Get('explore')
  async exploreContent(@Query() query: any) {
    const [featuredThemes, featuredLayouts, featuredViews, featuredShares] =
      await Promise.all([
        this.gardenThemesService.getDefaultThemes(),
        this.gardenLayoutsService.getFeaturedLayouts(),
        this.garden3dViewsService.getCameraPresets(),
        this.gardenSharesService.getFeaturedShares(),
      ]);

    return {
      themes: featuredThemes,
      layouts: featuredLayouts,
      views: featuredViews,
      shares: featuredShares,
    };
  }

  @Post('initialize-defaults')
  async initializeDefaults() {
    await this.garden3dViewsService.createDefaultPresets();
    return { message: 'Default presets initialized successfully' };
  }
}
