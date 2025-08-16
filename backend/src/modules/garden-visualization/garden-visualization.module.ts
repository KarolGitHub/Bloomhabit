import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GardenVisualizationController } from './garden-visualization.controller';
import { GardenThemesService } from './garden-themes.service';
import { GardenLayoutsService } from './garden-layouts.service';
import { Garden3dViewsService } from './garden-3d-views.service';
import { GardenSharesService } from './garden-shares.service';
import { GardenTheme } from '../../database/entities/garden-theme.entity';
import { GardenLayout } from '../../database/entities/garden-layout.entity';
import { Garden3dView } from '../../database/entities/garden-3d-view.entity';
import { GardenShare } from '../../database/entities/garden-share.entity';
import { User } from '../../database/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GardenTheme,
      GardenLayout,
      Garden3dView,
      GardenShare,
      User,
    ]),
  ],
  controllers: [GardenVisualizationController],
  providers: [
    GardenThemesService,
    GardenLayoutsService,
    Garden3dViewsService,
    GardenSharesService,
  ],
  exports: [
    GardenThemesService,
    GardenLayoutsService,
    Garden3dViewsService,
    GardenSharesService,
  ],
})
export class GardenVisualizationModule {}
