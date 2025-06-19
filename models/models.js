const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const bcrypt = require('bcrypt');

// Модель користувача
const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // Додаткові поля для профілю
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: true
    },
    height: {
        type: DataTypes.INTEGER, // в см
        allowNull: true,
        validate: {
            min: 100,
            max: 250
        }
    },
    weight: {
        type: DataTypes.FLOAT, // в кг
        allowNull: true,
        validate: {
            min: 30,
            max: 300
        }
    },
    activityLevel: {
        type: DataTypes.ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'),
        allowNull: true,
        defaultValue: 'moderately_active'
    },
    healthGoals: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: []
    },
    preferences: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {
            notifications: true,
            emailNotifications: true,
            theme: 'light',
            language: 'uk',
            waterGoal: 2000,
            sleepGoal: 8,
            activityGoal: 30
        }
    },
    lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
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

User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Модель записів здоров'я
const HealthEntry = sequelize.define('HealthEntry', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    mood: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    sleepHours: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0,
            max: 24
        }
    },
    waterIntake: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    activityMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    activityType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    steps: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0
        }
    },
    caloriesBurned: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0
        }
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: []
    }
});

// Модель нагадувань
const Reminder = sequelize.define('Reminder', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    repeatType: {
        type: DataTypes.ENUM('none', 'daily', 'weekly', 'monthly'),
        defaultValue: 'none'
    },
    daysOfWeek: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    }
});

// Модель цитат
const Quote = sequelize.define('Quote', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    author: {
        type: DataTypes.STRING,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

// Модель refresh токенів
const RefreshToken = sequelize.define('RefreshToken', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
});

// Встановлення зв'язків між моделями
HealthEntry.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(HealthEntry, { foreignKey: 'userId' });

Reminder.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Reminder, { foreignKey: 'userId' });

module.exports = {
    User,
    HealthEntry,
    Reminder,
    Quote,
    RefreshToken,
};