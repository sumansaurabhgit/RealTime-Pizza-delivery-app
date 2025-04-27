require("dotenv").config();
const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const expressLayout = require("express-ejs-layouts");
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const url = "mongodb://127.0.0.1:27017/pizza";
const session = require("express-session");
const flash = require("express-flash");
const MongoStore = require("connect-mongo");
const passport = require('passport');
const Emitter=require('events')

//databse connection
mongoose.connect(process.env.MONGO_CONNECTION_URL);
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("Database connected....");
});
// Handle connection errors
connection.on("error", (err) => {
  console.log("MongoDB connection error:", err);
});

//session store
const mongoStore = MongoStore.create({
  mongoUrl: url, // Use mongoUrl instead of mongooseConnection
  collectionName: "session",
});
//event emmiter

const eventEmitter = new Emitter()
app.set('eventEmitter',eventEmitter)
//session config
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false, // Prevent the session from being created if it's not modified
    cookie: {
      maxAge: 1000 *60*60*24, // Session expires after 1 hour
    },
  })
);
app.use(flash());

//passport config
const passportInit=require('./app/config/passport')
passportInit(passport)

app.use(passport.initialize())
app.use(passport.session())

//Asset
app.use(express.static("public"));
app.use(express.urlencoded({extended:false}))
app.use(express.json())

//Global middleware
app.use((req, res, next) => {
  res.locals.session = req.session
  res.locals.user=req.user
  next()
})
//set template engine
app.use(expressLayout);
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");

//app.use(express.static('public'));
require("./routes/web")(app);
app.use((req, res) => {
  res.status(404).send('<h1>404,page not found</h1>')
})

const server=app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
//socket

const io = require('socket.io')(server);
io.on('connection', (socket) => {
  //join
 // console.log(socket.id)
  socket.on('join', (orderId) => {
    //console.log(orderId)
    socket.join(orderId)
  })
})

eventEmitter.on('orderUpdated', (data) => {
  io.to(`order_${data.id}`).emit('orderUpdated',data)
})

eventEmitter.on('orderPlaced', (data) => {
  io.to('adminRoom').emit('orderPlaced',data)
})
