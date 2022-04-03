const mongoose = require("mongoose");

const { Schema } = mongoose;

const fakeTweetSchema = new Schema({
  html: {
    type: String,
  },
  addedBy: {
    type: String,
  },
});

const FakeTweet = mongoose.model("FakeTweet", fakeTweetSchema);

module.exports = FakeTweet;
