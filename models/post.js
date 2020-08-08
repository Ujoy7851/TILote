const Sequelize = require('sequelize');

module.exports = class Post extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      title: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      thumbnail: {
        type: Sequelize.STRING(255),
        allowNUll: true
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      likes: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0
      },
      is_private: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      views: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0
      },
      description: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      published_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'Post',
      tableName: 'posts',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
  }

  static associate(db) {
    db.Post.belongsTo(db.User);
    db.Post.belongsToMany(db.Tag, { through: 'PostTag' });
    db.Post.belongsToMany(db.User, { through: 'Like' });
  }
};