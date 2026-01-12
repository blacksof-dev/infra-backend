import { Module } from '@nestjs/common';
import { InfrashaktiAwardTypeModule } from './award-types/award-type.module';
import { InfrashaktiAwardeeModule } from './awardees/awardee.module';
import { InfrashaktiCeremonySceneModule } from './ceremony-scenes/ceremony-scene.module';

@Module({
  imports: [
    InfrashaktiAwardTypeModule,
    InfrashaktiAwardeeModule,
    InfrashaktiCeremonySceneModule,
  ],
  exports: [
    InfrashaktiAwardTypeModule,
    InfrashaktiAwardeeModule,
    InfrashaktiCeremonySceneModule,
  ],
})
export class InfrashaktiModule {}
