import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const prisma = new PrismaClient();

// Mortgage Service
class MortgageService {
  private brevoApiKey = process.env.BREVO_API_KEY as string; // Ensure this is set in your .env file
  private brevoSenderEmail = process.env.BREVO_SENDER_EMAIL as string; // Sender email for Brevo
  private companyName = 'Haven Builders'; // Company name for email customization
  private logoUrl = 'http://localhost:5000/images/house.jpg';

  // Mortgage Calculation function
  calculateMortgage(loanAmount: number, interestRate: number, loanTermYears: number) {
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTermYears * 12;

    const monthlyPayment =
      loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - loanAmount;

    return { monthlyPayment, totalPayment, totalInterest };
  }

  // Send an email using Brevo (same method as in UsersService)
  private async sendEmail(to: string, subject: string, content: string) {
    try {
      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { email: this.brevoSenderEmail },
          to: [{ email: to }],
          subject: subject,
          htmlContent: content,
        },
        {
          headers: {
            'api-key': this.brevoApiKey,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(`Email sent successfully: ${response.status}`);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Unknown error occurred';
      console.error('Failed to send email:', errorMessage);
      throw new Error(`Email sending failed: ${errorMessage}`);
    }
  }

  // Create Mortgage
  async createMortgage(mortgageDetails: any) {
    const { monthlyPayment, totalPayment, totalInterest } = this.calculateMortgage(
      mortgageDetails.loanAmount,
      mortgageDetails.interestRate,
      mortgageDetails.loanTermYears
    );

    const newMortgage = await prisma.mortgage.create({
      data: {
        UserID: mortgageDetails.userId,
        Income: mortgageDetails.income,
        LoanAmount: mortgageDetails.loanAmount,
        InterestRate: mortgageDetails.interestRate,
        LoanTermYears: mortgageDetails.loanTermYears,
        MonthlyPayment: monthlyPayment,
        TotalPayment: totalPayment,
        TotalInterest: totalInterest,
        CreditScore: mortgageDetails.creditScore,
        IsEligible: true,
        CalculatedAt: new Date(),
        projectId: mortgageDetails.projectId,
      },
    });

    const user = await prisma.user.findUnique({
      where: { UserID: mortgageDetails.userId },
    });

    if (user) {
      const emailContent = `
        <h2>Mortgage Approval Details</h2>
        <p>Your mortgage has been approved. Here are the details:</p>
        <ul>
          <li>Loan Amount: ${mortgageDetails.loanAmount}</li>
          <li>Monthly Payment: ${monthlyPayment.toFixed(2)}</li>
          <li>Total Payment: ${totalPayment.toFixed(2)}</li>
          <li>Total Interest: ${totalInterest.toFixed(2)}</li>
          <li>Credit Score: ${mortgageDetails.creditScore}</li>
        </ul>
        <p>Thank you for choosing our services!</p>
      `;
      await this.sendEmail(user.Email, 'Mortgage Approval Details', emailContent);
    }

    return newMortgage;
  }

  // Get Mortgage by ID
  async getMortgageById(mortgageId: string) {
    const mortgage = await prisma.mortgage.findUnique({
      where: { MortgageID: mortgageId },
    });
    return mortgage;
  }

  // Get All Mortgages
  async getAllMortgages() {
    const mortgages = await prisma.mortgage.findMany(); // This will fetch all mortgage records
    return mortgages;
  }

  // Update Mortgage
  async updateMortgage(mortgageId: string, mortgageDetails: any) {
    const updatedMortgage = await prisma.mortgage.update({
      where: { MortgageID: mortgageId },
      data: mortgageDetails,
    });
    return updatedMortgage;
  }

  // Delete Mortgage
  async deleteMortgage(mortgageId: string) {
    const deletedMortgage = await prisma.mortgage.delete({
      where: { MortgageID: mortgageId },
    });
    return deletedMortgage;
  }
}

export default new MortgageService();
