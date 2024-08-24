// import { NestFactory } from '@nestjs/core';
// import { AppModule } from '../app.module';
// import { SubscriptionPlanSeederService } from 'src/seeds/subscription-plan.seeder.service';

// async function bootstrap() {
//   const app = await NestFactory.createApplicationContext(AppModule);

//   const seederService = app.get(SubscriptionPlanSeederService);
//   await seederService.seed();

//   console.log('Seeding completed');
//   await app.close();
// }

// bootstrap();


import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SubscriptionPlanSeederService } from 'src/seeds/subscription-plan.seeder.service';
import { CountrySeederService } from 'src/seeds/country.seeder.service';
import { ValidationCodeSeederService } from 'src/seeds/validation-code.seeder.service';
import { UserSeederService } from 'src/seeds/user.seeder.service';
import { FontSeederService } from 'src/seeds/fonts.seeder.service';


async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const seederService = app.get(SubscriptionPlanSeederService);
  const seederCountry = app.get(CountrySeederService);
  const seederValidationCode = app.get(ValidationCodeSeederService);
  const seederFont = app.get(FontSeederService);
  const seederUser = app.get(UserSeederService);



  await seederService.seed();
  await seederCountry.seed();
  await seederValidationCode.seed();
  await seederFont.seed();
  await seederUser.seed();




  console.log('Seeding completed');
  await app.close();
}

bootstrap();
