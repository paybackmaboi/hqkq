import { Sequelize } from 'sequelize';

// --- DATABASE CONFIGURATION ---
const dbName = 'lislip_db';
const dbUser = 'root'; // Your database username
const dbPassword = 'root'; // Your database password
const dbHost = 'localhost';

// Initialize Sequelize with database credentials
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: 'mysql', // We are using MySQL
  logging: console.log, // Log database queries to the console
});

export default sequelize;
