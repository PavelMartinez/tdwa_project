/*
  Warnings:

  - You are about to drop the column `type` on the `Exercise` table. All the data in the column will be lost.
  - Added the required column `exerciseTypeId` to the `Exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeId` to the `Exercise` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `duration` on the `Workout` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ExerciseTypeEnum" AS ENUM ('CARDIO', 'STRENGTH', 'FLEXIBILITY', 'BALANCE');

-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "type",
ADD COLUMN     "exerciseTypeId" TEXT NOT NULL,
ADD COLUMN     "typeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Workout" DROP COLUMN "duration",
ADD COLUMN     "duration" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "ExerciseType";

-- CreateTable
CREATE TABLE "ExerciseType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,

    CONSTRAINT "ExerciseType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_exerciseTypeId_fkey" FOREIGN KEY ("exerciseTypeId") REFERENCES "ExerciseType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
