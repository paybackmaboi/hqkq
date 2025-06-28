import express, { Request, Response } from 'express';
import cors from 'cors';
import sequelize from './db';
import User from './models/User';
import EmergencyContact from './models/EmergencyContact';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('LISLIP Backend Server with Sequelize is running!');
});

app.post('/api/safe', async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  console.log(`--- "I Am Safe" Request Received for User ID: ${userId} ---`);

  try {
    // Use Sequelize's `findByPk` to find the user and `include` to also get their contacts
    const user = await User.findByPk(userId, {
      include: [{ model: EmergencyContact, as: 'emergencyContacts' }]
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

  } catch (error) {
    console.error('Database query failed:', error);
    res.status(500).json({ message: 'An error occurred on the server.' });
  }
});

/**
 * This function synchronizes the database and starts the server.
 * `sequelize.sync({ alter: true })` will automatically create or update tables.
 */
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
    
    // Optional: Add sample data if the database is new
    const userCount = await User.count();
    if (userCount === 0) {
        console.log('No users found. Creating sample data...');
        const user1 = await User.create({ name: 'John Doe', email: 'john.doe@example.com' });
        await EmergencyContact.create({ userId: user1.id, contactName: 'JohnsEmergencyContact', contactEmail: 'john-contact@example.com' });
        console.log('Sample data created.');
    }

    app.listen(port, () => {
      console.log(`Backend server listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start the server:', error);
  }
};

startServer();
