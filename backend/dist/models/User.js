"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
const EmergencyContact_1 = __importDefault(require("./EmergencyContact"));
// Define the User model
class User extends sequelize_1.Model {
}
// Initialize the User model with its attributes and options
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: new sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    email: {
        type: new sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
}, {
    tableName: 'users',
    sequelize: db_1.default, // Pass the connection instance
});
// Define the association: A User can have many EmergencyContacts
User.hasMany(EmergencyContact_1.default, {
    sourceKey: 'id',
    foreignKey: 'userId',
    as: 'emergencyContacts' // This alias will be used for eager loading
});
EmergencyContact_1.default.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});
exports.default = User;
