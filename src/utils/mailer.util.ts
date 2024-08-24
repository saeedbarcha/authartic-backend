// import * as nodemailer from 'nodemailer';

// // export const createTransporter = () => {
// //   return nodemailer.createTransport({
// //     host: process.env.EMAIL_HOST,
// //     port: parseInt(process.env.EMAIL_PORT, 10),
// //     secure: process.env.EMAIL_SECURE === 'true', 
// //     auth: {
// //       user: process.env.EMAIL_USER,
// //       pass: process.env.EMAIL_PASS,
// //     },
// //   });
// // };

// export const createTransporter = () => {
//     return nodemailer.createTransport({
//       host: "smtp.gmail.com",
//       port: 587,
//       secure: "true", 
//       auth: {
//         user: "saeedbarcha77@gmail.com",
//         pass: "eqvsvqrnkqmnezng",
//       },
//       tls: {
//         rejectUnauthorized: false, // Use this only if you're sure about the security implications
//       },
//     });
//   };

// // export const SMTP_APP_NAME = "Lubick";
// // export const SMTP_HOST = "smtp.gmail.com";
// // export const SMTP_PORT = 587;
// // export const SMTP_SERVICE = "gmail";
// // export const SMTP_MAIL = "saeedbarcha77@gmail.com";
// // export const SMTP_PASSWORD = "eqvsvqrnkqmnezng";
// // export const SMTP_AdminEmail = "saeed.austere@gmail.com";



import * as nodemailer from 'nodemailer';

export const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, 
    auth: {
      user: "saeedbarcha77@gmail.com",
      pass: "eqvsvqrnkqmnezng",
    },
    tls: {
      rejectUnauthorized: false, 
    },
  });
};
