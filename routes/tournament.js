const express = require('express');
const router = express.Router();
const TournamentController = require("../controllers/TournamentController");

router.post("/create", TournamentController.createTournament);
router.post("/join", TournamentController.joinTournament);

module.exports = router;