const User = require('./User');
const DocumentType = require('./DocumentType');
const Request = require('./Request');
const Payment = require('./Payment');
const Approval = require('./Approval');
const Notification = require('./Notification');

// Define model relationships
User.hasMany(Request, { foreignKey: 'userId' });
Request.belongsTo(User, { foreignKey: 'userId' });

DocumentType.hasMany(Request, { foreignKey: 'documentTypeId' });
Request.belongsTo(DocumentType, { foreignKey: 'documentTypeId' });

Request.hasMany(Payment, { foreignKey: 'requestId' });
Payment.belongsTo(Request, { foreignKey: 'requestId' });

Request.hasMany(Approval, { foreignKey: 'requestId' });
Approval.belongsTo(Request, { foreignKey: 'requestId' });

User.hasMany(Approval, { foreignKey: 'approverId' });
Approval.belongsTo(User, { foreignKey: 'approverId', as: 'approver' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

Request.hasMany(Notification, { foreignKey: 'requestId' });
Notification.belongsTo(Request, { foreignKey: 'requestId' });

module.exports = {
  User,
  DocumentType,
  Request,
  Payment,
  Approval,
  Notification
};