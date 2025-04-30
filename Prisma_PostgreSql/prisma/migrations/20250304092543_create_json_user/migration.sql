/*
  Warnings:

  - You are about to drop the `Json_User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Json_User";

-- CreateTable
CREATE TABLE "JsonUser" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "user" JSONB[],

    CONSTRAINT "JsonUser_pkey" PRIMARY KEY ("id")
);
