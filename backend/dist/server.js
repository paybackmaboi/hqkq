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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./db"));
const User_1 = __importDefault(require("./models/User"));
const EmergencyContact_1 = __importDefault(require("./models/EmergencyContact"));
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('LISLIP Backend Server with Sequelize is running!');
});
app.post('/api/safe', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required.' });
    }
    console.log(`--- "I Am Safe" Request Received for User ID: ${userId} ---`);
    try {
        // Use Sequelize's `findByPk` to find the user and `include` to also get their contacts
        const user = yield User_1.default.findByPk(userId, {
            include: [{ model: EmergencyContact_1.default, as: 'emergencyContacts' }]
        });
        if (!user || !user.emergencyContacts || user.emergencyContacts.length === 0) {
            console.log(`No user or emergency contact found for User ID: ${userId}`);
            return res.status(404).json({ message: 'User or emergency contact not found.' });
        }
        const contact = user.emergencyContacts[0];
        console.log(`User found: ${user.name}`);
        // SIMULATED NOTIFICATION LOGIC
        console.log(`SIMULATING: Sending "I Am Safe" notification to ${contact.contactName} at ${contact.contactEmail}`);
        res.status(200).json({ message: `Notification for ${user.name} sent successfully (simulated).` });
    }
    catch (error) {
        console.error('Database query failed:', error);
        res.status(500).json({ message: 'An error occurred on the server.' });
    }
}));
/**
 * This function synchronizes the database and starts the server.
 * `sequelize.sync({ alter: true })` will automatically create or update tables.
 */
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.default.authenticate();
        console.log('Database connection has been established successfully.');
        // Sync all models
        yield db_1.default.sync({ alter: true });
        console.log('All models were synchronized successfully.');
        // Optional: Add sample data if the database is new
        const userCount = yield User_1.default.count();
        if (userCount === 0) {
            console.log('No users found. Creating sample data...');
            const user1 = yield User_1.default.create({ name: 'John Doe', email: 'john.doe@example.com' });
            yield EmergencyContact_1.default.create({ userId: user1.id, contactName: 'JohnsEmergencyContact', contactEmail: 'john-contact@example.com' });
            console.log('Sample data created.');
        }
        app.listen(port, () => {
            console.log(`Backend server listening at http://localhost:${port}`);
        });
    }
    catch (error) {
        console.error('Unable to connect to the database or start the server:', error);
    }
});
startServer();
