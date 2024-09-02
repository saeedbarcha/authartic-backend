// src/modules/font/entities/font.entity.ts
import { DefaultEntity } from 'src/modules/common/default.entity';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Font extends DefaultEntity {

    @Column()
    name: string;

    @Column()
    family: string;
}
