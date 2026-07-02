import prisma from '../infrastructure/database/prisma.client';
import { teacherService } from '../modules/teacher/teacher.service';

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'namateacher@yopmail.com' }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  console.log('Testing endpoints for user:', user.email, 'ID:', user.id);

  try {
    const profile = await teacherService.getMyProfile(user.id);
    console.log('Profile found:', profile);
  } catch (err: any) {
    console.log('Profile error status/message:', err.message || err);
  }

  try {
    const app = await teacherService.getMyApplication(user.id);
    console.log('Application found:', app);
  } catch (err: any) {
    console.log('Application error status/message:', err.message || err);
  }
}

main().catch(console.error);
