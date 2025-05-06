import ProjectService from "../services/getProject.service";
import TaskService from "../services/getTask.service";
import { createTimeEntry } from "../services/timeEntry.service";
import { getTimeEntriesByEmployeeId } from "../services/timeEntry.service";

export const getAllProjectsHandler = async (req, res) => {
  try {
    const projects = await ProjectService.getAllProjects();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

export const getTasksByProjectIdHandler = async (req, res) => {
  const projectId = req.params.id;
  if (!projectId)
    return res.status(400).json({ error: "project_id is required" });

  try {
    const tasks = await TaskService.getTasksByProject(projectId);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

export const createTimeEntryHandler = async (req, res) => {
  try {
    const data = req.body;

    const timeEntry = await createTimeEntry(data);
    res.status(201).json(timeEntry);
  } catch (error) {
    console.error("Error creating time entry:", error);
    res.status(500).json({ error: "Failed to create time entry" });
  }
};

export const getTimeEntriesByEmployeeHandler = async (req, res) => {
  const { employee_id } = req.query;

  if (!employee_id) {
    return res.status(400).json({ error: "employee_id is required" });
  }

  try {
    const entries = await getTimeEntriesByEmployeeId(employee_id);
    res.status(200).json(entries);
  } catch (error) {
    console.error("Error fetching time entries:", error);
    res.status(500).json({ error: "Failed to fetch time entries" });
  }
};

export const getEmployeeProjects = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const projects = await ProjectService.getProjectsByEmployeeId(employeeId);
    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
