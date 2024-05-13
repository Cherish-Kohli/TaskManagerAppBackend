var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const db = require("./db");
const session = require('express-session');
require('dotenv').config();
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./docs/openapi.json');


var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: 'auto', httpOnly: true, maxAge: 3600000 } // Secure: auto enables secure cookies if the site is accessed over HTTPS
}));

app.use((req, res, next) => {
    req.db = db; // Assign the Knex instance to req.db
    next();
  });
  

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.get("/version", (req, res) => {
    req.db.raw("SELECT VERSION()")
      .then((version) => res.send(version[0][0]))
      .catch(err => res.status(500).send("Database error"));
  });

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
