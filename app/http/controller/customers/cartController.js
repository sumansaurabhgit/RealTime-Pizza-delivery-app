const { json } = require('express');

function cartController() {
  return {
    index(req, res) {
      res.render("customers/cart");
    },
    update(req, res) {
      // cart section contains data in this format
              // let cart = {
              //     items: {
              //         pizzaId: { items: pizzaObject, qty: 0 },
              //         pizzaId:{items:pizzaObject,qty:0},
              //     }
              // }
      //return res.json({data:'everything is fine'})
      //for the first time creating cart
        if (!req.session.cart) {
          req.session.cart = {
            items: {},
            totalQty: 0,
            totalPrice: 0,
          }
        }

        let cart = req.session.cart;

        if (!cart.items[req.body._id]) {
          cart.items[req.body._id] = {
            item: req.body,
            qty: 1,
          }
          cart.totalQty = cart.totalQty + 1;
          cart.totalPrice = cart.totalPrice + req.body.price;
        } else {
          cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1;
          cart.totalQty = cart.totalQty + 1;
          cart.totalPrice = cart.totalPrice + req.body.price;
        }
        return res.json({ totalQty: req.session.cart.totalQty })
    },
  }
}

module.exports = cartController;


