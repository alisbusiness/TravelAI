import nodemailer from 'nodemailer';
import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.js';

export function createTransport() {
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 587,
      secure: env.SMTP_SECURE ?? false,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  // Dev fallback: write emails to file
  const dir = path.resolve(env.DEV_EMAIL_FILE_DIR);
  fs.mkdirSync(dir, { recursive: true });
  return {
    async sendMail(opts: any) {
      const file = path.join(dir, `${Date.now()}-${Math.random().toString(36).slice(2)}.txt`);
      const content = `TO: ${opts.to}\nSUBJECT: ${opts.subject}\n\n${opts.text || ''}\n${opts.html || ''}`;
      await fs.promises.writeFile(file, content, 'utf8');
      return { messageId: file } as any;
    },
  } as nodemailer.Transporter;
}

