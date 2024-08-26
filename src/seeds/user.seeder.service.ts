import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserRoleEnum } from 'src/modules/user/enum/user.role.enum';
import * as bcrypt from 'bcrypt';
import { User } from 'src/modules/user/entities/user.entity';

@Injectable()
export class UserSeederService {
    constructor(private dataSource: DataSource) { }

    async seed() {
       
        const adminUser = {
            user_name: 'user',
            email: 'admin@gmail.com',
            phone: '0311111111',
            password: '123456',
            date_of_birth: '2024-02-02',
            role: UserRoleEnum.ADMIN, 
            country_id: 1
        };

        await this.seedUser(adminUser);

        console.log('Seeding users completed');
    }

    async seedUser(createUserDto: any) {
        // Hash password if needed (example with bcrypt)
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        createUserDto.password = hashedPassword;

        const newUser = new User();
        Object.assign(newUser, createUserDto);

        // Save the user to the database
        return await this.dataSource.getRepository(User).save(newUser);
    }
}
