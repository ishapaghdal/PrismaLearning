import prisma from '../../db/db.config';

export default class TaskService {
  static async getTasksByProject(project_id: string) {
    try {
      const tasks = await prisma.task.findMany({
        where: { project_id },
        select: {
          task_id: true,
          task_name: true,
          billable: true,
          created_ts: true,
          updated_ts: true,
        },
        orderBy: {
          created_ts: 'desc',
        },
      });
      return tasks;
    } catch (error) {
      throw error;
    }
  }
}
