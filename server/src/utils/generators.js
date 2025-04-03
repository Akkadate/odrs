const crypto = require('crypto');

// Generate a unique request number
exports.generateRequestNumber = () => {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `REQ-${timestamp}-${random}`;
};

// Generate a document number
exports.generateDocumentNumber = () => {
  const year = new Date().getFullYear().toString();
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `DOC-${year}${month}-${random}`;
};

// Generate a verification code for documents
exports.generateVerificationCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};