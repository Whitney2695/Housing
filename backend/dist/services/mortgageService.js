"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
class MortgageService {
    constructor() {
        this.brevoApiKey = process.env.BREVO_API_KEY;
        this.brevoSenderEmail = process.env.BREVO_SENDER_EMAIL;
        this.companyName = 'Haven Builders';
        this.logoUrl = 'http://localhost:5000/images/house.jpg';
        console.log('MortgageService initialized.');
    }
    // Mortgage Calculation
    calculateMortgage(loanAmount, interestRate, loanTermYears) {
        console.log('Calculating mortgage with:', { loanAmount, interestRate, loanTermYears });
        if (interestRate <= 0 || loanAmount <= 0 || loanTermYears <= 0) {
            throw new Error('Invalid loan parameters. Ensure all values are greater than zero.');
        }
        const monthlyRate = interestRate / 100 / 12;
        const numberOfPayments = loanTermYears * 12;
        const monthlyPayment = loanAmount *
            (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        const totalPayment = monthlyPayment * numberOfPayments;
        const totalInterest = totalPayment - loanAmount;
        console.log('Mortgage calculated successfully.');
        return { monthlyPayment, totalPayment, totalInterest };
    }
    // Send Email using Brevo
    sendEmail(to, subject, content) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                console.log(`Sending email to ${to}...`);
                const response = yield axios_1.default.post('https://api.brevo.com/v3/smtp/email', {
                    sender: { email: this.brevoSenderEmail },
                    to: [{ email: to }],
                    subject: subject,
                    htmlContent: content,
                }, {
                    headers: {
                        'api-key': this.brevoApiKey,
                        'Content-Type': 'application/json',
                    },
                });
                console.log(`Email sent successfully: ${response.status}`);
            }
            catch (error) {
                console.error('Failed to send email:', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || error.message);
            }
        });
    }
    // Create Mortgage
    createMortgage(mortgageDetails_1) {
        return __awaiter(this, arguments, void 0, function* (mortgageDetails, req = {}) {
            var _a, _b;
            try {
                console.log('Creating new mortgage...');
                const existingMortgage = yield prisma.mortgage.findFirst({
                    where: {
                        UserID: mortgageDetails.userId,
                        projectId: mortgageDetails.projectId || null,
                    },
                });
                if (existingMortgage) {
                    throw new Error('Mortgage exists for this user and project');
                }
                let interestRate = mortgageDetails.interestRate;
                if (mortgageDetails.projectId) {
                    const project = yield prisma.project.findUnique({
                        where: { ProjectID: mortgageDetails.projectId },
                    });
                    if (!project) {
                        throw new Error('Project not found');
                    }
                    interestRate = project.InterestRate || mortgageDetails.interestRate;
                }
                const { monthlyPayment, totalPayment, totalInterest } = this.calculateMortgage(mortgageDetails.loanAmount, interestRate, mortgageDetails.loanTermYears);
                const newMortgage = yield prisma.mortgage.create({
                    data: {
                        UserID: mortgageDetails.userId,
                        Income: mortgageDetails.income,
                        LoanAmount: mortgageDetails.loanAmount,
                        InterestRate: interestRate,
                        LoanTermYears: mortgageDetails.loanTermYears,
                        MonthlyPayment: monthlyPayment,
                        TotalPayment: totalPayment,
                        TotalInterest: totalInterest,
                        CreditScore: mortgageDetails.creditScore,
                        IsEligible: true,
                        CalculatedAt: new Date(),
                        projectId: mortgageDetails.projectId || null,
                    },
                });
                console.log('Mortgage created successfully:', newMortgage);
                // Retrieve the email and name
                let userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
                let userName = (_b = req.user) === null || _b === void 0 ? void 0 : _b.name;
                if (!userEmail || !userName) {
                    const user = yield prisma.user.findUnique({
                        where: { UserID: mortgageDetails.userId },
                        select: { Email: true, Name: true },
                    });
                    if (!user || !user.Email || !user.Name) {
                        throw new Error('User email or name not found.');
                    }
                    userEmail = user.Email;
                    userName = user.Name;
                }
                // Send confirmation email
                const subject = 'Mortgage Application Submitted Successfully';
                const content = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #2C3E50;">Dear ${userName},</h2>
          <p>Your mortgage application has been successfully submitted. Here are the details:</p>
          <table style="border-collapse: collapse; width: 100%; margin-top: 20px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4;"><strong>Loan Amount:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${newMortgage.LoanAmount}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4;"><strong>Interest Rate:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${newMortgage.InterestRate}%</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4;"><strong>Monthly Payment:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${newMortgage.MonthlyPayment}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4;"><strong>Total Payment:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${newMortgage.TotalPayment}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4;"><strong>Total Interest:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${newMortgage.TotalInterest}</td>
            </tr>
          </table>
          <p style="margin-top: 20px;">Thank you for choosing <strong>${this.companyName}</strong>!</p>
          <img src="${this.logoUrl}" alt="${this.companyName} Logo" style="width: 150px; margin-top: 20px;" />
        </div>
      `;
                yield this.sendEmail(userEmail, subject, content);
                return newMortgage;
            }
            catch (error) {
                console.error('Error creating mortgage:', error.message);
                throw { error: error.message || error };
            }
        });
    }
    // Get Mortgage by ID
    getMortgageById(mortgageId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Fetching mortgage with ID: ${mortgageId}...`);
            const mortgage = yield prisma.mortgage.findUnique({ where: { MortgageID: mortgageId } });
            if (!mortgage)
                throw new Error('Mortgage not found');
            return mortgage;
        });
    }
    // Get All Mortgages
    getAllMortgages() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Fetching all mortgages...');
            return yield prisma.mortgage.findMany();
        });
    }
    // Update Mortgage
    updateMortgage(mortgageId, mortgageDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`Updating mortgage with ID: ${mortgageId}...`);
                const existingMortgage = yield prisma.mortgage.findUnique({
                    where: { MortgageID: mortgageId },
                });
                if (!existingMortgage) {
                    throw new Error('Mortgage not found');
                }
                let interestRate = mortgageDetails.interestRate;
                if (mortgageDetails.projectId) {
                    const project = yield prisma.project.findUnique({
                        where: { ProjectID: mortgageDetails.projectId },
                    });
                    if (!project) {
                        throw new Error('Project not found');
                    }
                    interestRate = project.InterestRate;
                }
                const { monthlyPayment, totalPayment, totalInterest } = this.calculateMortgage(mortgageDetails.loanAmount, interestRate, mortgageDetails.loanTermYears);
                const updatedMortgage = yield prisma.mortgage.update({
                    where: { MortgageID: mortgageId },
                    data: {
                        Income: mortgageDetails.income,
                        LoanAmount: mortgageDetails.loanAmount,
                        InterestRate: interestRate,
                        LoanTermYears: mortgageDetails.loanTermYears,
                        MonthlyPayment: monthlyPayment,
                        TotalPayment: totalPayment,
                        TotalInterest: totalInterest,
                        CreditScore: mortgageDetails.creditScore,
                    },
                });
                console.log('Mortgage updated successfully.');
                // Retrieve the email and name of the user
                const user = yield prisma.user.findUnique({
                    where: { UserID: existingMortgage.UserID },
                    select: { Email: true, Name: true },
                });
                if (!user || !user.Email || !user.Name) {
                    throw new Error('User email or name not found.');
                }
                const subject = 'Mortgage Updated Successfully';
                const content = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #2C3E50;">Dear ${user.Name},</h2>
          <p>Your mortgage details have been successfully updated. Here are the updated details:</p>
          <table style="border-collapse: collapse; width: 100%; margin-top: 20px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4;"><strong>Loan Amount:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${updatedMortgage.LoanAmount}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4;"><strong>Interest Rate:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${updatedMortgage.InterestRate}%</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4;"><strong>Monthly Payment:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${updatedMortgage.MonthlyPayment}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4;"><strong>Total Payment:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${updatedMortgage.TotalPayment}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4;"><strong>Total Interest:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${updatedMortgage.TotalInterest}</td>
            </tr>
          </table>
          <p style="margin-top: 20px;">Thank you for choosing <strong>${this.companyName}</strong>!</p>
          <img src="${this.logoUrl}" alt="${this.companyName} Logo" style="width: 150px; margin-top: 20px;" />
        </div>
      `;
                yield this.sendEmail(user.Email, subject, content);
                return updatedMortgage;
            }
            catch (error) {
                console.error('Error updating mortgage:', error.message);
                throw { error: error.message || error };
            }
        });
    }
    // Delete Mortgage
    deleteMortgage(mortgageId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`Deleting mortgage with ID: ${mortgageId}...`);
                const deletedMortgage = yield prisma.mortgage.delete({ where: { MortgageID: mortgageId } });
                console.log('Mortgage deleted successfully.');
                return deletedMortgage;
            }
            catch (error) {
                console.error('Error deleting mortgage:', error.message);
                throw { error: error.message || error };
            }
        });
    }
    // Get Mortgages for a Specific User
    getMortgagesByUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`Fetching mortgages for user ID: ${userId}...`);
                const mortgages = yield prisma.mortgage.findMany({
                    where: { UserID: userId },
                });
                if (!mortgages.length) {
                    throw new Error('No mortgages found for this user.');
                }
                return mortgages;
            }
            catch (error) {
                console.error('Error fetching user mortgages:', error.message);
                throw { error: error.message || error };
            }
        });
    }
}
exports.default = new MortgageService();
