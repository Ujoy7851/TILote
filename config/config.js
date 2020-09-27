// require('dotenv').config();

module.exports = {
  "development": {
    "username": "root",
    "password": process.env.SEQUELIZE_PASSWORD,
    "database": "tilote",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "operatorsAliases": false
  },
  "test": {
    "username": "root",
    "password": process.env.SEQUELIZE_PASSWORD,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "admin",
    "password": process.env.SEQUELIZE_PASSWORD,
    "database": "tilote",
    "host": process.env.DB_HOST,
    "port": process.env.DB_PORT,
    "dialect": "mysql",
    "operatorsAliases": false,
    "logging": false,
    "maxConcurrentQueries": 100,
    "ssl": "Amazon RDS",
    "pool": { maxConnections: 5, maxIdleTime: 30 }
  }
}
