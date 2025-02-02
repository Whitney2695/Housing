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
// Load environment variables from .env file
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
// Mortgage Service
class MortgageService {
    constructor() {
        this.brevoApiKey = process.env.BREVO_API_KEY; // Ensure this is set in your .env file
        this.brevoSenderEmail = process.env.BREVO_SENDER_EMAIL; // Sender email for Brevo
        this.companyName = 'Haven Builders'; // Company name for email customization
        this.logoUrl = 'http://localhost:5000/images/house.jpg';
    }
    // Mortgage Calculation function
    calculateMortgage(loanAmount, interestRate, loanTermYears) {
        const monthlyRate = interestRate / 100 / 12;
        const numberOfPayments = loanTermYears * 12;
        const monthlyPayment = loanAmount *
            (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        const totalPayment = monthlyPayment * numberOfPayments;
        const totalInterest = totalPayment - loanAmount;
        return { monthlyPayment, totalPayment, totalInterest };
    }
    // Send an email using Brevo (same method as in UsersService)
    sendEmail(to, subject, content) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
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
                const errorMessage = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || error.message || 'Unknown error occurred';
                console.error('Failed to send email:', errorMessage);
                throw new Error(`Email sending failed: ${errorMessage}`);
            }
        });
    }
    // Create Mortgage
    createMortgage(mortgageDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            const { monthlyPayment, totalPayment, totalInterest } = this.calculateMortgage(mortgageDetails.loanAmount, mortgageDetails.interestRate, mortgageDetails.loanTermYears);
            const newMortgage = yield prisma.mortgage.create({
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
            const user = yield prisma.user.findUnique({
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
                yield this.sendEmail(user.Email, 'Mortgage Approval Details', emailContent);
            }
            return newMortgage;
        });
    }
    // Get Mortgage by ID
    getMortgageById(mortgageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const mortgage = yield prisma.mortgage.findUnique({
                where: { MortgageID: mortgageId },
            });
            return mortgage;
        });
    }
    // Get All Mortgages
    getAllMortgages() {
        return __awaiter(this, void 0, void 0, function* () {
            const mortgages = yield prisma.mortgage.findMany(); // This will fetch all mortgage records
            return mortgages;
        });
    }
    // Update Mortgage
    updateMortgage(mortgageId, mortgageDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedMortgage = yield prisma.mortgage.update({
                where: { MortgageID: mortgageId },
                data: mortgageDetails,
            });
            return updatedMortgage;
        });
    }
    // Delete Mortgage
    deleteMortgage(mortgageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletedMortgage = yield prisma.mortgage.delete({
                where: { MortgageID: mortgageId },
            });
            return deletedMortgage;
        });
    }
}
exports.default = new MortgageService();
