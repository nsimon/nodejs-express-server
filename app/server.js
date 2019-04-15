// Module ... server.js
// Desc ..... Nodejs/express reference REST api

// TODO
//
// Add support for remaining browser URLs:
//   . /templates/:template_name
//   . /content/:filename
//
// Conform all tx and rx json keys/values
//
// Standardize all rest api return codes (200 ok, etc.)
//
// Add this route to handle invalid urls:
//   v1.get ("*", four_oh_four);
//   function four_oh_four (request, response)
//       {
//       response.writeHead (404, { "Content-Type" : "application/json" });
//       response.end (JSON.stringify (helpers.invalid_resource ()) + "\n");
//       }

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
var formidable = require ("formidable");
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
                // console.log ("We have a movie!");
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

        // return json response
        jsonOut = { "rc": rc, "message": message, "data": { "movies": movie_list }};
        response.setHeader ("Content-Type", "application/json");
        response.end (JSON.stringify (jsonOut));
        });
    });

/******************************************************************************/
/* API ROUTES: v1.put()                                                       */
/******************************************************************************/

v1.put ("/directors.json", (request, response) =>
    {
    // EX:      /v1/directors.json
    // DESC:    creates the directors from the data (body must contain data for ALL directors)
    // RETURNS: 200 ok

    var mkdirFailed = 0;  // reset to 1 on failure

    // ex: directors: [{"name":"McDonagh"},{"name":"Peele"},{"name":"Quentin"},{"name":"Reitman"},{"name":"Scorsese"}]
    var directors = request.body.data.directors;

    // appended for each folder created
    var directors_created_list = [];

    async.forEach (directors, (element, cb) =>
        {
        var directorFolder = "../static/directors/" + element.name;
        //console.log ("Checking for directorFolder: " + directorFolder);

        // if director (folder) exists...
        if (fs.existsSync (directorFolder))
            {
            // skip
            //console.log ("directorFolder exists: " + directorFolder);
            }
        else
            {
            // create director (folder)
            //console.log ("creating directorFolder: " + directorFolder);
            fs.mkdirSync (directorFolder);

            if (!fs.existsSync (directorFolder))
                {
                // error
                mkdirFailed = 1;
                }
            else
                {
                directors_created_list.push ({ "name": element.name });
                }
            }
        });

    var rc;
    var message;

    if (mkdirFailed)
        {
        rc = 500;  // error
        message = "Failed to create director";
        }
    else
        {
        rc = 200;  // success
        message = "directors created: " + directors_created_list.length;
        }

    var jsonOut = { "rc": rc, "message": message, "data": { "directors_created_list": directors_created_list }};

    response.status (rc).send (jsonOut);
    });

v1.put ("/directors/:director.json", (request, response) =>
    {
    // EX:      /v1/directors/Landis.json
    // DESC:    creates a new director
    // RETURNS: 200 ok

    var director = request.body.data.director;
    console.log ("director: " + director);

    var directorFolder = "../static/directors/" + director;
    console.log ("checking for directorFolder: " + directorFolder);

    var rc;
    var message;

    if (fs.existsSync (directorFolder))
        {
        // skip
        rc = 200;  // success
        message = "director folder already exists: " + director;
        }
    else
        {
        console.log ("creating director folder: " + director);

        // create director folder
        fs.mkdirSync (directorFolder);

        if (!fs.existsSync (directorFolder))
            {
            // error
            rc = 500;  // error
            message = "ERROR: failed to create director";
            }
        else
            {
            rc = 200;  // success
            message = "director folder created: " + director;
            }
        }

    var jsonOut = { "rc": rc, "message": message };

    response.status (rc).send (jsonOut);
    });

v1.put ("/directors/:director/movies.json", (request, response) =>
    {
    // EX:      /v1/directors/Landis/movies.json
    // DESC:    creates a new movie under director
    // RETURNS: 200 ok

    // ex: Quentin
    var director = request.params.director;

    var rc;
    var message;

    // ex: ../static/directors/Quentin
    var directorFolder = "../static/directors/" + director;
    console.log ("directorFolder: " + directorFolder);

    // if director (folder) does not exist...
    if (!fs.existsSync (directorFolder))
        {
        rc = 500;
        message = "ERROR: director folder does not exist";
        var jsonOut = { "rc": rc, "message": message };
        response.status (rc).send (jsonOut);
        }
    else
        {
        var form = new formidable.IncomingForm ();

        // appended for each movie created
        var uploadedMovieFiles = [];

        form.parse (request);

        form.on ("fileBegin", (name, file) =>
            {
            file.path = directorFolder + "/" + file.name;
            });

        form.on ("file", (name, file) =>
            {
            console.log ("Uploaded file: " + file.path);
            uploadedMovieFiles.push ({ "file": file.path });
            });

        form.on ("error", () =>
            {
            message = "ERROR: upload failed";
            rc = 500;
            var jsonOut = { "rc": rc, "message": message };
            response.status (rc).send (jsonOut);
            });

        form.on ("end", () =>
            {
            message = "upload successful";
            rc = 200;
            var jsonOut = { "rc": rc, "message": message, "data": { "uploadedMovieFiles": uploadedMovieFiles }};
            response.status (rc).send (jsonOut);
            });
        }
    });

/******************************************************************************/
/* v1 api - POST                                                              */
/******************************************************************************/

v1.post ("/directors/:director.json", (request, response) =>
    {
    // EX:   /v1/directors/Quentin.json
    // DESC: updates Quentin and his movies

    // ex: Quentin
    var director = request.params.director;

    var rc = 404;  // error
    var rc = 201;  // ok
    var result = "director updated: " + director;

    response.status (rc).send ({ result: result });
    });

v1.post ("/directors/:director/movies.json", (request, response) =>
    {
    // EX:   /v1/directors/Quentin/movies.json
    // DESC: updates movies for Quentin

    // ex: Quentin
    var director = request.params.director;

    var rc = 404;  // error
    var rc = 201;  // ok
    var result = "director movies updated: " + director;

    response.status (rc).send ({ result: result });
    });

/******************************************************************************/
/* v1 api - DELETE                                                            */
/******************************************************************************/

v1.delete ("/directors/:director.json", (request, response) =>
    {
    // EX:   /v1/directors/Quentin.json
    // DESC: deletes Quentin

    // ex: Quentin
    var director = request.params.director;

    var rc = 404;  // error
    var rc = 200;  // ok
    var result = "director deleted: " + director;

    // Send client response
    response.status (rc).send ({ result: result });
    });

v1.delete ("/directors/:director/movies.json", (request, response) =>
    {
    // EX:   /v1/directors/Quentin/movies.json
    // DESC: deletes movies under Quentin

    // ex: Quentin
    var director = request.params.director;

    var rc = 404;  // error
    var rc = 200;  // ok
    var result = "movies deleted for director: " + director;

    // Send client response
    response.status (rc).send ({ result: result });
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
    // return json
    var message = "Testing v2 api: in v2.get('/')";

    response.writeHead (200, { "Content-Type" : "application/json" });
    response.end (JSON.stringify ({ "rc": 0, "message": message }));
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

