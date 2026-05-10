const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const dbConnect = require("./db/dbConnect");

const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const CommentRouter = require("./routes/CommentRouter");
 
const User = require("./db/userModel");



const app = express();

// Middleware
app.use(express.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.options("*", cors());

app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
    },
  })
);
// Connect database
dbConnect();


// Routes
app.use("/api/user", UserRouter);
app.use("/api/photo", PhotoRouter);
app.use("/api/comment", CommentRouter);

//Config serve anh
app.use("/images", express.static(path.join(__dirname, "images")));

// Test API
app.get("/", (req, res) => {
  res.json({
    message: "Hello from photo-sharing app API!",
  });
});

// Login
app.post("/api/admin/login", async (req, res) => {
  try {
    const { login_name,password } = req.body;

    if (!login_name) {
      return res.status(400).json({
        message: "Missing login name",
      });
    }

    const user = await User.findOne({ login_name });

    if (!user) {
      return res.status(400).json({
        message: "user don't exist",
      });
    }
    if (password!=user.password) {
      return res.status(400).json({
        message: "Wrong password",
      });
    }
    req.session.user = {
      _id: user._id,
      first_name: user.first_name,
    };

    return res.json({
      _id: user._id,
      first_name: user.first_name,
    });
  } catch (err) {
    console.error(err);
  }
});

// Logout
app.post("/api/admin/logout", (req, res) => {
  if (!req.session.user) {
    return res.status(400).json({
      message: "Not logged in",
    });
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        message: "Logout failed",
      });
    }
    console.log("log out call");
    return res.json({
      message: "Logout success",
    });
  });
});

// Start server
app.listen(8081, () => {
  console.log("Server listening on port 8081");
});
