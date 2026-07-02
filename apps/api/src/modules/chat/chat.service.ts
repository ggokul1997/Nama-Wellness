import { chatRepository } from './chat.repository';
import { CreateConversationInput, SendMessageInput } from '@nama/shared';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors';
import prisma from '../../infrastructure/database/prisma.client';

export class ChatService {
  async getConversations(userId: string) {
    const list = await chatRepository.findConversations(userId);

    return list.map((convo) => {
      const lastMsg = convo.messages[0];
      return {
        id: convo.id,
        participants: convo.participants.map((p) => ({
          id: p.user.id,
          email: p.user.email,
          name: p.user.profile
            ? `${p.user.profile.firstName} ${p.user.profile.lastName}`.trim()
            : p.user.email
        })),
        lastMessage: lastMsg
          ? {
              body: lastMsg.content,
              sentAt: lastMsg.createdAt
            }
          : null
      };
    });
  }

  async createConversation(userId: string, input: CreateConversationInput) {
    if (userId === input.participantId) {
      throw new BadRequestError('Cannot start a conversation with yourself');
    }

    const participant = await prisma.user.findUnique({
      where: { id: input.participantId }
    });

    if (!participant) {
      throw new NotFoundError('Participant user not found');
    }

    const existing = await chatRepository.findConversationBetween(userId, input.participantId);
    if (existing) {
      return {
        id: existing.id,
        participants: existing.participants.map((p) => ({
          id: p.user.id,
          email: p.user.email
        }))
      };
    }

    const created = await chatRepository.createConversation(userId, input.participantId);

    return {
      id: created.id,
      participants: created.participants.map((p) => ({
        id: p.user.id,
        email: p.user.email
      }))
    };
  }

  async getMessages(
    userId: string,
    roles: string[],
    conversationId: string,
    page: number,
    limit: number
  ) {
    const isAdmin = roles.includes('admin');
    if (!isAdmin) {
      const isPart = await chatRepository.isParticipant(conversationId, userId);
      if (!isPart) {
        throw new ForbiddenError('You are not a participant in this conversation');
      }
    }

    const conversation = await chatRepository.findConversationById(conversationId);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    const skip = (page - 1) * limit;
    const messages = await chatRepository.findMessages(conversationId, skip, limit);

    return messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      messageType: m.attachmentUrl ? 'file' : 'text',
      body: m.content,
      fileUrl: m.attachmentUrl,
      sentAt: m.createdAt
    }));
  }

  async sendMessage(userId: string, conversationId: string, input: SendMessageInput) {
    const isPart = await chatRepository.isParticipant(conversationId, userId);
    if (!isPart) {
      throw new ForbiddenError('You are not a participant in this conversation');
    }

    let content = '';
    let attachmentUrl: string | undefined;

    if (input.messageType === 'text') {
      if (!input.body || input.body.trim() === '') {
        throw new BadRequestError('Message body is required for text messages');
      }
      content = input.body;
    } else {
      if (!input.fileUrl) {
        throw new BadRequestError('File URL is required for file messages');
      }
      content = input.body || `[File Attachment: ${input.fileName || 'file'}]`;
      attachmentUrl = input.fileUrl;
    }

    const message = await chatRepository.createMessage({
      conversationId,
      senderId: userId,
      content,
      attachmentUrl
    });

    return {
      id: message.id,
      sentAt: message.createdAt
    };
  }

  async deleteMessage(_adminUserId: string, messageId: string) {
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    await chatRepository.deleteMessage(messageId);
  }
}

export const chatService = new ChatService();
export default chatService;
