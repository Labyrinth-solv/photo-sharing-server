const express = require("express");
const cors = require("cors");
const session = require("express-session");

const dbConnect = require("./db/dbConnect");

const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");

const User = require("./db/userModel");

const app = express();

// Connect database
dbConnect();

// Middleware
app.use(express.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(
  session({
    secret: "photo-app-secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Routes
app.use("/api/user", UserRouter);
app.use("/api/photo", PhotoRouter);

// Test API
app.get("/", (req, res) => {
  res.json({
    message: "Hello from photo-sharing app API!",
  });
});

// Login
app.post("/api/admin/login", async (req, res) => {
  try {
    const { login_name } = req.body;

    if (!login_name) {
      return res.status(400).json({
        message: "Missing login name",
      });
    }

    const user = await User.findOne({ login_name });

    if (!user) {
      return res.status(400).json({
        message: "Wrong login name",
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

    return res.status(500).json({
      message: "Server error",
    });
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

    return res.send("success");
  });
});

// Start server
app.listen(8081, () => {
  console.log("Server listening on port 8081");
});
