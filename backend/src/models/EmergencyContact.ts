import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

// Interface for EmergencyContact attributes
interface EmergencyContactAttributes {
  id: number;
  userId: number;
  contactName: string;
  // Updated types to allow null, matching the class property and database schema.
  contactPhone?: string | null;
  contactEmail?: string | null;
}

// Interface for EmergencyContact creation
interface EmergencyContactCreationAttributes extends Optional<EmergencyContactAttributes, 'id'> {}

// Define the EmergencyContact model
class EmergencyContact extends Model<EmergencyContactAttributes, EmergencyContactCreationAttributes> implements EmergencyContactAttributes {
  public id!: number;
  public userId!: number;
  public contactName!: string;
  public contactPhone!: string | null;
  public contactEmail!: string | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the model
EmergencyContact.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    contactName: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    contactPhone: {
      type: new DataTypes.STRING(255),
      allowNull: true, // This allows the value to be NULL in the database
    },
    contactEmail: {
      type: new DataTypes.STRING(255),
      allowNull: true, // This allows the value to be NULL in the database
    },
  },
  {
    tableName: 'emergency_contacts',
    sequelize,
  }
);

export default EmergencyContact;
