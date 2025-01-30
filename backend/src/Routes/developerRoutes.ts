import express, { Request, Response } from 'express';
import developerController from '../controller/developerController';

const router = express.Router();  // This is the correct initialization

// Define routes correctly with proper async handling
router.post('/', async (req: Request, res: Response) => {
  try {
    await developerController.createDeveloper(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    await developerController.getAllDevelopers(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    await developerController.getDeveloperById(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    await developerController.updateDeveloper(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await developerController.deleteDeveloper(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

export default router;
