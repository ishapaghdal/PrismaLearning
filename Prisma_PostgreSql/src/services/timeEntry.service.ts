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

  const employee_id = "676a4232ea1f026a913eabbe"; // constant for now

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
