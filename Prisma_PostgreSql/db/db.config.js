import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query"], // see what qurey is coming from database
});



export default prisma;
