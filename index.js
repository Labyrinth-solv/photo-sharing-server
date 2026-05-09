const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const CommentRouter = require("./routes/CommentRouter");

const User = require("./db/userModel");

app.use(
  session({
    secret: "photo-app-secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

dbConnect();

app.use(express.json());
app.use("/api/user", UserRouter);
app.use("/api/photo", PhotoRouter);

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

app.post("/api/admin/login", async (request, reponse) => {
  try {
    const loginName = request.body.login_name;
    if (!loginName) {
      return reponse.status(400).json("Missing login name");
    }
    const user = await User.findOne({ login_name: loginName });
    if (!user) {
      return reponse.status(400).json("Wrong login name");
    }
    request.session.user = {
      _id: user._id,
      first_name: user.first_name,
    };

    return reponse.status(200).json({
      _id: user._id,
      first_name: user.first_name,
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/admin/logout", async (request, reponse) => {
  if (!request.session.user) {
    reponse.status(400).json({ message: "Not logged in" });
  }
  request.session.destroy((err) => {
    if (err) {
      return reponse.status(500).json({ message: "error logout" });
    }
    return reponse.status(200).json({ message: "logout success" });
  });
});

app.listen(8081, () => {
  console.log("server listening on port 8081");
});
