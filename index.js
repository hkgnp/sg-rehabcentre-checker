// Key dependencies
require("dotenv").config();
const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const session = require("express-session");
const flash = require("connect-flash");
const csurf = require("csurf");

const MongoUtil = require("./MongoUtil");

const app = express();
app.set("view engine", "hbs");
app.use(express.static("public"));
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

//eq
require("handlebars-helpers")({
  handlebars: hbs.handlebars,
});

// date time
hbs.registerHelper("dateFormat", require("handlebars-dateformat"));

// if equal function hbs helper
hbs.registerHelper("if_eq", (a, b, options) => {
  if (a === b) return options.fn(this);
  else return options.inverse(this);
});

// enable forms
app.use(
  express.urlencoded({
    extended: false,
  })
);

// setup sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Set up flash
app.use(flash());

// Set up csurf
csurf();

app.use((err, req, res, next) => {
  if (err && err.code == "EBADCSRFTOKEN") {
    console.log(err);
    req.flash(
      "error_messages",
      "The form has expired. Please reload your page."
    );
    res.redirect("back");
  } else {
    next();
  }
});

// Set up middleware
// Flash messages middleware
app.use((req, res, next) => {
  res.locals.success_messages = req.flash("success_messages");
  res.locals.error_messages = req.flash("error_messages");
  next();
});

// User session middleware
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// req.csrfToken
app.use((req, res, next) => {
  if (req.csrfToken) {
    res.locals.csrfToken = req.csrfToken();
  }
  next();
});

const indexRoute = require("./routes/index");
const userRoute = require("./routes/users");
const updateRoute = require("./routes/update");
const adminRoute = require("./routes/adminUpdate");

(async () => {
  const db = await MongoUtil.connect(
    process.env.MONGO_URL,
    process.env.COLLECTION
  );

  // add mongodb to middleware
  app.use((req, res, next) => {
    req.mongoClient = db;
    next();
  });

  app.get("/_ah/warmup", (req, res) => {
    // Handle your warmup logic. Initiate db connection, etc.
    app.use("/", indexRoute);
    console.log("Warmup done");
  });

  app.use("/", indexRoute);
  app.use("/user", userRoute);
  app.use("/update", updateRoute);
  app.use("/admin-update", adminRoute);
})();

app.listen(process.env.PORT || 7000, () => {
  console.log("Server has started ...");
});
