/*
  Warnings:

  - Added the required column `setting` to the `JsonUser` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `profile` on the `JsonUser` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "JsonUser" ADD COLUMN     "setting" JSONB NOT NULL,
DROP COLUMN "profile",
ADD COLUMN     "profile" JSONB NOT NULL;
