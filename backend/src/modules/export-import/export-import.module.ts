import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataExport } from '../../database/entities/data-export.entity';
import { DataImport } from '../../database/entities/data-import.entity';
import { Backup } from '../../database/entities/backup.entity';
import { User } from '../../database/entities/user.entity';
import { ExportImportController } from './export-import.controller';
import { DataExportsService } from './data-exports.service';
import { DataImportsService } from './data-imports.service';
import { BackupsService } from './backups.service';

@Module({
  imports: [TypeOrmModule.forFeature([DataExport, DataImport, Backup, User])],
  controllers: [ExportImportController],
  providers: [DataExportsService, DataImportsService, BackupsService],
  exports: [DataExportsService, DataImportsService, BackupsService],
})
export class ExportImportModule {}
