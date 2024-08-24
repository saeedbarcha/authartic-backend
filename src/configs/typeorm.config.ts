import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const SnakeNamingStrategy = require('typeorm-naming-strategies')
    .SnakeNamingStrategy;
export const typeOrmConfig =
{
    imports: [ConfigModule], 
    useFactory: (configService: ConfigService) => ({
        type: 'postgres', 
        host: configService.get('DATABASE_HOST'),
        port: +configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'], 
        synchronize: true, 
        timezone: 'Z',
        namingStrategy: new SnakeNamingStrategy(),
    } as TypeOrmModuleOptions),
    inject: [ConfigService], 
}