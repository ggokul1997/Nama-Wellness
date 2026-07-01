-- CreateEnum
CREATE TYPE "InterviewOutcome" AS ENUM ('pending', 'passed', 'failed');

-- CreateTable
CREATE TABLE "teacher_interviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "scheduled_at" TIMESTAMPTZ NOT NULL,
    "conducted_by" UUID,
    "outcome" "InterviewOutcome" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_interviews_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "teacher_interviews" ADD CONSTRAINT "teacher_interviews_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "teacher_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
