import { Worker } from 'bullmq';
import { connection } from './queue.client';
import prisma from '../database/prisma.client';
import { s3Client } from '../storage/s3.client';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import logger from '../logger/logger';
import { payoutsService } from '../../modules/payouts/payouts.service';
import { aiReportsService } from '../../modules/ai-reports/ai-reports.service';

export const pdfWorker = new Worker(
  'pdf-generation',
  async (job) => {
    const { userId, courseId, certificateId } = job.data;
    logger.info({ jobId: job.id, userId, courseId }, 'Processing PDF certificate generation');

    // 1. Fetch User & Course details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!user || !course) {
      throw new Error(`User or Course not found for certificate generation. User: ${userId}, Course: ${courseId}`);
    }

    const studentName = user.profile
      ? `${user.profile.firstName} ${user.profile.lastName}`.trim()
      : user.email;

    // 2. Generate mock PDF buffer
    const mockPdfText = `%PDF-1.4
%
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << >> /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 150 >>
stream
BT
/F1 24 Tf
100 700 Td
(NAMA WELLNESS CERTIFICATE OF COMPLETION) Tj
/F1 14 Tf
0 -50 Td
(This is to certify that ${studentName} has successfully completed the course ${course.title}.) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000120 00000 n 
0000000219 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
420
%%EOF`;
    const buffer = Buffer.from(mockPdfText, 'utf-8');

    // 3. Upload to S3 (bucket: S3_BUCKET_MEDIA or similar, or just name a bucket key)
    const bucketName = process.env.S3_BUCKET_MEDIA || 'nama-wellness-media';
    const s3Key = `certificates/${certificateId}.pdf`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: buffer,
        ContentType: 'application/pdf'
      })
    );

    const certificateUrl = `s3://${bucketName}/${s3Key}`;
    const qrCodeUrl = `https://namawellness.com/certificates/verify/${certificateId}`;

    // 4. Update the Certificate record status to 'approved' or 'issued' / 'completed'
    await prisma.certificate.update({
      where: { id: certificateId },
      data: {
        status: 'approved',
        certificateUrl,
        qrCodeUrl
      }
    });

    logger.info({ jobId: job.id, certificateId }, 'PDF Certificate generated and S3 uploaded successfully.');
  },
  { connection }
);

pdfWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'PDF Certificate generation job failed');
});

export const payoutWorker = new Worker(
  'monthly-payout',
  async (job) => {
    const { startDate, endDate } = job.data;
    logger.info({ jobId: job.id, startDate, endDate }, 'Processing monthly payout calculations');
    
    const result = await payoutsService.calculateMonthlyPayouts(new Date(startDate), new Date(endDate));
    logger.info({ jobId: job.id, count: result.count }, 'Monthly payout calculations completed successfully');
  },
  { connection }
);

payoutWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Monthly payout calculation job failed');
});

export const aiReportsWorker = new Worker(
  'ai-reports',
  async (job) => {
    const { reportId } = job.data;
    logger.info({ jobId: job.id, reportId }, 'Processing background AI report generation');
    await aiReportsService.generateReportSync(reportId);
  },
  { connection }
);

aiReportsWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'AI wellness report generation job failed');
});

export default pdfWorker;
