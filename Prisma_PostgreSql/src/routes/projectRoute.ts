// projectRoutes.js or projectRoutes.mjs

import express from 'express';
import {
  getAllProjectsHandler,
  getTasksByProjectIdHandler,
  createTimeEntryHandler,
  getTimeEntriesByEmployeeHandler,
} from '../controllers/projectController';

const router = express.Router();

router.get('/projects', getAllProjectsHandler);
router.get('/tasks/:id', getTasksByProjectIdHandler);
router.post('/time-entry', createTimeEntryHandler);
router.get('/time-entry', getTimeEntriesByEmployeeHandler);


export default router;