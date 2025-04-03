const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Approval = sequelize.define('Approval', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  requestId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  approverId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  approverLevel: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['advisor', 'department_head', 'dean', 'registrar']]
    }
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'approved', 'rejected', 'more_info']]
    }
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  signature: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reminderCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastReminderSentAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = Approval;