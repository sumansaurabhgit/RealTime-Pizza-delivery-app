const Order = require("../../../models/order");

function orderController() {
  return {
    async index(req, res) {
      // ✅ Use async function
      try {
        const orders = await Order.find({ status: { $ne: "completed" } })
          .sort({ createdAt: -1 }) // ✅ Sorting latest orders first
          .populate("customerId", "-password"); // ✅ Hiding password field

        if (req.xhr) {
          return res.json(orders); // ✅ Send JSON response for AJAX requests
        } else {
          return res.render("admin/orders", { orders }); // ✅ Pass orders as an object to EJS
        }
      } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      }
    },
  };
}

module.exports = orderController;
