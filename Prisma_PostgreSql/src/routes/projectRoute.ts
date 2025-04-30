// projectRoutes.js or projectRoutes.mjs

import express from 'express';
import {
  getAllProjectsHandler,
  getTasksByProjectIdHandler,
} from '../controllers/projectController';

const router = express.Router();

router.get('/projects', getAllProjectsHandler);
router.get('/tasks/:id', getTasksByProjectIdHandler);

export default router;
