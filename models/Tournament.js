const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TournamentSchema = new Schema({
  name: { type: String, required: true },
  creator: Schema.Types.ObjectId,
  startTime: { type: Date, required: true },
  players: [Schema.Types.ObjectId]
});

module.exports = mongoose.model("Tournament", TournamentSchema);
