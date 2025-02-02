import { Request, Response } from 'express';
import mortgageService from '../services/mortgageService';

// Create Mortgage Controller
export const createMortgageController = async (req: Request, res: Response): Promise<void> => {
  try {
    const mortgageDetails = req.body;
    const newMortgage = await mortgageService.createMortgage(mortgageDetails);

    res.status(201).json({
      message: 'Mortgage created successfully',
      mortgage: newMortgage,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating mortgage', error });
  }
};

// Get Mortgage by ID Controller (No Authorization)
export const getMortgageByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const mortgageId = req.params.id;
    const mortgage = await mortgageService.getMortgageById(mortgageId);

    if (!mortgage) {
      res.status(404).json({ message: 'Mortgage not found' });
      return;
    }

    res.status(200).json(mortgage);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mortgage', error });
  }
};

// Get All Mortgages Controller (No Authorization)
export const getAllMortgagesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const mortgages = await mortgageService.getAllMortgages();
    res.status(200).json(mortgages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mortgages', error });
  }
};

// Update Mortgage Controller (Authorization Required)
export const updateMortgageController = async (req: Request, res: Response): Promise<void> => {
  try {
    const mortgageId = req.params.id;
    const mortgageDetails = req.body;

    const updatedMortgage = await mortgageService.updateMortgage(mortgageId, mortgageDetails);

    res.status(200).json(updatedMortgage); // Includes success message and updated mortgage details
  } catch (error) {
    res.status(500).json({ message: 'Error updating mortgage', error });
  }
};

// Delete Mortgage Controller (Authorization Required)
export const deleteMortgageController = async (req: Request, res: Response): Promise<void> => {
  try {
    const mortgageId = req.params.id;
    await mortgageService.deleteMortgage(mortgageId);

    res.status(200).json({ message: 'Mortgage deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting mortgage', error });
  }
};
