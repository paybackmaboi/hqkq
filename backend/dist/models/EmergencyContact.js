"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
// Define the EmergencyContact model
class EmergencyContact extends sequelize_1.Model {
}
// Initialize the model
EmergencyContact.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    contactName: {
        type: new sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    contactPhone: {
        type: new sequelize_1.DataTypes.STRING(255),
        allowNull: true, // This allows the value to be NULL in the database
    },
    contactEmail: {
        type: new sequelize_1.DataTypes.STRING(255),
        allowNull: true, // This allows the value to be NULL in the database
    },
}, {
    tableName: 'emergency_contacts',
    sequelize: db_1.default,
});
exports.default = EmergencyContact;
