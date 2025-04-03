const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DocumentType = sequelize.define('DocumentType', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nameEn: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  descriptionEn: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  requiresApproval: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  approvalLevels: {
    type: DataTypes.TEXT, // Store as JSON string for SQLite compatibility
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('approvalLevels');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('approvalLevels', value ? JSON.stringify(value) : null);
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  processingTime: {
    type: DataTypes.INTEGER, // in days
    allowNull: true
  }
});

module.exports = DocumentType;