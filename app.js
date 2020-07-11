const express = require("express");
const multer = require("multer");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

const app = express();

const userRouter = require("./routes/user");
const tournamentRouter = require("./routes/tournament");

var mongoose = require("mongoose");
mongoose.connect(process.env.DB_CONNECT, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use(multer().none());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, authorization"
  );
  next();
});

app.use("/API/users", userRouter);
app.use("/API/tournament", tournamentRouter);

app.use((error, req, res, next) => {
  console.log(`from error middleware : ${error}`);
  res.status(error.statusCode).send(error.message);
});

app.listen(PORT);
