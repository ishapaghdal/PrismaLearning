-- CreateTable
CREATE TABLE "Json_User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "user" JSONB[],

    CONSTRAINT "Json_User_pkey" PRIMARY KEY ("id")
);
