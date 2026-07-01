import prisma from '../../infrastructure/database/prisma.client';

export class AttendanceRepository {
  async joinSession(sessionId: string, userId: string) {
    return prisma.attendanceRecord.upsert({
      where: {
        sessionId_userId: {
          sessionId,
          userId
        }
      },
      create: {
        sessionId,
        userId,
        joinedAt: new Date(),
        leftAt: null,
        durationSeconds: null,
        attendancePercentage: null
      },
      update: {
        joinedAt: new Date(),
        leftAt: null,
        durationSeconds: null,
        attendancePercentage: null
      }
    });
  }

  async leaveSession(sessionId: string, userId: string, durationMinutes: number) {
    const record = await prisma.attendanceRecord.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId
        }
      }
    });

    if (!record) {
      return null;
    }

    const leftAt = new Date();
    const durationSeconds = Math.max(0, Math.floor((leftAt.getTime() - record.joinedAt.getTime()) / 1000));
    
    const totalMinutes = durationMinutes || 60;
    const attendancePercentage = Math.min(100, Math.max(0, (durationSeconds / (totalMinutes * 60)) * 100));

    return prisma.attendanceRecord.update({
      where: {
        sessionId_userId: {
          sessionId,
          userId
        }
      },
      data: {
        leftAt,
        durationSeconds,
        attendancePercentage: Number(attendancePercentage.toFixed(2))
      }
    });
  }

  async findAttendanceBySessionId(sessionId: string) {
    return prisma.attendanceRecord.findMany({
      where: { sessionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { joinedAt: 'asc' }
    });
  }

  async findAttendanceByEnrollmentId(userId: string, courseId: string) {
    const sessions = await prisma.classSession.findMany({
      where: {
        batch: {
          courseId
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });

    const sessionIds = sessions.map(s => s.id);

    const records = await prisma.attendanceRecord.findMany({
      where: {
        userId,
        sessionId: { in: sessionIds }
      }
    });

    return sessions.map(session => {
      const record = records.find(r => r.sessionId === session.id);
      return {
        sessionId: session.id,
        sessionTitle: session.title,
        scheduledAt: session.scheduledAt,
        joinedAt: record ? record.joinedAt : null,
        leftAt: record ? record.leftAt : null,
        attendancePercentage: record && record.attendancePercentage ? Number(record.attendancePercentage) : 0
      };
    });
  }
}

export const attendanceRepository = new AttendanceRepository();
export default attendanceRepository;
