const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true, 
    primaryKey: true
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  staffId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstNameEn: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastNameEn: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'student',
    validate: {
      isIn: [['student', 'staff', 'approver', 'admin']]
    }
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  faculty: {
    type: DataTypes.STRING,
    allowNull: true
  },
  approverLevel: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['advisor', 'department_head', 'dean', 'registrar', null]]
    }
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'th',
    validate: {
      isIn: [['th', 'en']]
    }
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordExpire: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Method to check password
User.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;