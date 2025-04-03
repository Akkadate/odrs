const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  requestId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [
        ['request_created', 'payment_verified', 'payment_rejected', 'status_updated', 
         'approval_needed', 'approval_updated', 'document_ready', 'document_shipped', 
         'request_completed', 'request_rejected']
      ]
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  titleEn: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  messageEn: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  emailSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  smsSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Notification;