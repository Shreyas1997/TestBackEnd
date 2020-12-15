const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const cors = require("cors");
require("dotenv").config();

const Admin = require("./api/models/admin");
const studentRoute = require("./api/routes/student");
const adminRoute = require("./api/routes/admin");

mongoose
    .connect( /*process.env.MONGO_URL ||*/ "mongodb://localhost:27017/Exam", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
    })
    .then(async(result) => {
        var adminExist = await Admin.findOne({
            adminName: process.env.ADMIN_NAME,
        }).exec();
        if (adminExist != null) {
            console.log("Connected to DB");
        } else {
            bcrypt.hash(process.env.ADMIN_PASS, 10, async(err, hash) => {
                if (err) {
                    return res.status(500).json({
                        error: err,
                    });
                } else {
                    const newAdmin = new Admin({
                        adminName: process.env.ADMIN_NAME,
                        password: hash,
                    });
                    await newAdmin
                        .save()
                        .then((result) => {
                            console.log("Admin Created");
                            console.log("Connected to DB");
                        })
                        .catch((err) => {
                            res.status(500).json({
                                error: err,
                            });
                        });
                }
            });
        }
    })
    .catch((error) => {
        console.log(error);
    });
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 3600000,
            httpOnly: true,
        },
    })
);
var corsOptions = {
    origin: "http://localhost:4200",
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

/*app.use((error, req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Headers", "PUT, POST, GET");
    return res.status(200).json({});
  }else{
    res.status(error.status || 500);
  }

  next();
});*/

// Routes which should handle requests
app.use("/student", studentRoute);
app.use("/admin", adminRoute);

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        },
    });
});

module.exports = app;