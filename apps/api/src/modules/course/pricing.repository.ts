import { Prisma } from '@nama/prisma';
import prisma from '../../infrastructure/database/prisma.client';
import { ProposePricingInput } from '@nama/shared';

export class PricingRepository {
  async findProposalById(id: string) {
    return prisma.coursePricing.findUnique({
      where: { id },
      include: {
        course: true
      }
    });
  }

  async createProposal(courseId: string, proposedBy: string, input: ProposePricingInput) {
    return prisma.$transaction(async (tx) => {
      // 1. Mark other pending proposals of this course as not current
      await tx.coursePricing.updateMany({
        where: {
          courseId,
          approvalStatus: 'pending',
          isCurrent: true
        },
        data: {
          isCurrent: false
        }
      });

      // 2. Create new proposal
      return tx.coursePricing.create({
        data: {
          courseId,
          amount: new Prisma.Decimal(input.amount),
          currency: input.currency,
          proposedById: proposedBy,
          approvalStatus: 'pending',
          isCurrent: true
        }
      });
    });
  }

  async approveProposal(proposalId: string, approvedBy: string, overrideAmount?: string | number) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch proposal details
      const proposal = await tx.coursePricing.findUnique({
        where: { id: proposalId }
      });
      if (!proposal) {
        throw new Error('Pricing proposal not found');
      }

      // 2. Mark ALL pricing records for this course as not current
      await tx.coursePricing.updateMany({
        where: {
          courseId: proposal.courseId
        },
        data: {
          isCurrent: false
        }
      });

      // 3. Update and approve the target proposal
      return tx.coursePricing.update({
        where: { id: proposalId },
        data: {
          approvalStatus: 'approved',
          approvedById: approvedBy,
          effectiveAt: new Date(),
          isCurrent: true,
          amount: overrideAmount !== undefined ? new Prisma.Decimal(overrideAmount) : undefined
        }
      });
    });
  }
}

export const pricingRepository = new PricingRepository();
export default pricingRepository;
