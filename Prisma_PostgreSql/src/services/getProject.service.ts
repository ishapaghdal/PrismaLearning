import prisma from "../../db/db.config";

export default class ProjectService {
  static async getAllProjects() {
    try {
      const projects = await prisma.project.findMany({
        select: {
          project_id: true,
          project_name: true,
          project_state: true,
          billable: true,
          start_date: true,
          end_date: true,
          type: true,
          phase: true,
          is_active: true,
          client_id: true,
          created_ts: true,
          updated_ts: true,
        },
        orderBy: {
          updated_ts: "desc",
        },
      });
      return projects;
    } catch (error) {
      throw error;
    }
  }

  static async getProjectById(project_id: string) {
    try {
      const project = await prisma.project.findUnique({
        where: { project_id },
        select: {
          project_id: true,
          project_name: true,
          description: true,
          billable: true,
          start_date: true,
          end_date: true,
          project_state: true,
          type: true,
          phase: true,
          is_active: true,
          client_id: true,
          project_billing_type: true,
          created_ts: true,
          updated_ts: true,
        },
      });
      return project;
    } catch (error) {
      throw error;
    }
  }

  // ✅ New Function: Get Projects by Employee ID
  static async getProjectsByEmployeeId(employee_id: string) {
    try {
      const projectEmployees = await prisma.projectEmployee.findMany({
        where: {
          employee_id,
          is_deleted: false,
        },
        include: {
          project: {
            select: {
              project_id: true,
              project_name: true,
              project_state: true,
              billable: true,
              start_date: true,
              end_date: true,
              type: true,
              phase: true,
              is_active: true,
              client_id: true,
              created_ts: true,
              updated_ts: true,
            },
          },
        },
        orderBy: {
          updated_ts: "desc",
        },
      });

      // Deduplicate projects by project_id
      const uniqueProjectsMap = new Map<
        string,
        (typeof projectEmployees)[0]["project"]
      >();

      for (const pe of projectEmployees) {
        const project = pe.project;
        if (!uniqueProjectsMap.has(project.project_id)) {
          uniqueProjectsMap.set(project.project_id, project);
        }
      }

      return Array.from(uniqueProjectsMap.values());
    } catch (error) {
      throw error;
    }
  }
}
