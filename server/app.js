"use strict";
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const expressJWT = require("express-jwt");
const cors = require('cors');
// const { userSchema, postSchema, commentSchema } = require("./schema");

const app = express();

app.use(cors({ origin: "*" }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve("..", "client", "build")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve("..", "client", "build", "index.html"))
  );
} else if (process.env.NODE_ENV === "development") {
  var corsOptions = {
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200,
  };
  app.use(corsOptions);
}

app.use(
  "/",
  expressJWT
    .expressjwt({
      secret: process.env.SECRET,
      algorithms: ["HS256"],
    })
    .unless({ path: [/\/user/] })
);

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://localhost:27017/testdb", (err, client) => {
  if (err) throw err;
  if (client) console.log("---Mongodb Connected---\n");
});

const userSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: Buffer,
  },
  bio: {
    type: String,
  },
});

const postSchema = new mongoose.Schema({
  postId: {
    type: Number,
    required: true,
  },
  userId: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: [{ type: Number }],
  ups: {
    type: Number,
    required: true,
  },
  downs: {
    type: Number,
    required: true,
  },
  lastEdit: {
    type: Number,
    required: true,
  },
});

const contentSchema = new mongoose.Schema({
  contentId: {
    type: Number,
    required: true,
  },
  postId: {
    type: Number,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  storage: {
    type: String,
    required: true,
  },
});

const commentSchema = new mongoose.Schema({
  commentId: {
    type: Number,
    required: true,
  },
  userId: {
    type: Number,
    required: true,
  },
  postId: {
    type: Number,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  lastEdit: {
    type: Number,
    required: true,
  },
});

const User = mongoose.model("Users", userSchema);
const Post = mongoose.model("Posts", postSchema);
const Content = mongoose.model("Contents", contentSchema);
const Comment = mongoose.model("Comments", commentSchema);

app.get("/user/validate/:username", (req, res) => {
  const { username } = req.params;
  User.findOne({ username: username }, (err, user) => {
    if (err) throw err;
    if (user) return res.send({ exists: true });
    else return res.send({ exists: false });
  });
});

app.post("/user/signup", (req, res) => {
  const { username, password, bio } = req.body;
  User.findOne({ username: username }, (err, user) => {
    if(err) throw err
    if(user) return res.status(400).send({
      success: false,
      errno: "USEREXISTS"
    })
  })
  if (
    password.length < 8 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[~`!@#\$%\^&\*\(\)-_\+=\{\}\[\]|\\;:"<>,\.\/\?]/.test(password)
  )
    return res.status(400).send({
      success: false,
      errno: "PWDINVALID",
    });
  bcrypt.genSalt(10, (err, salt) => {
    if (err) throw err;
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) throw err;
      new User({
        userId: Date.now(),
        username: username,
        password: hash,
        avatar: null,
        bio: bio,
      }).save((err) => {
        if (err) throw err;
        return res.status(201).send({
          success: true,
        });
      });
    });
  });
});

app.post("/user/signin", (req, res) => {
  const { username, password } = req.body;
  User.findOne({ username: username }, (err, user) => {
    if (err) throw err;
    if (!user)
      return res.status(404).send({
        success: false,
        errno: "USERNOTFOUND",
      });
    bcrypt.compare(password, user.password, (err, match) => {
      if (err) throw err;
      if (!match)
        return res.status(400).send({
          success: false,
          errno: "PWDNOTMATCH",
        });
      const jwtPayload = {
        userId: user.userId,
        username: user.username,
      };
      jwt.sign(
        jwtPayload,
        process.env.SECRET,
        {
          expiresIn: "2m",
        },
        (err, token) => {
          if (err) throw err;
          res.send({
            success: true,
            token,
          });
        }
      );
    });
  });
});

app.post("/post/create", (req, res) => {
  const { userId, title } = req.body;
  User.findOne({ userId: userId }, (err, user) => {
    if (err) throw err;
    if (!user)
      return res.send(400).send({
        success: false,
        errno: "USERNOTFOUND",
      });
    let now = Date.now();
    new Post({
      postId: now,
      userId: userId,
      title: title,
      content: [],
      ups: 0,
      downs: 0,
      lastEdit: now,
    }).save((err) => {
      if (err) throw err;
      return res.status(201).send({
        success: true,
      });
    });
  });
});

app.post("/post/push", (req, res) => {
  const { postId, language, storage } = req.body;
  Post.findOne({ postId: postId }, (err, post) => {
    if (err) throw err;
    if (!post)
      return res.status(400).send({
        success: false,
        errno: "POSTNOTFOUND",
      });
    new Content({
      contentId: Date.now(),
      postId: postId,
      language: language,
      storage: storage,
    }).save((err) => {
      if (err) throw err;
      res.status(201).send({
        success: true,
      });
    });
  });
});

app.post("/comment/write", (req, res) => {
  const { userId, postId, content } = req.body;
  User.findOne({ userId: userId }, (err, user) => {
    if (err) throw err;
    if (!user)
      return res.status(401).send({
        success: false,
        errno: "USERNOTFOUND",
      });
    Post.findOne({ postId: postId }, (err, post) => {
      if (err) throw err;
      if (!post)
        return res.status(401).send({
          success: false,
          errno: "POSTNOTFOUND",
        });
      let now = Date.now();
      new Comment({
        commentId: now,
        userId: userId,
        postId: postId,
        content: content,
      }).save((err) => {
        if (err) throw err;
        return res.status(201).send({
          success: true,
        });
      });
    });
  });
});

module.exports = app;
