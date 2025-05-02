// projectRoutes.js or projectRoutes.mjs

import express from 'express';
import {
  getAllProjectsHandler,
  getTasksByProjectIdHandler,
  createTimeEntryHandler,
} from '../controllers/projectController';

const router = express.Router();

router.get('/projects', getAllProjectsHandler);
router.get('/tasks/:id', getTasksByProjectIdHandler);
router.post('/time-entry', createTimeEntryHandler);

export default router;