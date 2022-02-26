/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('products_generator', {
        product_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        category_id: {
            type: DataTypes.INTEGER(10),
            allowNull: true,
            references: {
                model: 'product_categories',
                key: 'category_id'
            }
        },
        bussiness_id: {
            type: DataTypes.INTEGER(10),
            allowNull: true,
            references: {
                model: 'bussiness',
                key: 'bussiness_id'
            }
        },
        pending_status: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: 'pending'
        },
        product_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        product_code: {
            type: DataTypes.INTEGER(10),
            allowNull: true
        },
        hs_code: {
            type: DataTypes.INTEGER(10),
            allowNull: true
        },
        min_units_per_order: {
            type: DataTypes.INTEGER(20),
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        unit_price: {
            type: DataTypes.INTEGER(10),
            allowNull: true
        },
        size: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        color: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        unit_weight: {
            type: DataTypes.INTEGER(10),
            allowNull: true
        },
        main_picture: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        extra_picture1: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        extra_picture2: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        has_discount: {
            type: "BINARY(1)",
            allowNull: true
        },
        discount_amount: {
            type: DataTypes.INTEGER(10),
            allowNull: true
        },
        availability: {
            type: "BINARY(1)",
            allowNull: true
        },
        product_rating: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        user_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        cart_id: {
            type: DataTypes.INTEGER(10),
            allowNull: true,
            references: {
                model: 'cart',
                key: 'cart_id'
            }
        },
        quantity: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: '1'
        },
        in_cart: {
            type: DataTypes.INTEGER(1),
            allowNull: false,
            defaultValue: 0
        },
        category_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        buy_number: {
            type: DataTypes.INTEGER(1),
            allowNull: false,
            defaultValue: 0
        },

        buy_counter: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 0
        },
        governorate: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        region: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        rating: {
            type: DataTypes.INTEGER(11),
            defaultValue: 0,
            allowNull: false,
        },
        rate_counter: {
            type: DataTypes.INTEGER(11),
            defaultValue: 0,
            allowNull: false,
        },
        category_items_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        }

    }, {
        tableName: 'products_generator',

    });
};