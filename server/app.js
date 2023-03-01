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
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  "/",
  expressJWT
    .expressjwt({
      secret: process.env.SECRET,
      algorithms: ["HS256"],
    })
    .unless({ path: [/\/user/, /\/post\/last/] })
);

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://localhost:27017/testdb", (err, client) => {
  if (err) throw err;
  if (client) console.log("---Mongodb Connected---\n");
});

const User = require("./model/User");
const Post = require("./model/Post");
const Content = require("./model/Content");
const Comment = require("./model/Comment");

// check is username already exists
app.get("/user/validate/:username", (req, res) => {
  const { username } = req.params;
  User.findOne({ username: username }, (err, user) => {
    if (err) throw err;
    if (user) return res.send({ exists: true });
    else return res.send({ exists: false });
  });
});

// user signup and login
app.post("/user/signup", (req, res) => {
  const { username, password, bio } = req.body;
  User.findOne({ username: username }, (err, user) => {
    if (err) throw err;
    if (user)
      return res.status(400).send({
        success: false,
        errno: "USEREXISTS",
      });
  });
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
          expiresIn: "2h",
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

app.get("/profile/info", (req, res) => {
  const { userId, username } = req.auth;
  User.findOne({ userId: userId }, (err, user) => {
    if (err) throw err;
    if (!user)
      return res.status(404).send({
        success: false,
        errno: "USERNOTFOUND",
      });
    return res.send({
      success: true,
      username,
      avatar: user.avatar,
      bio: user.bio,
      userId: userId,
    });
  });
});

app.post("/profile/update", (req, res) => {
  const { userId } = req.auth;
  const { username, bio } = req.body;
  User.findOne({ userId: userId }, (err, user) => {
    if (err) throw err;
    if (!user)
      return res.status(404).send({
        success: false,
        errno: "USERNOTFOUND",
      });
    user.username = username;
    user.bio = bio;
    user.save((err, update) => {
      if (err) throw err;
      return res.send({
        success: true,
        update,
      });
    });
  });
});

// create a post with empty template
app.post("/post/create", (req, res) => {
  const { userId } = req.auth
  const { title, firstContent } = req.body;
  if(!title || !firstContent) return res.status(403).send({
    success: false,
    errno: 'INFOMISSING'
  })
  User.findOne({ userId: userId }, (err, user) => {
    if (err) throw err;
    if (!user)
      return res.send(400).send({
        success: false,
        errno: "USERNOTFOUND",
      });
    let now = Date.now();
    new Content({
      contentId: now,
      language: 'raw',
      storage: firstContent
    }).save((err) => {
      if(err) throw err
      new Post({
        postId: now,
        userId: userId,
        title: title,
        contents: [now],
        ups: [],
        downs: [],
        lastEdit: now,
      }).save((err) => {
        if (err) throw err;
        return res.status(201).send({
          success: true,
        });
      });
    })
  });
});

// get last few records to display on index page
app.get("/post/last", (req, res) => {
  Post.find()
    .sort({ id: -1 })
    .limit(5)
    .exec((err, posts) => {
      if (err) throw err;
      if (!posts)
        return res.status(404).send({
          success: true,
          errno: "NOPOSTEXISTS",
        });
      return res.send({
        success: true,
        posts,
      });
    });
});

// add a snippet/segment to post template
app.post("/post/push", (req, res) => {
  const { postId, language, storage } = req.body;
  Post.findOne({ postId: postId }, (err, post) => {
    if (err) throw err;
    if (!post)
      return res.status(400).send({
        success: false,
        errno: "POSTNOTFOUND",
      });
    let now = Date.now();
    new Content({
      contentId: now,
      language: language,
      storage: storage,
    }).save((err) => {
      if (err) throw err;
      post.contents.push(now);
      post.save();
      res.status(201).send({
        success: true,
      });
    });
  });
});

// query posts with title
app.get("/post/query/:title", (req, res) => {
  const { title } = req.params;
  Post.find({ title: { $regex: title, $options: "i" } }, (err, posts) => {
    if (err) throw err;
    return res.send({
      success: true,
      posts,
    });
  });
});

app.get("/post/get/:postId", (req, res) => {
  let userId, vote
  if(req.auth) userId = req.auth.userId
  const { postId } = req.params;
  Post.findOne({ postId: postId }, (err, post) => {
    if (err) throw err;
    if (!post)
      return res.status(404).send({
        success: false,
        errno: "IDINVALID",
      });
    Content.findOne({ contentId: post.contents[0] }, (err, content) => {
      if(err) throw err
      if(post.ups.includes(userId)) vote = true;
      else if(post.downs.includes(userId)) vote = false
      else vote = null
      return res.send({
        success: true,
        post,
        firstContent: content.storage,
        vote: vote
      });
    })
  });
});

app.post("/post/vote", (req, res) => {
  const { userId } = req.auth;
  const { postId, vote } = req.body;
  User.findOne({ userId: userId }, (err, user) => {
    if (err) throw err;
    if (!user)
      return res.status(404).send({
        success: false,
        errno: "USERNOTFOUND",
      });
    Post.findOne({ postId: postId }, (err, post) => {
      if (err) throw err;
      if (!post)
        return res.status(404).send({
          success: false,
        });
      if (post.ups.includes(userId) || post.downs.includes(userId))
        return res.status(403).send({
          success: false,
          errno: "ALREADYVOTED",
        });
      if (vote) post.ups.push(userId);
      else post.downs.push(userId);
      post.save((err) => {
        if (err) throw err;
        return res.send({
          success: true,
        });
      });
    });
  });
});

/* 
get a snippet/segment with id
since contents are stored in the array as numbers of the post
 */
app.get("/content/query/:id", (req, res) => {
  const { id } = req.params;
  Content.findOne({ contentId: id }, (err, content) => {
    if (err) throw err;
    if (!content)
      return res.status(404).send({
        success: false,
        errno: "NOSUCHCONTENT",
      });
    return res.send({
      success: true,
      content,
    });
  });
});

// write a comment
// app.post("/comment/write", (req, res) => {
//   const { userId, postId, content } = req.body;
//   User.findOne({ userId: userId }, (err, user) => {
//     if (err) throw err;
//     if (!user)
//       return res.status(401).send({
//         success: false,
//         errno: "USERNOTFOUND",
//       });
//     Post.findOne({ postId: postId }, (err, post) => {
//       if (err) throw err;
//       if (!post)
//         return res.status(401).send({
//           success: false,
//           errno: "POSTNOTFOUND",
//         });
//       let now = Date.now();
//       new Comment({
//         commentId: now,
//         userId: userId,
//         postId: postId,
//         content: content,
//         lastEdit: now,
//       }).save((err) => {
//         if (err) throw err;
//         return res.status(201).send({
//           success: true,
//         });
//       });
//     });
//   });
// });

module.exports = app;
