const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model{
  static init(sequelize) {
    return super.init({
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      provider: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      social_id: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      thumbnail: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      about: {
        type: Sequelize.STRING(255),
        allowNull: true
      }
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'User',
      tableName: 'users',
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.User.hasMany(db.Post);
    db.User.belongsToMany(db.Post, {
      through: 'Like',
      as: 'Liked'
    });
  }
};