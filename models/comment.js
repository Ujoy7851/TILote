const Sequelize = require('sequelize');

module.exports = class Comment extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      level: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0
      },
      reply_to: {
        type: Sequelize.UUID,
        allowNull: true
      }
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'Comment',
      tableName: 'comments',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
  }

  static associate(db) {
    db.Comment.belongsTo(db.Post);
  }
};