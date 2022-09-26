const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const healthRoutes = require("./routes/health-route");
const swaggerRoutes = require("./routes/swagger-route");
const request = require("request");

// watson discovery rest api information
//dsayers@us.ibm.com
//Watson Discovery-Plus-Beta-Demos (plus beta)
const apikey = "gBGL7CTAMR2p4UWXSg0MZFywOU3uEutxNjC3cZ0VCoPH";
const endpoint =
"https://api.us-south.discovery.watson.cloud.ibm.com/instances/29ec7433-c44f-412b-9b1c-2d30c6353934";
const project_id = "bbc01513-d250-4ae9-abda-11d8feb12b44";

// query parameters
const version = "2021-11-20";

// initialize express
const app = express();

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
});

// start node server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App UI available http://localhost:${port}`);
  console.log(`Swagger UI available http://localhost:${port}/swagger/api-docs`);
});

// error handler for unmatched routes or api calls
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "../public", "404.html"));
});

module.exports = app;
