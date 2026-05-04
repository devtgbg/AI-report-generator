import express from 'express';
import { getJobDetails } from '../controllers/jobController.js';

const router = express.Router();

router.get('/:identifier', getJobDetails);

export default router;
