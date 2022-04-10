require('dotenv').config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const SessionMongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const port = 3001;

const {
  MONGO_URI,
  COOKIE_SECRET,
  TWITTER_CALLBACK_REDIRECT,
  DREAM_ENV
} = process.env;

const {
  getOAuthRequestToken,
  getOAuthAccessTokenWith,
  oauthGetUserById,
} = require("./TwitterInterface/oauth-utilities");

const path = require("path");
const fs = require("fs");
const FakeTweet = require("./models/FakeTweet.Model");
const User = require("./models/User.Model");
const { stringify } = require("querystring");

const TEMPLATE = fs.readFileSync(
  path.resolve(__dirname, "client", "template.html"),
  { encoding: "utf8" }
);

// auth
const authorize = (req, res, next) => {
  if (!req.session.twitter_screen_name) return res.sendStatus(401);
  return next();
};
// user services
const findUser = async (screenName) => {
  const user = await User.findOne({ screenName });
  return user;
};
const addUser = async (screenName, twitterId) => {
  const user = new User({ screenName, twitterId });
  await user.save();
};

main().catch((err) => console.error(err.message, err));

async function main() {
  const app = express();
  app.use(cookieParser());
  app.use(
    session({
      saveUninitialized: false,
      resave: true,
      secret: COOKIE_SECRET || "secret",
      store: SessionMongoStore.create({
        mongoUrl: MONGO_URI,
      }),
      cookie: {
        //   maxAge: 7 * 24 * 60 * 60 * 1000, // this is the key;
        // domain: "",
        //   // the REMOTE environment is a live environment but it is not necessarily production, ex a staging environment
        // secure:,
        //   httpOnly: true,
        // sameSite: true,
      },
    })
  );

  const origins = [
    "https://www.twitter.com",
    "https://twitter.com",
    "chrome-extension://mbgafdoeommcbfkhcnngibcjfbenocmo", //chrome extension not sure if this is needed
  ];

  // NOTE: only the development environment should have a client on
  // localhost that can access the api
  const devOnlyOrigins = DREAM_ENV === "development" ? ["http://localhost:3000"] : [];


  app.use((req, res, next) => {
    console.log("silly", `${req.method}: ${req.path}`);

    cors({
      credentials: true,
      origin(origin, callback) {
        // allow requests with no origin
        // (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if ([...origins, ...devOnlyOrigins].indexOf(origin) === -1) {
          console.log("origin----", origin);
          console.log("origins----", origin);
          const msg =
            "The CORS policy for this site does not allow access from the specified Origin.";
          return callback(new Error(msg), false);
        }
        return callback(null, true);
      },
    })(req, res, next);
  });

  app.use((req, res, next) => {
    let allowedOrigin;

    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With, Accept,Content-Type"
    );
    res.setHeader("Access-Control-Allow-Origin", req.get("origin") || "");
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, HEAD, POST, PUT, DELETE, TRACE, OPTIONS, PATCH"
    );
    next();
  });
  app.use(express.json({ limit: "100kb" }));

  app.patch("/api/users", async (req, res, next) => {
    try {
      const twitterScreenName = req.session.twitter_screen_name;
      const tweet = req.body.id;
      const action = req.body.action;
      const cookies = req.cookies;
      req.session.id;
      req.session;

      const user = await User.findOne({
        screenName: twitterScreenName,
      });
      if (!user.dreamSigns) user.dreamSigns = [];
      if (user.dreamSigns.find((d) => d.id === req.body.id))
        return res.sendStatus(409);
      user.dreamSigns.push({ id: tweet, action, created_at: new Date() });
      await user.save();

      res.sendStatus(201);
    } catch (error) {
      next(new Error("Something went wrong when trying to update user"));
    }
  });
  app.patch("/api/test", async (req, res, next) => {
    console.log("test: ", Date.now());

    res.send(JSON.stringify({ l: "oii" }));
  });

  // uncomment to debug responses
  // app.use((req, res, next) => {
  //   res.on("close", async () => {
  //     console.log("res");
  //   });
  //   next();
  // });
  app.get("/users/current", authorize, async (req, res, next) => {
    const user = await findUser(req.session.twitter_screen_name);

    res.send(JSON.stringify(user));
  });

  app.get("/api/fakeTweets", authorize, async (req, res, next) => {
    try {
      const { fields } = req.query;
      if (fields === "total") {
        await FakeTweet.count().exec(async function (err, count) {
          return res.send(JSON.stringify({ total: count })).status(200);
        });
      } else {
        const user = await findUser(req.session.twitter_screen_name);
        FakeTweet.count().exec(async function (err, count) {
          // Get a random entry
          const dreamSigns = user.dreamSigns.map((d) => d.id);
          if (count === dreamSigns.length) return res.sendStatus(204);
          var random = Math.floor(Math.random() * (count - dreamSigns.length));
          // We queries all fake tweets but only fetch one offset by our random #
          FakeTweet.findOne({ _id: { $nin: dreamSigns } })
            .skip(5)
            .skip(random)
            .exec(function (err, result) {
              console.log(random, count, !!result);
              if (!result) return res.sendStatus(204);
              console.log("sending... ", result.toJSON()._id);
              res.send(result.toJSON());
            });
        });
      }
    } catch (error) {
      next(new Error("error fake tweet route "));
    }
  });
  app.post("/api/fakeTweets", authorize, async (req, res, next) => {
    const html = req.body.html;
    const tweet = new FakeTweet({
      addedBy: req.session.twitter_screen_name,
      html,
    });
    await tweet.save();

    res.send(201);
  });

  app.get("/", async (req, res, next) => {
    console.log("/ req.cookies", req.cookies);
    if (req.cookies && req.cookies.twitter_screen_name) {
      console.log("/ authorized", req.cookies.twitter_screen_name);
      return res.send(
        TEMPLATE.replace(
          "CONTENT",
          `
        <h1>Hello ${req.cookies.twitter_screen_name}</h1>
        <br>
        <a href="/twitter/logout">logout</a>
      `
        )
      );
    }
    return next();
  });
  app.use(express.static(path.resolve(__dirname, "client")));

  app.get("/twitter/logout", logout);
  function logout(req, res, next) {
    res.clearCookie("twitter_screen_name");
    req.session.destroy(() => res.redirect("/"));
  }

  // With oauth/authenticate if the user is signed into twitter.com
  // and has previously authorized the application to access their account
  // they will be silently redirected back to the app. With oauth/authorize
  // the user will see the allow screen regardless if they have previously authorized the app.
  app.get("/twitter/authenticate", twitter("authenticate")); //login
  app.get("/twitter/authorize", twitter("authorize"));

  function twitter(method = "authorize") {
    return async (req, res) => {
      console.log(`/twitter/${method}`);
      const { oauthRequestToken, oauthRequestTokenSecret } =
        await getOAuthRequestToken();
      console.log(`/twitter/${method} ->`, {
        oauthRequestToken,
        oauthRequestTokenSecret,
      });

      req.session = req.session || {};
      req.session.oauthRequestToken = oauthRequestToken;
      req.session.oauthRequestTokenSecret = oauthRequestTokenSecret;
      const authorizationUrl = `https://api.twitter.com/oauth/${method}?oauth_token=${oauthRequestToken}`;
      console.log("redirecting user to ", authorizationUrl);
      res.redirect(authorizationUrl);
    };
  }

  app.get("/twitter/callback", async (req, res) => {
    const { oauthRequestToken, oauthRequestTokenSecret } = req.session;
    const { oauth_verifier: oauthVerifier } = req.query;
    console.log("/twitter/callback", {
      oauthRequestToken,
      oauthRequestTokenSecret,
      oauthVerifier,
    });

    const { oauthAccessToken, oauthAccessTokenSecret, results } =
      await getOAuthAccessTokenWith({
        oauthRequestToken,
        oauthRequestTokenSecret,
        oauthVerifier,
      });
    req.session.oauthAccessToken = oauthAccessToken;

    const { user_id: userId /*, screen_name */ } = results;
    const user = await oauthGetUserById(userId, {
      oauthAccessToken,
      oauthAccessTokenSecret,
    });

    req.session.twitter_screen_name = user.screen_name;
    req.session.twitter_id = user.id;
    if (!(await findUser(user.screen_name))) {
      addUser(user.screen_name, user.id);
    }
    res.cookie("twitter_screen_name", user.screen_name, {
      maxAge: 900000,
      httpOnly: true,
    });
    req.session.user = console.log(
      "user succesfully logged in with twitter",
      user.screen_name
    );
    // NOTE: it might be fine to just redirect to '/' for all cases? hostname is inferred
    req.session.save(() => res.redirect(TWITTER_CALLBACK_REDIRECT));
  });

  app.use((err, req, res, next) => {
    res.status(500).send(err.message);
  });

  // run the server after connecting to the database
  const dbConnect = async (dsn) =>
    mongoose.connect(dsn, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useFindAndModify: false,
    });

  dbConnect(MONGO_URI)
    .then(() => {
      console.log(`Connected to MongoDB ${"dreamy twitter"}`);
      app
        .listen(port)
        .on("listening", () =>
          console.log("info", `HTTP server listening on port ${port}`)
        );
    })
    .catch((err) => {
      console.error(err);
    });
}
