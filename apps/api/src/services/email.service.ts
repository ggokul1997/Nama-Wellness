import nodemailer from 'nodemailer';
import prisma from '../infrastructure/database/prisma.client';
import logger from '../infrastructure/logger/logger';

export interface SendEmailOptions {
  to: string;
  template: 'verify' | 'invite' | 'class_reminder';
  subject: string;
  context: Record<string, string>;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private provider: string;
  private fromEmail: string;

  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'mock';
    this.fromEmail = process.env.EMAIL_FROM || 'Nama Wellness <no-reply@namawellness.com>';

    if (this.provider === 'smtp') {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '1025', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS || ''
            }
          : undefined
      });
    }
  }

  private renderTemplate(template: string, context: Record<string, string>): string {
    let html = '';

    if (template === 'verify') {
      html = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4F46E5;">Welcome to Nama Wellness</h2>
          <p>Please verify your email address by entering the following OTP verification code:</p>
          <div style="background: #F3F4F6; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 2px; text-align: center; border-radius: 6px; margin: 20px 0;">
            ${context.code || ''}
          </div>
          <p>This code will expire in 15 minutes.</p>
          <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9CA3AF;">If you did not request this, you can safely ignore this email.</p>
        </div>
      `;
    } else if (template === 'invite') {
      html = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4F46E5;">Corporate Invitation</h2>
          <p>You have been invited to join <strong>${context.companyName || 'your company'}</strong> on Nama Wellness.</p>
          <p>Click the link below to complete your employee registration and access your company's wellness programs:</p>
          <div style="margin: 25px 0;">
            <a href="${context.link || '#'}" style="background: #4F46E5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Accept Invitation & Register
            </a>
          </div>
          <p>Or copy this link: <a href="${context.link || '#'}">${context.link || ''}</a></p>
          <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9CA3AF;">If you did not request this, you can safely ignore this email.</p>
        </div>
      `;
    } else if (template === 'class_reminder') {
      html = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4F46E5;">Live Session Reminder</h2>
          <p>Hi <strong>${context.studentName || 'there'}</strong>,</p>
          <p>This is a reminder that your live session <strong>${context.sessionTitle || ''}</strong> is scheduled to start soon!</p>
          <div style="background: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <strong>Scheduled Time:</strong> ${context.scheduledAt || ''}<br />
            <strong>Join Link:</strong> <a href="${context.meetLink || '#'}">Join Live Class</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9CA3AF;">Need to make changes? Go to your portal dashboard.</p>
        </div>
      `;
    }

    return html;
  }

  async sendEmail(options: SendEmailOptions) {
    const html = this.renderTemplate(options.template, options.context);
    let status = 'sent';
    let errorMessage: string | null = null;

    if (this.provider === 'smtp' && this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.fromEmail,
          to: options.to,
          subject: options.subject,
          html
        });
      } catch (err: any) {
        status = 'failed';
        errorMessage = err.message || 'Unknown SMTP error';
        logger.error({ err, to: options.to }, 'Failed to dispatch email via SMTP');
      }
    } else {
      // Mock provider
      logger.info(
        {
          to: options.to,
          subject: options.subject,
          template: options.template,
          context: options.context
        },
        'Mock Email Dispatch: Email triggered successfully'
      );
    }

    // Persist dispatch history in notification_logs table
    try {
      const user = await prisma.user.findFirst({
        where: { email: options.to }
      });

      if (user) {
        await prisma.notificationLog.create({
          data: {
            userId: user.id,
            channel: 'email',
            template: options.template,
            subject: options.subject,
            content: html,
            status,
            error: errorMessage
          }
        });
      }
    } catch (dbErr) {
      logger.error({ err: dbErr }, 'Failed to persist notification dispatch log');
    }

    return { status, error: errorMessage };
  }
}

export const emailService = new EmailService();
export default emailService;
