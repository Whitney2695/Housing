import { Request, Response } from 'express';
import mortgageService from '../services/mortgageService'; // Assuming this is where the service is located

export const createMortgageController = async (req: Request, res: Response): Promise<void> => {
  try {
    const mortgageDetails = req.body;

    // Create mortgage
    const newMortgage = await mortgageService.createMortgage(mortgageDetails);

    // Respond with success message and mortgage details
    res.status(201).json({
      message: 'Mortgage created successfully',
      mortgage: newMortgage, // Return the mortgage details
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating mortgage', error });
  }
};

export const getMortgageByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const mortgageId = req.params.id;
    // Your logic to fetch mortgage by ID
    res.status(200).json({ mortgageId });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mortgage', error });
  }
};

// Added the getAllMortgagesController
export const getAllMortgagesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const mortgages = await mortgageService.getAllMortgages(); // Fetch all mortgages from the service
    res.status(200).json(mortgages); // Return all mortgages
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mortgages', error });
  }
};

export const updateMortgageController = async (req: Request, res: Response): Promise<void> => {
  try {
    const mortgageId = req.params.id;
    // Your logic for updating mortgage
    res.status(200).json({ message: 'Mortgage updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating mortgage', error });
  }
};

export const deleteMortgageController = async (req: Request, res: Response): Promise<void> => {
  try {
    const mortgageId = req.params.id;
    // Your logic for deleting a mortgage
    res.status(200).json({ message: 'Mortgage deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting mortgage', error });
  }
};
