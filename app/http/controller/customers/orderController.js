const moment=require('moment')
const Order = require('../../../models/order')

function orderController() {
    return {
        store(req, res) {
            const { phone, address} = req.body;
            if (!phone || !address) {
                req.flash('error', 'All fields are required')
                return res.redirect('/cart')
            }

            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone,
                address
            })
            order.save().then(result => {
                Order.populate(result, { path: "customerId" }).then(
                  (placedOrder) => {
                    req.flash("success", "Order placed successfully");
                    delete req.session.cart;

                    // Emit
                    const eventEmitter = req.app.get("eventEmitter");
                    eventEmitter.emit("orderPlaced", placedOrder);

                    res.redirect("/customers/order");
                  }
                );
            }).catch(err => {
                req.flash('error', 'Something went wrong')
                return res.redirect('/cart')
            })
        },
        async index(req, res) {
            const orders = await Order.find({ customerId: req.user._id },
                null,
                { sort: { 'createdAt': -1 } })
            //req.header('Cache-Control',)
           // orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            res.render("customers/order", { orders: orders ,moment:moment})
            //console.log(orders)
        },
        async show(req, res) {
            const order = await Order.findById(req.params.id)
            //Authorized user
            if (req.user._id.toString() === order.customerId.toString()) {
                return res.render('customers/singleOrder',{order})
            } else {
                return res.redirect('/');
            }
        }
    }
}

module.exports = orderController