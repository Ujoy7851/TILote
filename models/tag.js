const Sequelize = require('sequelize');

module.exports = class Tag extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      name: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
        set(val) {
          this.setDataValue('name', val.toLowerCase());
        }
      }
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'Tag',
      tableName: 'tags',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
  }

  static associate(db) {
    db.Tag.belongsToMany(db.Post, { through: 'PostTag' });
  }
}