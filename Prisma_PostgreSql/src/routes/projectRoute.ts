// projectRoutes.js or projectRoutes.mjs

import express from 'express';
import {
  getAllProjectsHandler,
  getTasksByProjectIdHandler,
  createTimeEntryHandler,
  getTimeEntriesByEmployeeHandler,
  getEmployeeProjects,
} from '../controllers/projectController';

const router = express.Router();

router.get('/projects', getAllProjectsHandler);
router.get('/tasks/:id', getTasksByProjectIdHandler);
router.post('/time-entry', createTimeEntryHandler);
router.get('/time-entry', getTimeEntriesByEmployeeHandler);
router.get("/employee-projects/:employeeId", getEmployeeProjects);

export default router;