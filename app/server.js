// Module ... server.js
// Desc ..... Nodejs/express reference REST api

// TODO
//
// 1. Cleanup
//    - Standardize all REST json
//    - rc/rest_rc continuity
// 2. Separate all curl calls into individual functions
//    - then, group them for various tests
// 3. Make sure everything works well -- just as-is
// 4. Print new lists:
//    - The "requirements" 1-10
//    - The "table"
//    - Misc items below the "table"
// 5. Check-off all completed tasks
// 6. Make a plan for the remaining items


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
    // DESC:    get all directors
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
    // DESC:    get director and their movies
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
    // DESC:    get one movie by a director
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
    // DESC:  get all movies by a director

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
    // DESC:    creates all directors from the data (body must contain data for ALL directors)
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
            console.log ("directorFolder exists: " + directorFolder);
            }
        else
            {
            // create director (folder)
            console.log ("creating directorFolder: " + directorFolder);

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
    // DESC:    creates one director
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
    // DESC:    creates movie for director
    // RETURNS: 200 ok

    // ex: Landis
    var director = request.params.director;

    var rc;
    var message;

    // ex: ../static/directors/Landis
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
        // create a new formidable object
        var form = new formidable.IncomingForm ();

        // appended for each movie created
        var uploadedMovieFiles = [];

        // parse the incoming form
        form.parse (request);

        // the fileBegin event happens when each file upload begins
        form.on ("fileBegin", (name, file) =>
            {
            file.path = directorFolder + "/" + file.name;
            });

        // the file event happens when each ile completes it's upload
        form.on ("file", (name, file) =>
            {
            console.log ("uploaded file to: " + file.path);
            uploadedMovieFiles.push ({ "file": file.path });
            });

        // the error event
        form.on ("error", () =>
            {
            message = "ERROR: upload failed";
            rc = 500;
            var jsonOut = { "rc": rc, "message": message };
            response.status (rc).send (jsonOut);
            });

        // the end event happens when all uploads are completed
        form.on ("end", () =>
            {
            console.log ("");
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

v1.post ("/directors/:director/movies.json", (request, response) =>
    {
    // EX:   /v1/directors/Quentin/movies.json
    // DESC: updates movies for a director

    // ex: Quentin
    var director = request.params.director;

    var directorFolder = "../static/directors/" + director;
    console.log ("directorFolder: " + directorFolder);
    console.log ("");

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
        // create a new formidable object
        var form = new formidable.IncomingForm ();

        // appended for each movie created
        var uploadedMovieFiles = [];

        // parse the incoming form
        form.parse (request);

        // the fileBegin event happens when each file upload begins
        form.on ("fileBegin", (name, file) =>
            {
            file.path = directorFolder + "/" + file.name;
            });

        // the file event happens when each ile completes it's upload
        form.on ("file", (name, file) =>
            {
            console.log ("uploaded file to: " + file.path);
            uploadedMovieFiles.push ({ "file": file.path });
            });

        // the error event
        form.on ("error", () =>
            {
            message = "ERROR: upload failed";
            rc = 500;
            var jsonOut = { "rc": rc, "message": message };
            response.status (rc).send (jsonOut);
            });

        // the end event happens when all uploads are completed
        form.on ("end", () =>
            {
            console.log ("");
            message = "upload successful";
            rc = 200;
            var jsonOut = { "rc": rc, "message": message, "data": { "uploadedMovieFiles": uploadedMovieFiles }};
            response.status (rc).send (jsonOut);
            });
        }
    });

v1.post ("/directors/:director.json", (request, response) =>
    {
    // EX:   /v1/directors/Quentin.json
    // DESC: change director name

    // ex: Quentin
    var director = request.params.director;

    var oldDirectorName = request.body.oldDirectorName;
    var newDirectorName = request.body.newDirectorName;

    console.log ("oldDirectorName: " + oldDirectorName);
    console.log ("newDirectorName: " + newDirectorName);
    console.log ("");

    var oldDirectorFolder = __dirname + "/../static/directors/" + oldDirectorName;
    var newDirectorFolder = __dirname + "/../static/directors/" + newDirectorName;

    console.log ("oldDirectorFolder: " + oldDirectorFolder);
    console.log ("newDirectorFolder: " + newDirectorFolder);
    console.log ("");

    var rest_rc;
    var message;
    var jsonOut;

    if (!fs.existsSync (oldDirectorFolder))
        {
        rest_rc = 500;
        message = "ERROR: oldDirectorFolder does not exist: " + oldDirectorFolder;
        jsonOut = { "rest_rc": rest_rc, "message": message };
        response.status (rest_rc).send (jsonOut);
        }
    else if (fs.existsSync (newDirectorFolder))
        {
        rest_rc = 500;
        message = "ERROR: newDirectorFolder already exists: " + newDirectorFolder;
        jsonOut = { "rest_rc": rest_rc, "message": message };
        response.status (rest_rc).send (jsonOut);
        }
    else
        {
        fs.rename (oldDirectorFolder, newDirectorFolder, (err) =>
            {
            if (err)
                {
                // return json error
                rest_rc = 500;
                message = "ERROR: unable to rename director folder";
                jsonOut = { "rest_rc": rest_rc, "err": err, "message": message };
                response.status (rest_rc).send (jsonOut);
                }
            else
                {
                // rename was successful
                rest_rc = 200;
                message = "director successfully renamed to " + newDirectorName;
                jsonOut = { "rest_rc": rest_rc, "oldDirectorName": oldDirectorName, "newDirectorName": newDirectorName, "message": message };
                response.status (rest_rc).send (jsonOut);
                }
            });
        }
    });

v1.post ("/directors/:director/:movie.json", (request, response) =>
    {
    // EX:   /v1/directors/Landis/animal_house_1978.json
    // DESC: change movie name

    // ex: Landis
    var director = request.params.director;
    console.log ("director: .......... " + director);

    // ex: animal_house_1978
    var oldMovieName = request.params.movie;
    console.log ("oldMovieName ....... " + oldMovieName);

    // ex: "../static/directors/Landis"
    var directorFolder = "../static/directors/" + director;
    console.log ("directorFolder ..... " + directorFolder);

    // ex: animal_houzz
    var newMovieName = request.body.newMovieName;
    console.log ("newMovieName ....... " + newMovieName);

    // create oldPath, newPath

    // ex: ../static/directors/Landis/animal_house_1978.json
    var oldMoviejsonPath = directorFolder + "/" + oldMovieName + ".json";
    var newMoviejsonPath = directorFolder + "/" + newMovieName + ".json";
    console.log ("oldMoviejsonPath ... " + oldMoviejsonPath);
    console.log ("newMoviejsonPath ... " + newMoviejsonPath);

    // ex: ../static/directors/Landis/animal_house_1978.jpg
    var oldMoviejpgPath  = directorFolder + "/" + oldMovieName + ".jpg";
    var newMoviejpgPath  = directorFolder + "/" + newMovieName + ".jpg";
    console.log ("oldMoviejpgPath .... " + oldMoviejpgPath);
    console.log ("newMoviejpgPath .... " + newMoviejpgPath);

    // rename json
    fs.renameSync (oldMoviejsonPath, newMoviejsonPath);

    // if newMoviejsonPath does not exist (e.g. "../static/director/Landis/animal_houzz.json")...
    if (!fs.existsSync (newMoviejsonPath))
        {
        var message = "ERROR: newMoviejsonPath was not created: " + newMoviejsonPath;
        console.log (message);
        response.status (404).send ({ "rc": 404, "message": message });
        }
    else
        {
        // rename jpg
        fs.renameSync (oldMoviejpgPath, newMoviejpgPath);

        if (!fs.existsSync (newMoviejpgPath))
            {
            var message = "ERROR: newMoviejpgPath was not created: " + newMoviejpgPath;
            console.log (message);
            response.status (404).send ({ "rc": 404, "message": message });
            }
        else
            {
            var message = "successfully renamed movie to: " + newMovieName;
            console.log (message);
            response.status (200).send ({ "rc": 200, "message": message });
            }
        }
    });

/******************************************************************************/
/* v1 api - DELETE                                                            */
/******************************************************************************/

v1.delete ("/directors/:director.json", (request, response) =>
    {
    // EX:   /v1/directors/Landis.json
    // DESC: delete Landis and all his movies

    // ex: Landis
    var director = request.params.director;
    console.log ("director: " + director);

    var directorFolder = "../static/directors/" + director;
    console.log ("directorFolder: " + directorFolder);

    var rest_rc;
    var message;
    var jsonOut;

    if (!fs.existsSync (directorFolder))
        {
        rest_rc = 500;
        message = "ERROR: directorFolder does not exist: " + directorFolder;
        jsonOut = { "rest_rc": rest_rc, "message": message };
        response.status (rest_rc).send (jsonOut);
        }
    else
        {
        // get all movie files under director
        glob (directorFolder + "/*.*", (err, files) =>
            {
            var moviefiles = [];

            if (err)
                {
                rest_rc = 500;
                message = "unable to read moviefiles";
                jsonOut = { "rest_rc": rest_rc, "message": message };
                response.status (rest_rc).send (jsonOut);
                }
            else
                {
                for (var i = 0; i < files.length; i++)
                    {
                    moviefiles.push (files [i]);

                    fs.unlinkSync (files [i]);
                    console.log ("successful file unlink: " + files [i]);
                    }

                fs.rmdirSync (directorFolder);
                console.log ("successful folder unlink: " + directorFolder);

                // return json response
                rest_rc = 200;
                message = "successfully removed director and their files";
                jsonOut = { "rc": rest_rc, "message": message, "moviefiles": moviefiles };
                response.status (rest_rc).send (jsonOut);
                }
            });
        }
    });

v1.delete ("/directors/:director/movies.json", (request, response) =>
    {
    // EX:   /v1/directors/Landis/movies.json
    // DESC: deletes movie under Landis

    // ex: Landis
    var director = request.params.director;
    console.log ("director: " + director);

    // ex: ../static/directors/Landis
    var directorFolder = "../static/directors/" + director;
    console.log ("directorFolder: " + directorFolder);

    var moviename     = request.body.moviename;                      // ex: animal_house_1978
    var moviejsonPath = directorFolder + "/" + moviename + ".json";  // ex: ../static/directors/Landis/animal_house_1978.json
    var moviejpgPath  = directorFolder + "/" + moviename + ".jpg";   // ex: ../static/directors/Landis/animal_house_1978.jpg
    console.log ("moviename:     " + moviename);
    console.log ("moviejsonPath: " + moviejsonPath);
    console.log ("moviejpgPath:  " + moviejpgPath);

    // {"rc":404,"message":"director folder does not exist"}

    // if director does not exist (e.g. "../static/director/Landis")...
    if (!fs.existsSync (directorFolder))
        {
        var message = "director folder does not exist: " + directorFolder;
        console.log (message);
        response.status (404).send ({ "rc": 404, "message": message });
        }

    // if movie does not exist (e.g. "../static/director/Landis/animal_house.json")...
    else if (!fs.existsSync (moviejsonPath))
        {
        var message = "moviejsonPath does not exist: " + moviejsonPath;
        console.log (message);
        response.status (404).send ({ "rc": 404, "message": message });
        }
    else
        {
        // delete the movie
        fs.unlinkSync (moviejsonPath);

        if (fs.existsSync (moviejsonPath))
            {
            var message = "unable to delete moviejsonPath: " + moviejsonPath;
            console.log (message);
            response.status (404).send ({ "rc": 404, "message": message });
            }
        else
            {
            fs.unlinkSync (moviejpgPath);

            if (fs.existsSync (moviejpgPath))
                {
                var message = "unable to delete moviejpgPath: " + moviejpgPath;
                console.log (message);
                response.status (404).send ({ "rc": 404, "message": message });
                }
            else
                {
                //var rc = 204;   // should use 204 (DELETE successful), but that doesn't return json message
                var message = "successfully deleted movie: " + moviename;
                console.log (message);
                response.status (200).send ({ "rc": 200, "message": message });
                }
            }
        }
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

