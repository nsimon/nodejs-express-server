// Module ... server.js
// Desc ..... Nodejs/express reference REST api

// TODO
//
// Add support for remaining browser URLs:
//   . /templates/:template_name
//   . /content/:filename
//
// directors.json:
//   . add, change, delete
//
// movies.json:
//   . add, change, delete
//
// ejs:
//   . only renders on server
//
// Add this route to handle invalid urls:
//   v1.get ("*", four_oh_four);
//   function four_oh_four (request, response)
//       {
//       response.writeHead (404, { "Content-Type" : "application/json" });
//       response.end (JSON.stringify (helpers.invalid_resource ()) + "\n");
//       }

// Working:
//   . All GET/PUT/POST/DELETE routes
//   . .json/.xml routes
//   . /v1 /v2 api separation
//   . ejs templates
//   . Log to file
//   . CLI script that runs/tests all REST commands
//   . images
//   . /pages/home
//   . /pages/director/:director
//   . /pages/director/:director/:movie

// Supported HTTP status return codes:
//   . 200 OK           Request successful
//   . 201 OK           Resource created successfully
//   . 204 OK           Resource deleted successfully  // response.status (204).send (data);
//   . 400 Bad Request  Invalid request                // specify error in return payload: ("Unrecognized URI")
//   . 404 Not found    Resource not found             // response.status (404, "The task is not found").send ();
//   . 500 Error        Internal server error

/******************************************************************************/
/* require                                                                    */
/******************************************************************************/

// Required libs
var async      = require ("async");
var bodyParser = require ("body-parser");
var express    = require ("express");
var fs         = require ("fs");
var glob       = require ("glob");
var datetime   = require ("node-datetime");
var path       = require ("path");
var util       = require ("util");

var helpers    = require ("./handlers/helpers.js");

/******************************************************************************/
/* log to logfile (create and append)                                         */
/******************************************************************************/

// false: do not log to logfile
// true:  log to logfile
var logToFile = false;
var logfile   = "./_server.log";

if (logToFile)
    {
    // Cause console.log() to log to console AND logfile
    var log_file   = fs.createWriteStream (logfile, {flags : "w"});
    var log_stdout = process.stdout;
    console.log = (d) =>
        {
        log_file.write (util.format (d) + "\n");
        log_stdout.write (util.format (d) + "\n");
        }
    }

// Display current time
var dt = datetime.create ();
console.log ("server.js.  Started: " + dt.format ("Y-m-d H:M:S"));
console.log ("");

/******************************************************************************/
/* routing                                                                    */
/******************************************************************************/

// Create express router
var app = express ();
var v1  = express.Router ();
var v2  = express.Router ();

/******************************************************************************/
/* middleware                                                                 */
/******************************************************************************/

// Setup middleware
app.use (express.static (__dirname + "/../static"));
app.use (bodyParser.json ());
app.use (bodyParser.urlencoded ({ extended: true }));

// Route /v1 and / URIs to v1-prefixed functions
app.use (["/v1", "/"], v1);

// Route /v2 URIs to v2-prefixed functions
app.use ("/v2", v2);

// Directory from where to serve static assets (html, css, js, jpg, etc.)
app.use (express.static (__dirname + "/../static"));

/******************************************************************************/
/* listen for inbound requests                                                */
/******************************************************************************/

// Listen for inbound requests on port 8080
app.listen (8080);

/******************************************************************************/
/* ROUTES: vi.all()                                                           */
/******************************************************************************/

v1.all ("*", (request, response, next) =>
    {
    // ALL v1 requests route through here
    v1_logInboundRequest (request);

    // Chain to requested endpoint route
    next ();
    });

/******************************************************************************/
/* BROWSER ROUTES: v1.get()                                                   */
/******************************************************************************/

v1.get ("/", (request, response) =>
    {
    // EX:      /
    // DESC:    redirect to /pages/home
    // RETURNS: n/a
    // ERROR:   n/a

    response.redirect ("/pages/home");
    response.end ();
    });

v1.get ([ "/pages/:page_name",
          "/pages/:page_name/:director",
          "/pages/:page_name/:director/:movie" ], (request, response) =>
    {
    // EX:      /
    //          /pages/home
    //          /pages/director/Quentin
    //          /pages/director/Quentin/Pulp_Fiction
    // DESC:    home page of all directors
    // RETURNS: html

    // ex: Quentin (optional)
    var director = request.params.director;
    console.log ("director .... " + director);

    // ex: Pulp_Fiction (optional)
    var movie = request.params.movie;
    console.log ("movie ....... " + movie);

    // ex: home
    var page_name = request.params.page_name;
    console.log ("page_name ... " + page_name);

    console.log ("");

    // read basic.html template
    fs.readFile ("../static/templates/basic.html", (err, contents) =>
        {
        if (err)
            {
            // return json error
            var rest_rc = 500;
            var message = "Internal server error";
            response.writeHead (rest_rc, { "Content-Type" : "application/json" });
            response.end (JSON.stringify ({ error: rest_rc, message: message }) + "\n");
            }
        else
            {
            // return html content
            var rest_rc = 200;
            contents = contents.toString ("utf8");

            if (typeof movie !== "undefined")
                {
                console.log ("We have a movie!");
                }

            // if movie was specified, use "movie"
            // else use :page name (either "home" or "director")
            var page_type = (typeof movie !== "undefined") ? "movie" : page_name;

            // resolves to page <title>
            contents = contents.replace ("{{ PAGE_NAME }}",  page_type);

            // resolves to a client-js script specified in the web page
            // ex: home.js, director.js, or movie.js
            contents = contents.replace ("{{ PAGE_TITLE }}", page_type);

            response.writeHead (rest_rc, { "Content-Type": "text/html" });
            response.end (contents);
            }
        });
    });

/******************************************************************************/
/* API ROUTES: v1.get()                                                       */
/******************************************************************************/

v1.get ([ "/directors.json",
          "/directors.xml" ], (request, response) =>
    {
    // EX:      /directors.json
    //          /directors.json?directors_from=New_York_City
    // DESC:    get all directors (with optional filters)
    // RETURNS: json

    // each folder is the name of a director
    fs.readdir ("../static/directors", (err, directors) =>
        {
        var rc1;
        var jsonOut;
        var director_list = [];

        if (err)
            {
            rc = 1;
            message = "Unable to read directors";
            }
        else
            {
            rc = 0;
            message = "Directors found: " + directors.length;

            // push a json key:value pair for each director
            for (var i = 0; i < directors.length; i++)
                {
                director_list.push ({ "name": directors [i] });
                };
            }

        // return json response
        jsonOut = { "rc": rc, "message": message, "data": { "directors": director_list }};
        response.setHeader ("Content-Type", "application/json");
        response.end (JSON.stringify (jsonOut));
        });
    });

v1.get ([ "/directors/:director.json",
          "/directors/:director.xml" ], (request, response) =>
    {
    // EX:      /directors/Quentin.json
    // DESC:    get director and his movies
    // RETURNS: json

    // ex: Quentin
    var director = request.params.director;
    console.log ("director ... " + director);

    // each folder is the name of a director
    glob ("../static/directors/" + director + "/*.json", (err, movies) =>
        {
        var rc1;
        var jsonOut;
        var movie_list = [];

        if (err)
            {
            rc = 1;
            message = "Unable to read movies";
            }
        else
            {
            rc = 0;
            message = "Movies found: " + movies.length;

            // push a json key:value pair for each movie
            for (var i = 0; i < movies.length; i ++)
                {
                moviename = path.parse (movies [i]).name;               // ex: Pulp_Fiction_1994

                movie_list.push ({ "moviename": moviename,              // ex: Pulp_Fiction_1994
                                   "moviejpg":  moviename + ".jpg",     // ex: Pulp_Fiction_1994.jpg
                                   "moviejson": moviename + ".json"});  // ex: Pulp_Fiction_1994.json
                };
            }

        // return json response
        jsonOut = { "rc": rc, "message": message, "data": { "director_data": { "director": director, "movies": movie_list }}};
        response.setHeader ("Content-Type", "application/json");
        response.end (JSON.stringify (jsonOut));
        });
    });

v1.get ([ "/directors/:director/movies/:movie.json",
          "/directors/:director/movies/:movie.xml" ], (request, response) =>
    {
    // EX:      /directors/Quentin/movies/Pulp_Fiction_1994.json
    // DESC:    get specified movie for director
    // RETURNS: json

    // ex: Quentin
    var director = request.params.director;

    // ex: Pulp_Fiction_1994
    var movie = request.params.movie;

    var rc = 0;
    var message = "Found director: " + director + ", movie: " + movie;

    // return json response
    var jsonOut = { "rc": rc, "message": message, "data": { "director": director, "moviename": movie, "moviejpg": movie + ".jpg", "moviejson": movie + ".json" }};
    response.setHeader ("Content-Type", "application/json");
    response.end (JSON.stringify (jsonOut));
    });

// TODO NEXT
v1.get ([ "/directors/:director/movies.json",
          "/directors/:director/movies.xml" ], (request, response) =>
    {
    // EX:    /directors/Quentin/movies.json
    // DESC:  get all movies for director

    // ex: Quentin
    var director = request.params.director;

    // each folder is the name of a director
    glob ("../static/directors/" + director + "/*.json", (err, movies) =>
        {
        var rc1;
        var jsonOut;
        var movie_list = [];

        if (err)
            {
            rc = 1;
            message = "ERROR: unable to glob() movies";
            }
        else
            {
            rc = 0;
            message = "Movies found: " + movies.length;

            // push a json key:value pair for each movie
            for (var i = 0; i < movies.length; i ++)
                {
                moviename = path.parse (movies [i]).name;             // ex: Pulp_Fiction_1994

                movie_list.push ({ "moviejson": moviename + ".json",  // ex: Pulp_Fiction_1994.json
                                   "moviename": moviename});          // ex: Pulp_Fiction_1994
                };
            }

        // {"error":null,"data":{"movies":
        // [{"filename":"Reservoir_Dogs_1992.txt ","desc":"Reservoir Dogs"},
        //  {"filename":"Pulp_Fiction_1994.txt ","desc":"Pulp Fiction"}]}}

        // return json response
        jsonOut = { "rc": rc, "message": message, "data": { "movies": movie_list }};
        response.setHeader ("Content-Type", "application/json");
        response.end (JSON.stringify (jsonOut));
        });

    // deprecated:
    // response.render ("movies.ejs", { "director": director, "movies": movies });
    });

/******************************************************************************/
/* API ROUTES: TODO                                                           */
/******************************************************************************/

//v1.get ("/templates/:template_name", (request, response) =>
//    {
//    serve_static_file ("templates/" + request.params.template_name, response);
//    });

//v1.get ("/content/:filename", (request, response) =>
//    {
//    serve_static_file ("content/" + request.params.filename, response);
//    });

// CODE SNIP:
//  var directors_from = request.query.directors_from;
//
//  fs.readFile ("directors/directors.json", (err, data) =>
//      {
//      if (err)
//          {
//          throw err;
//          }
//
//      var jsonData = JSON.parse (data);
//
//      var directors = [];
//
//      for (var i = 0; i < jsonData.directors.length; i++)
//          {
//          var director = jsonData.directors [i];
//
//          if (typeof directors_from === "undefined")
//              {
//              // all
//              directors.push ({ name: director.name });
//              }
//          else if (director.director_from == directors_from)
//              {
//              // filtered
//              directors.push ({ name: director.name });
//              }
//          };
//
//      response.render ("directors.ejs", { directors: directors });
//      });

/******************************************************************************/
/* v1 api - PUT                                                               */
/******************************************************************************/

v1.put ("/directors/:director", (request, response) =>
    {
    // DESC:  update existing director
    // URL:   http://localhost:8080/v1/directors/Peele
    // DATA:  updatedFrom:"England"
    // ERROR: director does not exist
    // ERROR: updatedFrom not specified

    // ex: Peele
    var director = request.params.director;

    // ex: England
    var updatedFrom = request.body.updatedFrom;

    var result = "director updatedFrom: " + updatedFrom;

    response.status (200).send ({ result: result });
    });

v1.put ("/directors/:director/:movie", (request, response) =>
    {
    // DESC:  Update existing movie for director
    // URL:   http://localhost:8080/v1/directors/Peele/Get_Out_2018
    // DATA:  updatedLength:120
    // ERROR: director does not exist
    // ERROR: movie does not exist

    // ex: Peele
    var director = request.params.director;

    // ex: Us_2019
    var movie = request.params.movie;

    // ex: England
    var updatedLength = request.body.updatedLength;

    var result = "movie updatedLength: " + updatedLength;

    response.status (200).send ({ result: result });
    });

/******************************************************************************/
/* v1 api - POST                                                              */
/******************************************************************************/

v1.post ("/directors", (request, response) =>
    {
    // DESC:  create new director
    // URL:   http://localhost:8080/v1/directors
    // DATA:  newName:"new name"
    // ERROR: director already exists

    // ex: Mr. Bojangles
    var newName = request.body.newName;

    var result = "new director added: " + newName;

    response.status (201).send ({ result: result });
    });

v1.post ("/directors/:director", (request, response) =>
    {
    // DESC:  create new movie for director
    // URL:   http://localhost:8080/v1/directors/Peele/Get_Out_2018
    // DATA:  newMovie:"new movie"
    // ERROR: director does not exist
    // ERROR: movie already exists

    // ex: Peele
    var director = request.params.director;

    // ex: My Fair Lady
    var newMovie = request.body.newMovie;

    var result = "new movie added: " + newMovie;

    response.status (201).send ({ result: result });
    });

/******************************************************************************/
/* v1 api - DELETE                                                            */
/******************************************************************************/

v1.delete ("/directors/:director/movies", (request, response) =>
    {
    // Delete all movies by director:
    //   . DELETE /v1/directors/Peele/movies
    //   . ERROR: director does not exist
    //   . NOTE: no "request.body.*" for this request
    //
    // if (err)  response.status (404).send ();
    // else      response.status (200).send ();

    // ex: Peele
    var director = request.params.director;

    // Set return message
    var message = "deleted all movies for director";

    // Send client response
    response.status (200).send ({ result: 0, message: message });
    });

v1.delete ("/directors/:director/movie/:movie", (request, response) =>
    {
    // Delete specified movie by this director:
    //   . DELETE /v1/directors/Peele/movie/Us_2019
    //   . ERROR: movie does not exist
    //   . NOTE: no "request.body.*" for this request
    // if (err)  response.status (404).send ();
    // else      response.status (200).send ();

    // ex: Peele
    var director = request.params.director;

    // ex: Us_2019
    var movie = request.params.movie;

    // Set return message
    var message = "successfully deleted movie";

    // Send client response
    response.status (200).send ({ result: 0, message: message, director: director, movie: movie });
    });

/******************************************************************************/
/* v1 api - helpers                                                           */
/******************************************************************************/

const v1_logInboundRequest = (request) =>
    {
    console.log ("api version ....... " + "/v1");
    console.log ("request.method .... " + request.method);
    console.log ("request.headers ... " + JSON.stringify (request.headers));
    console.log ("request.body ...... " + JSON.stringify (request.body));
    console.log ("request.params .... " + JSON.stringify (request.params));
    console.log ("request.query ..... " + JSON.stringify (request.query));
    console.log ("request.url ....... " + request.url);
    console.log ("");
    };

/******************************************************************************/
/* v2 api - all                                                               */
/******************************************************************************/

v2.all ("*", (request, response, next) =>
    {
    console.log ("api rev: v2");
    v2_logInboundRequest (request);
    next ();
    });

/******************************************************************************/
/* v2 api - GET                                                               */
/******************************************************************************/

v2.get ("/", (request, response) =>
    {
    var directors = [{ name: "Scorsese v2" }, { name: "Quentin v2" }];

    response.render ("directors.ejs", { directors: directors });
    });

/******************************************************************************/
/* v2 api - helpers                                                           */
/******************************************************************************/

const v2_logInboundRequest = (request) =>
    {
    console.log ("api version ....... " + "/v2");
    console.log ("request.method .... " + request.method);
    console.log ("request.headers ... " + JSON.stringify (request.headers));
    console.log ("request.body ...... " + JSON.stringify (request.body));
    console.log ("request.params .... " + JSON.stringify (request.params));
    console.log ("request.query ..... " + JSON.stringify (request.query));
    console.log ("request.url ....... " + request.url);
    console.log ("");
    }

