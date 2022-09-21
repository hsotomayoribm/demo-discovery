// import dependencies
const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const healthRoutes = require("./routes/health-route");
const swaggerRoutes = require("./routes/swagger-route");
const request = require("request");
const session = require("express-session");
const passport = require("passport");
const appID = require("ibmcloud-appid");
const WebAppStrategy = appID.WebAppStrategy;
const CALLBACK_URL = "/ibm/cloud/appid/callback";
const port = process.env.PORT || 3000;

// Setup express application to use express-session middleware
// Must be configured with proper session storage for production
// environments. See https://github.com/expressjs/session for
// additional documentation

//Initialize appid
app.use(session({
	secret: "123456",
	resave: true,
	saveUninitialized: true,
	proxy: true
}));

// Configure express application to use passportjs
app.use(passport.initialize());
app.use(passport.session());
passport.use(new WebAppStrategy({
  tenantId: "c782545c-c5e8-4c89-ac0e-87a8ce926a5c",
  //tenantId: "de180cc4-95c8-498f-ac26-9028a575618b",
  clientId: "09f67097-b9f5-4ac6-b80c-cd859bca7356",
  //clientId: "01d471a9-3baa-461a-af82-1e3267222542",
  secret: "MzE1ZGEzZDMtN2VmMC00ZmU4LWEyODAtMjk0Y2I4ZmJlMGFj",
  //secret: "M2U2YjUwMmEtMzBiNi00MDNhLWFhZTctYTkyMjczMzY4MGE5",
  oauthServerUrl: "https://us-south.appid.cloud.ibm.com/oauth/v4/c782545c-c5e8-4c89-ac0e-87a8ce926a5c",
  //oauthServerUrl: "https://us-south.appid.cloud.ibm.com/oauth/v4/de180cc4-95c8-498f-ac26-9028a575618b",
  redirectUri: "http://localhost:3000" + CALLBACK_URL
  }));

// Configure passportjs with user serialization/deserialization. This is required
// for authenticated session persistence accross HTTP requests. See passportjs docs
// for additional information http://passportjs.org/docs
passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((obj, cb) => cb(null, obj));


// Protect everything under /protected
app.use(passport.authenticate(WebAppStrategy.STRATEGY_NAME));

// watson discovery rest api information
//dsayers@us.ibm.com
//Watson Discovery-Plus-Beta-Demos (plus beta)
//const apikey = "xcvBv3rrwSOHB_glB_vDH8uSnXdEIcvmrLxG8ouehe0Z";
//"https://api.us-south.discovery.watson.cloud.ibm.com/instances/5c4351ed-8330-4eba-965b-7c5045f7f153";
//const project_id = "75d81d2d-a86a-4889-9ce0-7f310db7daed";

const apikey = "ZI-fNAHk1UPR3XsNYVrMwigNA2mqjm_5a5GAZXw8rGx3";
const endpoint = "https://api.us-south.discovery.watson.cloud.ibm.com/instances/e563cc53-b5af-4ae5-b622-0c396228dae5";
const project_id = "ffe2479d-9e0e-4e0e-a575-84893839da25";

// query parameters
const version = "2022-09-16";

// initialize express


// enable parsing of http request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// routes and api calls
app.use("/health", healthRoutes);
app.use("/swagger", swaggerRoutes);
app.use(express.static("public"));

// var fs = require("fs");
// var files = fs.readdirSync("../public/media");

// for (var i in files) {
//   files[i] = files[i].replaceAll(" ", "_");
// }

app.get("", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "../public", "index.html"));
});

app.get("/pdf/:id", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "../public", "pdf.html"));
});

/* for (var i in files) {
  app.get("/media/" + files[i], (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "../media", files[i]));
    res.sendFile();
  });
}
 */
app.post("/query", async (req, res, next) => {
  var _apikey = apikey;
  var _endpoint = endpoint;
  var _project_id = project_id;
  var _version = version;

  if (req.body.server_params.apikey !== undefined) {
    _apikey = req.body.server_params.apikey;
  }
  if (req.body.server_params.endpoint !== undefined) {
    _endpoint = req.body.server_params.endpoint;
  }
  if (req.body.server_params.project_id !== undefined) {
    _project_id = req.body.server_params.project_id;
  }
  if (req.body.server_params.version !== undefined) {
    _version = req.body.server_params.version;
  }

  var url =
    _endpoint + "/v2/projects/" + _project_id + "/query?version=" + _version;

  //console.log(JSON.stringify(req.body.client_params));

  var promise = new Promise(function (resolve, reject) {
    request.post(
      {
        url: url,
        auth: {
          user: "apikey",
          pass: _apikey,
        },
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(req.body.client_params),
      },
      function (error, response, body) {
        if (error) {
          reject(error);
          res.status(500).json(error);
        } else {
          resolve(body);
          res.status(201).json(body);
        }
      }
    );
  });
  window.alert(url);
});

// start node server
app.listen(port, () => {
  console.log(`App UI available http://localhost:${port}`);
  console.log(`Swagger UI available http://localhost:${port}/swagger/api-docs`);
});

// error handler for unmatched routes or api calls
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "../public", "404.html"));
});

module.exports = app;
