-- CreateEnum
CREATE TYPE "PerformanceStatus" AS ENUM ('good_standing', 'warning', 'probation', 'suspension', 'terminated');

-- CreateTable
CREATE TABLE "teacher_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "onboarding_fee_paid" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_paid_at" TIMESTAMPTZ,
    "onboarding_payment_id" UUID,
    "performance_status" "PerformanceStatus" NOT NULL DEFAULT 'good_standing',
    "specialties" TEXT[],
    "average_rating" DECIMAL(3,2),
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "activated_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teacher_profiles_user_id_key" ON "teacher_profiles"("user_id");

-- AddForeignKey
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
