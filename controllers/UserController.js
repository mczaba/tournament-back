const User = require("../models/User");
const validator = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.post_SignUp = [
  validator
    .body("username", "need 6 characters username")
    .isLength({ min: 6 })
    .trim(),
  validator
    .body("email", "Email required")
    .isLength({ min: 1 })
    .isEmail()
    .trim(),
  validator
    .body("password", "Password must be at least 6 characters long")
    .isLength({ min: 6 })
    .trim(),
  validator
    .body("passwordConf", "Passwords dont match")
    .custom((value, { req, loc, path }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords don't match");
      } else {
        return value;
      }
    }),
  validator.sanitizeBody("username").escape(),
  validator.sanitizeBody("email").escape(),
  validator.sanitizeBody("password").escape(),
  (req, res, next) => {
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error(errors.errors[0].msg);
      error.statusCode = 220;
      next(error);
    } else {
      const username_low = req.body.username.toLowerCase();
      User.findOne({ username_lower: username_low })
        .then((foundUser) => {
          if (foundUser) {
            const error = new Error("This username is already taken");
            error.statusCode = 220;
            throw error;
          }
          return User.findOne({ email: req.body.email });
        })
        .then((foundUser) => {
          if (foundUser) {
            console.log("same email");
            const error = new Error("This email is already used");
            error.statusCode = 220;
            throw error;
          }
          bcrypt.hash(req.body.password, 10, (err, hashedpassword) => {
            const user = new User({
              username: req.body.username,
              email: req.body.email,
              password: hashedpassword,
              username_lower: username_low,
              elo: 1000
            });
            return user.save();
          });
        })
        .then((user) => {
          res.send("success");
        })
        .catch((error) => {
          next(error);
        });
    }
  }
];

exports.post_LogIn = (req, res, next) => {
  let user = null;
  const username_low = req.body.username.toLowerCase();
  User.findOne({ username_lower: username_low })
    .then((foundUser) => {
      if (!foundUser) {
        const error = new Error("No user with that username");
        error.statusCode = 401;
        error.tosend = "No user with that username";
        throw error;
      } else {
        user = foundUser;
        return bcrypt.compare(req.body.password, foundUser.password);
      }
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong password");
        error.statusCode = 401;
        error.tosend = "Wrong password";
        throw error;
      }
      const token = jwt.sign(
        {
          username: user.username,
          id: user._id
        },
        "11051990",
        { expiresIn: "24h" }
      );
      res
        .status(200)
        .json({ token: token, username: user.username, id: user._id });
    })
    .catch((err) => {
      next(err);
    });
};

exports.get_refresh = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, "11051990");
  if (!decodedToken) {
    const error = new Error("Unauthorized");
    error.statusCode = 500;
    next(error);
  } else {
    const username = decodedToken.username;
    const id = decodedToken.id;
    const token = jwt.sign(
      {
        username: username,
        id: id
      },
      "11051990",
      { expiresIn: "24h" }
    );
    res.status(200).json({ token: token, username: username });
  }
};
