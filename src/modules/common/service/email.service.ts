import { Injectable } from '@nestjs/common';
import * as formData from 'form-data';
import Mailgun from 'mailgun.js';
import { ReportProblemStatusEnum } from '../report-problem-status.enum';


@Injectable()
export class MailService {
    private readonly backendUrl: string = process.env.BACKEND_URL;
    private readonly baseEmail: string = process.env.BASE_EMAIL;
    private readonly adminEmail: string = process.env.ADMIN_EMAIL;
    private mg;

    constructor() {
        const mailgun = new Mailgun(formData);
        this.mg = mailgun.client({
            username: 'api',
            key: process.env.MAILGUN_API_KEY,
        });
    }

    async sendGreetingEmail(email: string, username: string): Promise<void> {
        const data = {
            from: `${this.baseEmail}`,
            to: [email],
            subject: 'Welcome to Our Service',
            text: `Hello ${username}, welcome to our service!`,
            html: `
             <div style="width: 100%; background-color: #22477F; padding: 10px 0; text-align: center;">
                    <h1 style="color: white; margin: 0;">Authartic</h1>
                </div>
            <h1>Hello ${username},</h1><p>Welcome to our service!</p>
                 <div style="width: 100%; height:20px; background-color: #22477F; padding: 2; text-align: center;"></div>
            `,
        };

        await this.mg.messages.create(process.env.MAILGUN_DOMAIN, data);
    }

    async sendActivationEmail(email: string, token: string): Promise<void> {
        const activationLink = `${this.backendUrl}/api/v1/user/activate-vendor-account?token=${token}`;

        const data = {
            from: this.baseEmail,
            to: [email],
            subject: 'Account Activation',
            text: `Welcome to Authartic! Please use the following link to activate your account: ${activationLink}. If you do not verify/activate your account within 14 days, it will be deleted.`,
            html: `
                <div style="width: 100%; background-color: #22477F; padding: 10px 0; text-align: center;">
                    <h1 style="color: white; margin: 0;">Authartic</h1>
                </div>
                <div style="padding: 20px;">
                    <p>Welcome to Authartic!</p>
                    <p>Please click the below button to activate your account:</p>
                    <a href="${activationLink}" style="display: inline-block; padding: 10px 20px; background-color: #22477F; color: white; text-decoration: none; border-radius: 5px;">Activate Account</a>
                    <p>If you do not verify your account within 14 days, it will be deleted.</p>
                </div>
                 <div style="width: 100%; height:20px; background-color: #22477F; padding: 2; text-align: center;"></div>
            `,
        };

        await this.mg.messages.create(process.env.MAILGUN_DOMAIN, data);
    }

    async sendOtpEmail(email: string, otp: string): Promise<void> {
        const data = {
            from: this.baseEmail,
            to: [email],
            subject: 'Account Verification - Your OTP Code',
            text: `Welcome to Authartic! Your one-time password (OTP) for account verification is: ${otp}. Please use this code to verify your account. If you do not verify your account within 14 days, it will be deleted.`,
            html: `
                <div style="width: 100%; background-color: #22477F; padding: 10px 0; text-align: center;">
                    <h1 style="color: white; margin: 0;">Authartic</h1>
                </div>
                <div style="padding: 20px;">
                    <p>Welcome to Authartic!</p>
                    <p>Your one-time password (OTP) for account verification is:</p>
                    <div style="font-size: 24px; font-weight: bold; margin: 10px 0;">${otp}</div>
                    <p>Please use this code to verify your account. If you do not verify your account within 14 days, it will be deleted.</p>
                </div>
                <div style="width: 100%; height:20px; background-color: #22477F; padding: 2; text-align: center;"></div>
            `,
        };
    
        await this.mg.messages.create(process.env.MAILGUN_DOMAIN, data);
    }
    
    async sendCertificateInfoZip(email: string, zipBuffer: Buffer): Promise<void> {
        const data = {
            from: this.baseEmail,
            to: [email],
            subject: 'Your Certificate Information',
            text: 'Please find attached the ZIP file containing your certificates.',
            attachment: {
                filename: 'certificates.zip',
                data: zipBuffer,
            },
        };

        await this.mg.messages.create(process.env.MAILGUN_DOMAIN, data);
    }

    async sendReportEmail(reportId: number, certificateId: number, reportText: string, vendorEmail: string): Promise<void> {
        const data = {
            from: this.baseEmail,
            to: [this.adminEmail],
            subject: 'New Report Submitted',
            text: `A new report has been submitted by ${vendorEmail}. Certificate ID: ${certificateId}, Report ID: ${reportId}, Problem Statement: ${reportText}`,
            html: `
                <div style="width: 100%; background-color: #22477F; padding: 10px 0; text-align: center;">
                    <h1 style="color: white; margin: 0;">Authartic</h1>
                </div>
                <p>A new report has been submitted by ${vendorEmail}.</p><p>Certificate ID: ${certificateId}</p> <p>Report ID: ${reportId}</p><p>Problem Statement: ${reportText}</p>
                 <div style="width: 100%; height:20px; background-color: #22477F; padding: 2; text-align: center;"></div>
                `,
        };

        await this.mg.messages.create(process.env.MAILGUN_DOMAIN, data);
    }


    async sendReportResponseEmail(reportId: number, certificateId: number, responseText: string, status: ReportProblemStatusEnum, vendorDetails: any): Promise<void> {
        let subject: string;
        let text: string;
        let html: string;

        switch (status) {
            case ReportProblemStatusEnum.OPEN:
                subject = 'Your Problem Report is Open';
                text = `Dear ${vendorDetails.user_name},\n\nYour problem report (Report ID: ${reportId}) regarding Certificate ID: ${certificateId} has been opened and is awaiting further action.\n\nThank you for bringing this to our attention.\n\nBest regards,\nAuthartic Team`;
                html = `
                    <div style="width: 100%; background-color: #22477F; padding: 10px 0; text-align: center;">
                        <h1 style="color: white; margin: 0;">Authartic</h1>
                    </div>
                    <div style="padding: 20px;">
                        <p>Dear ${vendorDetails.user_name},</p>
                        <p>Your problem report (Report ID: ${reportId}) regarding Certificate ID: ${certificateId} has been opened and is awaiting further action.</p>
                        <p>Thank you for bringing this to our attention.</p>
                        <p>Best regards,</p>
                        <p>Authartic Team</p>
                    </div>
                    <div style="width: 100%; height: 20px; background-color: #22477F; padding: 2px; text-align: center;"></div>
                `;
                break;
            case ReportProblemStatusEnum.IN_PROGRESS:
                subject = 'Your Problem Report is In Progress';
                text = `Dear ${vendorDetails.user_name},\n\nYour problem report (Report ID: ${reportId}) regarding Certificate ID: ${certificateId} is currently being reviewed and addressed.\n\nThank you for your patience.\n\nBest regards,\nAuthartic Team`;
                html = `
                    <div style="width: 100%; background-color: #22477F; padding: 10px 0; text-align: center;">
                        <h1 style="color: white; margin: 0;">Authartic</h1>
                    </div>
                    <div style="padding: 20px;">
                        <p>Dear ${vendorDetails.user_name},</p>
                        <p>Your problem report (Report ID: ${reportId}) regarding Certificate ID: ${certificateId} is currently being reviewed and addressed.</p>
                        <p>Thank you for your patience.</p>
                        <p>Best regards,</p>
                        <p>Authartic Team</p>
                    </div>
                    <div style="width: 100%; height: 20px; background-color: #22477F; padding: 2px; text-align: center;"></div>
                `;
                break;
            case ReportProblemStatusEnum.RESOLVED:
                subject = 'Your Problem Report is Resolved';
                text = `Dear ${vendorDetails.user_name},\n\nYour problem report (Report ID: ${reportId}) regarding Certificate ID: ${certificateId} has been resolved. Here is our response:\n\n${responseText}\n\nThank you for bringing this to our attention.\n\nBest regards,\nAuthartic Team`;
                html = `
                    <div style="width: 100%; background-color: #22477F; padding: 10px 0; text-align: center;">
                        <h1 style="color: white; margin: 0;">Authartic</h1>
                    </div>
                    <div style="padding: 20px;">
                        <p>Dear ${vendorDetails.user_name},</p>
                        <p>Your problem report (Report ID: ${reportId}) regarding Certificate ID: ${certificateId} has been resolved. Here is our response:</p>
                        <p>${responseText}</p>
                        <p>Thank you for bringing this to our attention.</p>
                        <p>Best regards,</p>
                        <p>Authartic Team</p>
                    </div>
                    <div style="width: 100%; height: 20px; background-color: #22477F; padding: 2px; text-align: center;"></div>
                `;
                break;
            case ReportProblemStatusEnum.REJECTED:
                subject = 'Your Problem Report is Rejected';
                text = `Dear ${vendorDetails.user_name},\n\nYour problem report (Report ID: ${reportId}) regarding Certificate ID: ${certificateId} has been reviewed and rejected. Here is our response:\n\n${responseText}\n\nThank you for bringing this to our attention.\n\nBest regards,\nAuthartic Team`;
                html = `
                    <div style="width: 100%; background-color: #22477F; padding: 10px 0; text-align: center;">
                        <h1 style="color: white; margin: 0;">Authartic</h1>
                    </div>
                    <div style="padding: 20px;">
                        <p>Dear ${vendorDetails.user_name},</p>
                        <p>Your problem report (Report ID: ${reportId}) regarding Certificate ID: ${certificateId} has been reviewed and rejected. Here is our response:</p>
                        <p>${responseText}</p>
                        <p>Thank you for bringing this to our attention.</p>
                        <p>Best regards,</p>
                        <p>Authartic Team</p>
                    </div>
                    <div style="width: 100%; height: 20px; background-color: #22477F; padding: 2px; text-align: center;"></div>
                `;
                break;
            default:
                subject = 'Response to Your Problem Report';
                text = `Dear ${vendorDetails.user_name},\n\nWe have reviewed your problem report (Report ID: ${reportId}) regarding Certificate ID: ${certificateId}. Here is our response:\n\n${responseText}\n\nThank you for bringing this to our attention.\n\nBest regards,\nAuthartic Team`;
                html = `
                    <div style="width: 100%; background-color: #22477F; padding: 10px 0; text-align: center;">
                        <h1 style="color: white; margin: 0;">Authartic</h1>
                    </div>
                    <div style="padding: 20px;">
                        <p>Dear ${vendorDetails.user_name},</p>
                        <p>We have reviewed your problem report (Report ID: ${reportId}) regarding Certificate ID: ${certificateId}. Here is our response:</p>
                        <p>${responseText}</p>
                        <p>Thank you for bringing this to our attention.</p>
                        <p>Best regards,</p>
                        <p>Authartic Team</p>
                    </div>
                    <div style="width: 100%; height: 20px; background-color: #22477F; padding: 2px; text-align: center;"></div>
                `;
                break;
        }

        const data = {
            from: this.adminEmail,
            to: [vendorDetails.email],
            subject: subject,
            text: text,
            html: html,
        };

        await this.mg.messages.create(process.env.MAILGUN_DOMAIN, data);
    }

    async sendMail(mailOptions: {
        from: string;
        to: string | string[];
        subject: string;
        text?: string;
        html?: string;
        attachment?: { filename: string; data: Buffer }[];
    }): Promise<void> {

        if (!mailOptions.to) {
            throw new Error('No recipients defined');
        }

        const data: any = {
            from: mailOptions.from,
            to: Array.isArray(mailOptions.to) ? mailOptions.to.join(', ') : mailOptions.to,
            subject: mailOptions.subject,
            text: mailOptions.text,
            html: mailOptions.html,
        };

        if (mailOptions.attachment && mailOptions.attachment.length > 0) {
            data.attachment = mailOptions.attachment.map((att) => ({
                filename: att.filename,
                data: att.data,
            }));
        }

        await this.mg.messages.create(process.env.MAILGUN_DOMAIN, data);
    }

}

