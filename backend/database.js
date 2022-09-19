const { Sequelize, Model, DataTypes } = require('sequelize');

require('dotenv').config();
const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE, 
    process.env.MYSQL_USER, 
    process.env.MYSQL_PASSWORD, 
    {
        host: process.env.MYSQL_HOST,
        dialect: 'mysql', 
        logging: false,
        port: process.env.MYSQL_PORT
    }
);

sequelize.sync({})

const connect = (async () => {
    try {
      await sequelize.authenticate();
      console.log('sequelize connection has been established.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  })()

const User = sequelize.define('User', 
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        firstName: { type: DataTypes.STRING, allowNull: false },
        lastName: { type: DataTypes.STRING, allowNull: false },
        city: { type: DataTypes.STRING, allowNull: false },
        zipCode: { type: DataTypes.STRING, allowNull: false },
    },
    { 
        timestamps: false
    }
)

const Password = sequelize.define('Password', 
    {
        password: { type: DataTypes.STRING, allowNull: false },
        currentlyActive: { 
            type: DataTypes.BOOLEAN, 
            defaultValue: true, 
        },
        userId: { 
            type: DataTypes.INTEGER,
            references: {
                model: 'Users', 
                key: 'id',
            },
            allowNull: false, 
            onDelete: 'CASCADE',
        },
    }, 
    {
        timestamps: true,
        createdAt: false,
        updatedAt: true,
    }
)
let initDbTables = (async () => {
    await User.sync();
    await Password.sync();
})()

let database = {
    users: {
        getUser: async (userId) => {
            try {
                return await User.findOne({ where: {id: userId}});
            } catch (error) { throw error } 
        },

        getUsers: async () => {
            try {
                return await User.findAll();
            } catch (error) { throw error }    
        },

        addUser: async (data) => {
            try {
                await User.create(data);
            } catch (error) { throw error }
        },

        deleteUser: async (userId) => {
            try {
                await User.destroy({where: {id: userId}});
            } catch (error) { throw error }     
        },
    },
    passwords : {
        getActivePasswords: async () => {
            try {
                return await Password.findAll({ where: {currentlyActive: true}});
            } catch(error) { throw error }
        },

        getPasswords: async () => {
            try {
                return await Password.findAll();
            } catch(error) { throw error }
        },
        
        addPassword: async (userId, password) => {
            try {
                await sequelize.transaction(async (t) => {
                    await Password.update(
                        { currentlyActive : false },
                        { 
                            where : { userId : userId, currentlyActive: true },
                            transaction: t
                        }
                    );
                    await Password.create(
                        {
                            userId: parseInt(userId),
                            password: password
                        }, { transaction: t }
                    )
                })
            } catch(error) {throw error}
        }
    }
}

module.exports = {
    database : database
}
  