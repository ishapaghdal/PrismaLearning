/*
  Warnings:

  - You are about to drop the column `user` on the `JsonUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JsonUser" DROP COLUMN "user",
ADD COLUMN     "profile" JSONB[];
