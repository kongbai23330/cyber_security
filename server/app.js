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
const multer = require("multer");

const app = express();
const upload = multer();

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
    .unless({
      path: [
        /\/user/,
        /\/post\/last/,
        /^\/post\/get\/\w+$/,
        /^\/post\/get\/\d+\/\d+$/,
        /^\/post\/query\/\w+$/,
        /^\/content\/get\/\w+$/,
        /^\/profile\/basic\/\w+$/,
        /^\/profile\/getava\/\w+$/,
        /^\/comment\/get\/\w+$/,
      ],
    })
);

const User = require("./model/User");
const Post = require("./model/Post");
const Content = require("./model/Content");
const Comment = require("./model/Comment");
const Avatar = require("./model/Avatar");

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://localhost:27017/testdb", (err, client) => {
  if (err) throw err;
  if (client) console.log("---Mongodb Connected---\n");
  Post.findOne({ userId: 0 }, (err, admin) => {
    if (err) throw err;
    if (!admin) {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;
        bcrypt.hash("getunlimitedaccess", salt, (err, hash) => {
          if (err) throw err;
          new User({
            userId: 0,
            username: "admin",
            password: hash,
          }).save((err) => {
            if (err) throw err;
          });
        });
      });
    }
  });
});

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

app.post("/profile/avatar", upload.single("avatar"), (req, res) => {
  const { userId } = req.auth;
  const { mimetype, buffer } = req.file;
  User.findOne({ userId: userId }, (err, user) => {
    if (err) throw err;
    if (!user)
      return res.status(404).send({
        success: false,
        errno: "USERNOTFOUND",
      });
    if (user.avatar)
      Avatar.deleteOne({ avatarId: user.avatar }, (err) => {
        if (err) throw err;
      });
    const now = new Date();
    user.avatar = now;
    user.save((err) => {
      if (err) throw err;
      new Avatar({
        avatarId: now,
        mimeType: mimetype,
        buffer: buffer,
      }).save((err) => {
        if (err) throw err;
        return res.send({
          success: true,
        });
      });
    });
  });
});

app.get("/profile/getava/:avatarId", (req, res) => {
  const { avatarId } = req.params;
  Avatar.findOne({ avatarId: avatarId }, (err, avatar) => {
    if (err) throw err;
    res.send({
      success: true,
      avatar,
    });
  });
});

// get full profile by jwt
app.get("/profile/info", (req, res) => {
  const { userId } = req.auth;
  User.findOne({ userId: userId }, (err, user) => {
    if (err) throw err;
    if (!user)
      return res.status(404).send({
        success: false,
        errno: "USERNOTFOUND",
      });
    return res.send({
      success: true,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      userId: userId,
    });
  });
});

// get user's basic info by id
app.get("/profile/basic/:userId", (req, res) => {
  const { userId } = req.params;
  User.findOne({ userId: userId }, (err, user) => {
    if (err) throw err;
    if (!user)
      return res.status(404).send({
        success: false,
        errno: "USERNOTFOUND",
      });
    return res.send({
      success: true,
      username: user.username,
      avatar: user.avatar,
    });
  });
});

// update a user's profile
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
    user.save((err) => {
      if (err) throw err;
      return res.send({
        success: true,
      });
    });
  });
});

// create a post with empty template
app.post("/post/create", (req, res) => {
  const { userId } = req.auth;
  const { title, firstContent } = req.body;
  if (!title || !firstContent)
    return res.status(403).send({
      success: false,
      errno: "INFOMISSING",
    });
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
      language: "raw",
      storage: firstContent,
    }).save((err) => {
      if (err) throw err;
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
    });
  });
});

// delete a post with id
app.delete("/post/delete/:postId", (req, res) => {
  const { userId } = req.auth;
  const { postId } = req.params;
  Post.findOne({ postId: postId }, (err, post) => {
    if (err) throw err;
    if (!post)
      return res.status(403).send({
        success: false,
        errno: "POSTNOTFOUND",
      });
    if (post.userId !== userId && userId !== 0)
      return res.status(403).send({
        success: false,
        errno: "USERNOTMATCH",
      });
    post.contents.map((contentId) =>
      Content.deleteOne({ contentId: contentId }, (err) => {
        if (err) throw err;
      })
    );
    post.comments.map((commentId) =>
      Comment.deleteOne({ commentId: commentId }, (err) => {
        if (err) throw err;
      })
    );
    Post.deleteOne({ postId: postId }, (err) => {
      if (err) throw err;
      res.send({
        success: true,
      });
    });
  });
});

// get last few records to display on index page
app.get("/post/last", (req, res) => {
  Post.find()
    .sort({ id: -1 })
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
  const { userId } = req.auth;
  const { postId, language, storage } = req.body;
  Post.findOne({ postId: postId }, (err, post) => {
    if (err) throw err;
    if (!post)
      return res.status(400).send({
        success: false,
        errno: "POSTNOTFOUND",
      });
    if (post.userId !== userId && userId !== 0)
      return res.send({
        success: false,
        errno: "AUTHORONLY",
      });
    let now = Date.now();
    new Content({
      contentId: now,
      language: language,
      storage: storage,
    }).save((err) => {
      if (err) throw err;
      post.contents.push(now);
      post.lastEdit = now;
      post.save((err) => {
        if (err) throw err;
        res.status(201).send({
          success: true,
        });
      });
    });
  });
});

// update a post after modification
app.post("/post/update", (req, res) => {
  const { postId, contentId, contents } = req.body;
  Post.findOne({ postId: postId }, (err, post) => {
    if (err) throw err;
    if (!post)
      return res.status(404).send({
        success: false,
        errno: "POSTNOTFOUND",
      });
    for (let id of post.contents) {
      if (!contentId.includes(id))
        Content.deleteOne({ contentId: id }, (err) => {
          if (err) throw err;
        });
    }
    post.contents = contentId;
    post.save((err) => {
      if (err) throw err;
      for (let content of contents) {
        Content.findOne({ contentId: content.contentId }, (err, match) => {
          if (err) throw err;
          match.language = content.language;
          match.storage = content.storage;
          match.save((err) => {
            if (err) throw err;
          });
        });
      }
      res.send({
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

// get a post deatil with id
app.get("/post/get/:postId", (req, res) => {
  let userId, vote;
  if (req.auth) userId = req.auth.userId;
  const { postId } = req.params;
  Post.findOne({ postId: postId }, (err, post) => {
    if (err) throw err;
    if (!post)
      return res.status(404).send({
        success: false,
        errno: "IDINVALID",
      });
    Content.findOne({ contentId: post.contents[0] }, (err, content) => {
      if (err) throw err;
      // if(!content) 
      if (post.ups.includes(userId)) vote = true;
      else if (post.downs.includes(userId)) vote = false;
      else vote = null;
      return res.send({
        success: true,
        post,
        firstContent: content.storage,
        vote: vote,
        userId,
      });
    });
  });
});

app.get("/post/get/:postId/:userId", (req, res) => {
  let vote;
  const { postId, userId } = req.params;
  Post.findOne({ postId: postId }, (err, post) => {
    if (err) throw err;
    if (!post)
      return res.status(404).send({
        success: false,
        errno: "IDINVALID",
      });
    Content.findOne({ contentId: post.contents[0] }, (err, content) => {
      if (err) throw err;
      if (post.ups.includes(userId)) vote = true;
      else if (post.downs.includes(userId)) vote = false;
      else vote = null;
      return res.send({
        success: true,
        post,
        firstContent: content.storage,
        vote: vote,
        userId,
      });
    });
  });
});

// vote for a post
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
app.get("/content/get/:id", (req, res) => {
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
app.post("/comment/write", (req, res) => {
  const { userId } = req.auth;
  const { postId, content } = req.body;
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
      const now = Date.now();
      new Comment({
        commentId: now,
        userId: userId,
        postId: postId,
        content: content,
        lastEdit: now,
      }).save((err) => {
        if (err) throw err;
        post.comments.push(now);
        post.save((err) => {
          if (err) throw err;
          return res.status(201).send({
            success: true,
          });
        });
      });
    });
  });
});

// get a comment detail with id
app.get("/comment/get/:commentId", (req, res) => {
  const { commentId } = req.params;
  Comment.findOne({ commentId: commentId }, (err, comment) => {
    if (err) throw err;
    if (!comment)
      return res.status(404).send({
        success: false,
        errno: "COMTNOTFOUND",
      });
    res.send({
      success: true,
      comment,
    });
  });
});

module.exports = app;
