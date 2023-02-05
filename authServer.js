const { config } = require("dotenv");
const express = require("express");
const app = express();

const jwt = require("jsonwebtoken");
const verifyToken = require("./middleware/auth");

app.use(express.json());

//database
let users = [
  {
    id: 1,
    username: "hung",
    refreshToken: null,
  },
  {
    id: 2,
    username: "dao",
    refreshToken: null,
  },
];

config();

const generateTokens = (payload) => {
  const { id, username } = payload;

  const accessToken = jwt.sign(
    { id, username },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "5m",
    }
  );

  const refreshToken = jwt.sign(
    { id, username },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1h",
    }
  );

  return { accessToken, refreshToken };
};

const updateRefreshToken = (username, refreshToken) => {
  users = users.map((user) => {
    if (user.username === username) {
      return {
        ...user,
        refreshToken,
      };
    }
    return user;
  });
};

app.post("/login", (req, res) => {
  const userName = req.body.username;
  const user = users.find((user) => user.username === userName);

  if (!user) {
    res.sendStatus(401);
  }

  //if exist user
  const tokens = generateTokens(user);
  updateRefreshToken(userName, tokens.refreshToken);

  console.log({ users });

  res.json(tokens);
});

app.post("/token", (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) res.sendStatus(401);

  const user = users.find((user) => user.refreshToken === refreshToken);

  if (!user) return res.sendStatus(403);

  try {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const tokens = generateTokens(user);

    updateRefreshToken(user.username, tokens.refreshToken);

    res.json(tokens);
  } catch (error) {
    console.log({ error });
    res.sendStatus(403);
  }
});

app.delete("/logout", verifyToken, (req, res) => {
  const user = users.find((user) => user.id === req.userId);
  updateRefreshToken(user.username, null);

  console.log({ users });

  res.sendStatus(200);
});

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
  console.log("App listen on port : ", PORT);
});
