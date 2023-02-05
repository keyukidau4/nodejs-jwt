const { config } = require("dotenv");
const express = require("express");
const verifyToken = require("./middleware/auth.js");
const app = express();

const jwt = require("jsonwebtoken");

app.use(express.json());

//database

const posts = [
  {
    userId: 1,
    post: "post henry",
  },
  {
    userId: 2,
    post: "post dao",
  },
  {
    userId: 1,
    post: "post henry second",
  },
];

config();
app.get("/posts", verifyToken, (req, res) => {
  const postWithUserId = posts.filter((post) => post.userId === req.userId);

  console.log({ postWithUserId });

  res.json({ posts: "my posts" });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log("App listen on port : ", PORT);
});
