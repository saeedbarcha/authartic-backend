import { Entity, Column, OneToMany } from 'typeorm';
import { DefaultEntity } from 'src/modules/common/default.entity';
import { User } from 'src/modules/user/entities/user.entity';




@Entity()
export class Country extends DefaultEntity {

    @Column()
    name: string;

    @Column({ unique: true })
    code: string;

    @OneToMany(() => User, user => user.country)
    users: User[];
}

