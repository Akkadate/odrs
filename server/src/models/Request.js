const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Request = sequelize.define('Request', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  requestNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  documentTypeId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  language: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'th',
    validate: {
      isIn: [['th', 'en']]
    }
  },
  deliveryMethod: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['pickup', 'mail', 'digital']]
    }
  },
  deliveryAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  shippingFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending_payment',
    validate: {
      isIn: [['pending_payment', 'pending_approval', 'in_process', 'ready_for_pickup', 'shipped', 'completed', 'rejected', 'cancelled']]
    }
  },
  paymentStatus: {
    type: DataTypes.STRING,
    defaultValue: 'unpaid',
    validate: {
      isIn: [['unpaid', 'pending', 'paid', 'refunded']]
    }
  },
  currentApprovalLevel: {
    type: DataTypes.STRING,
    allowNull: true
  },
  trackingNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estimatedCompletionDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  documentNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  verificationCode: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = Request;