const homeController = require("../app/http/controller/homeController");
const authController = require("../app/http/controller/authController");
const orderController = require("../app/http/controller/customers/orderController");
const cartController = require("../app/http/controller/customers/cartController");
const AdminOrderController = require("../app/http/controller/admin/orderController");
const statusController = require("../app/http/controller/admin/statusController");

//middleware
const guest = require('../app/http/middleware/guest')
const auth = require("../app/http/middleware/auth");
const admin = require("../app/http/middleware/admin");


function initRoutes(app) {
  app.get("/",homeController().index);

  app.get("/login",guest,authController().login);
  
  app.post("/login", authController().postLogin);

  app.get("/register",guest, authController().register);

  app.post("/register", authController().postRegister);

  app.post("/logout", authController().logout);

  app.get("/cart",auth, cartController().index);
  
  app.post("/update-cart", cartController().update);
  //customer routes
  app.post("/order",auth, orderController().store);

  app.get('/customers/order', auth, orderController().index);

  app.get("/customers/order/:id", auth, orderController().show);
  
  //Admin routes
  app.get("/admin/orders", admin, AdminOrderController().index);
  app.post("/admin/order/status", admin, statusController().update);
}

module.exports = initRoutes;
