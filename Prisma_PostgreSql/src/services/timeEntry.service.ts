import prisma from "../../db/db.config";
import { v4 as uuidv4 } from "uuid";

export const createTimeEntry = async (data) => {
  const {
    description,
    start_time,
    end_time,
    duration,
    billable,
    project_id,
    task_id,
  } = data;

  const employee_id = "605c5c469b9a512b4b59a22d"; // constant for now

  const timeEntry = await prisma.timeEntry.create({
    data: {
      time_entry_id: uuidv4(),
      description,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      duration,
      billable,
      project_id,
      task_id,
      employee_id,
      created_ts: new Date(),
      updated_ts: new Date(),
    },
  });

  return timeEntry;
};

export const getTimeEntriesByEmployeeId = async (employeeId: string) => {
  const entries = await prisma.timeEntry.findMany({
    where: {
      employee_id: employeeId,
    },
    include: {
      Project: true,
      Task: true,
    },
    orderBy: {
      start_time: "desc",
    },
  });

  return entries;
};
