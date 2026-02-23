-- AlterEnum
ALTER TYPE "HabitType" ADD VALUE 'COUNT';

-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "scheduleDays" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "targetCount" INTEGER;

-- AlterTable
ALTER TABLE "HabitLog" ADD COLUMN     "count" INTEGER;
