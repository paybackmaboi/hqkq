import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';
import EmergencyContact from './EmergencyContact';

// Interface for User attributes
interface UserAttributes {
  id: number;
  name: string;
  email: string;
}

// Interface for User creation attributes (id is optional)
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

// Define the User model
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;

  // This tells TypeScript that a User instance might have this property
  // when loaded with an association. This fixes the compile error in server.ts.
  public readonly emergencyContacts?: EmergencyContact[];

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the User model with its attributes and options
User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: new DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: 'users',
    sequelize, // Pass the connection instance
  }
);

// Define the association: A User can have many EmergencyContacts
User.hasMany(EmergencyContact, {
  sourceKey: 'id',
  foreignKey: 'userId',
  as: 'emergencyContacts' // This alias will be used for eager loading
});

EmergencyContact.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

export default User;
