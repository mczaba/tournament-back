const Tournament = require("../models/Tournament");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const validator = require("express-validator");

exports.createTournament = [
  validator.body("name", "need 6 characters name").isLength({ min: 6 }).trim(),
  validator.body("date", "need a date").isLength({ min: 1 }).trim(),
  (req, res, next) => {
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error(errors.errors[0].msg);
      error.statusCode = 220;
      next(error);
    } else {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, "11051990");
      if (!decodedToken) {
        const error = new Error("Unauthorized");
        error.statusCode = 500;
        next(error);
      } else {
        const userID = decodedToken.id;
        User.findById(userID)
          .then((foundUser) => {
            if (!foundUser) {
              throw error;
            } else {
              const newTournament = new Tournament({
                name: req.body.name,
                creator: foundUser,
                startTime: new Date(req.body.date),
                players: []
              });
              return newTournament.save();
            }
          })
          .then((tournament) => {
            res.send("success");
          })
          .catch((error) => {
            next(error);
          });
      }
    }
  }
];

exports.joinTournament = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, "11051990");
  let user = null;
  if (!decodedToken) {
    const error = new Error("Unauthorized");
        error.statusCode = 500;
        next(error);
  } else {
    const userID = decodedToken.id;
    User.findById(userID)
      .then((foundUser) => {
        if (!foundUser) {
          throw error;
        } else {
          user = foundUser;
          return Tournament.findById(req.body.tournamentID);
        }
      })
      .then((foundTournament) => {
        foundTournament.players.push(user);
        return foundTournament.save();
      })
      .then((tournament) => {
        res.send("success");
      })
      .catch((error) => {
        next(error);
      });
  }
};
