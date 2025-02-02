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
    createMortgage(mortgageDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Creating new mortgage...');
                // Check if the user already has a mortgage for the same project
                const existingMortgage = yield prisma.mortgage.findFirst({
                    where: {
                        UserID: mortgageDetails.userId,
                        projectId: mortgageDetails.projectId || null,
                    },
                });
                if (existingMortgage) {
                    const errorMessage = 'Mortgage exists for this user and project';
                    console.error(errorMessage);
                    throw new Error(errorMessage); // Throw the error to be caught in the catch block
                }
                let interestRate = mortgageDetails.interestRate;
                if (mortgageDetails.projectId) {
                    const project = yield prisma.project.findUnique({
                        where: { ProjectID: mortgageDetails.projectId },
                    });
                    if (!project) {
                        const errorMessage = 'Project not found';
                        console.error(errorMessage);
                        throw new Error(errorMessage);
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
                return newMortgage;
            }
            catch (error) {
                // Log the error to the console
                console.error('Error creating mortgage:', error.message);
                // Return the error message in the response
                throw {
                    error: error.message || error,
                };
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
                const existingMortgage = yield prisma.mortgage.findUnique({ where: { MortgageID: mortgageId } });
                if (!existingMortgage) {
                    console.error('Mortgage not found.');
                    throw new Error('Mortgage not found');
                }
                let interestRate = mortgageDetails.interestRate;
                if (mortgageDetails.projectId) {
                    const project = yield prisma.project.findUnique({ where: { ProjectID: mortgageDetails.projectId } });
                    if (!project) {
                        console.error('Project not found.');
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
                console.log('Mortgage updated successfully:', updatedMortgage);
                // Send email after successful update
                const subject = 'Your Mortgage Details Have Been Updated';
                const content = `
        <p>Dear Customer,</p>
        <p>Your mortgage details have been successfully updated. Here are your new mortgage details:</p>
        <p><strong>Loan Amount:</strong> ${updatedMortgage.LoanAmount}</p>
        <p><strong>Interest Rate:</strong> ${updatedMortgage.InterestRate}%</p>
        <p><strong>Monthly Payment:</strong> ${updatedMortgage.MonthlyPayment}</p>
        <p><strong>Total Payment:</strong> ${updatedMortgage.TotalPayment}</p>
        <p><strong>Total Interest:</strong> ${updatedMortgage.TotalInterest}</p>
        <p>If you have any questions, please contact us at support@havenbuilders.com.</p>
        <p>Thank you for choosing Haven Builders!</p>
        <img src="${this.logoUrl}" alt="${this.companyName} Logo" />
      `;
                // Send the email to a static address (e.g., support or admin email)
                const staticEmail = 'support@havenbuilders.com'; // Replace with your desired email address
                yield this.sendEmail(staticEmail, subject, content);
                return updatedMortgage;
            }
            catch (error) {
                console.error('Error updating mortgage:', error.message);
                throw {
                    status: 500,
                    message: 'Error updating mortgage',
                    error: error.message || error,
                };
            }
        });
    }
    // Delete Mortgage
    deleteMortgage(mortgageId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`Deleting mortgage with ID: ${mortgageId}...`);
                const deletedMortgage = yield prisma.mortgage.delete({ where: { MortgageID: mortgageId } });
                console.log('Mortgage deleted successfully:', deletedMortgage);
                return deletedMortgage;
            }
            catch (error) {
                console.error('Error deleting mortgage:', error.message);
                throw {
                    status: 500,
                    message: 'Error deleting mortgage',
                    error: error.message || error,
                };
            }
        });
    }
}
exports.default = new MortgageService();
