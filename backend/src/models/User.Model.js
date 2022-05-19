const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema({
  screenName: {
    type: String,
  },
  twitterId: {
    type: String,
  },
  dreamSigns: [
    {
      type: Object,
    },
  ],
});

const UserTweet = mongoose.model("User", userSchema);

module.exports = UserTweet;
