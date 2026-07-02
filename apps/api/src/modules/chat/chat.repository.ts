import prisma from '../../infrastructure/database/prisma.client';

export class ChatRepository {
  async findConversations(userId: string) {
    const userParticipants = await prisma.conversationParticipant.findMany({
      where: { userId },
      select: { conversationId: true }
    });

    const conversationIds = userParticipants.map((p) => p.conversationId);

    const conversations = await prisma.conversation.findMany({
      where: { id: { in: conversationIds } },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatarUrl: true
                  }
                }
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return conversations;
  }

  async findConversationBetween(userId1: string, userId2: string) {
    const commonConversations = await prisma.conversationParticipant.findMany({
      where: { userId: userId1 },
      select: { conversationId: true }
    });

    const conversationIds = commonConversations.map((c) => c.conversationId);

    const match = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: { in: conversationIds },
        userId: userId2
      },
      select: { conversationId: true }
    });

    if (!match) return null;

    return prisma.conversation.findUnique({
      where: { id: match.conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: true
              }
            }
          }
        }
      }
    });
  }

  async createConversation(userId1: string, userId2: string) {
    return prisma.$transaction(async (tx) => {
      const conversation = await tx.conversation.create({
        data: {}
      });

      await tx.conversationParticipant.createMany({
        data: [
          { conversationId: conversation.id, userId: userId1 },
          { conversationId: conversation.id, userId: userId2 }
        ]
      });

      return tx.conversation.findUniqueOrThrow({
        where: { id: conversation.id },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  profile: true
                }
              }
            }
          }
        }
      });
    });
  }

  async findConversationById(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: true
              }
            }
          }
        }
      }
    });
  }

  async isParticipant(conversationId: string, userId: string) {
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId }
      }
    });
    return !!participant;
  }

  async findMessages(conversationId: string, skip: number, limit: number) {
    return prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            profile: true
          }
        }
      }
    });
  }

  async createMessage(params: {
    conversationId: string;
    senderId: string;
    content: string;
    attachmentUrl?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const message = await tx.chatMessage.create({
        data: {
          conversationId: params.conversationId,
          senderId: params.senderId,
          content: params.content,
          attachmentUrl: params.attachmentUrl || null
        }
      });

      await tx.conversation.update({
        where: { id: params.conversationId },
        data: { updatedAt: new Date() }
      });

      return message;
    });
  }

  async deleteMessage(id: string) {
    return prisma.chatMessage.delete({
      where: { id }
    });
  }
}

export const chatRepository = new ChatRepository();
export default chatRepository;
