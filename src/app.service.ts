import { Injectable } from '@nestjs/common';
import {UserSeederService} from "./seeds/user.seeder.service";

@Injectable()
export class AppService {

  constructor(private readonly userSeederService: UserSeederService) { }

  getHello(): string {
    return 'Hello World!';
  }

  
  seedUser(createUserDto): any {
    return this.userSeederService.seedUser(createUserDto)
  }
 
}
