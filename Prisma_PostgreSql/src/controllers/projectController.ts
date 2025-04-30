import ProjectService from '../services/getProject.service';
import TaskService from '../services/getTask.service';

export const getAllProjectsHandler = async (req, res) => {
  try {
    const projects = await ProjectService.getAllProjects();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

export const getTasksByProjectIdHandler = async (req, res) => {
  const projectId = req.params.id;
  if (!projectId) return res.status(400).json({ error: 'project_id is required' });

  try {
    const tasks = await TaskService.getTasksByProject(projectId);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};
