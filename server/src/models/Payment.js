const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  requestId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'bank_transfer'
  },
  paymentProofImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'verified', 'rejected']]
    }
  },
  verifiedBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = Payment;