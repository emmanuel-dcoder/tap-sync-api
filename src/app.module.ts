import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { envConfig } from './core/config/env.config';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { TapsModule } from './taps/taps.module';
import { UserDashboardModule } from './user-dashboard/dashboard.module';

@Module({
  imports: [
    MongooseModule.forRoot(envConfig.database.mongo_url),
    AdminModule,
    UserModule,
    TapsModule,
    UserDashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
