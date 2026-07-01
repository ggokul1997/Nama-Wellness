-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('live', 'recorded', 'hybrid', 'individual');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('draft', 'pending_review', 'changes_requested', 'approved', 'published', 'rejected', 'archived');

-- CreateTable
CREATE TABLE "courses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "course_type" "CourseType" NOT NULL,
    "category_id" UUID NOT NULL,
    "teacher_id" UUID,
    "assigned_by" UUID,
    "status" "CourseStatus" NOT NULL DEFAULT 'draft',
    "cover_image_url" TEXT,
    "published_at" TIMESTAMPTZ,
    "rejected_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
