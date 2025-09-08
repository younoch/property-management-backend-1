import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

declare module '@nestjs/typeorm' {
  interface TypeOrmModuleFeatureOptions {
    name: string;
    schema?: string;
  }

  interface TypeOrmModule {
    forFeature(
      entities: (string | EntityClassOrSchema)[],
      dataSource?: string | DataSource,
    ): DynamicModule;
  }
}
