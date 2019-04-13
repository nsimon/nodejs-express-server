var helpers = require ("./helpers.js");
var async   = require ("async");
var fs      = require ("fs");

exports.version = "0.1.0";

exports.load_director_list = () =>
    {
    var jsonOut;

    // read the directors directory (each folder name is a director)
    fs.readdir ("../static/directors", function (err, files)
        {
        if (err)
            {
            var rc = 1;
            var message = "Internal server error";
            jsonOut = { "error": rc, "message": message };
            }
        else
            {
            console.log ("files: ", files);

            var directors = [];

            async.forEach (files, function (element, cb)
                {
                directors.push ({ "name": element });

                cb (null);
                });

            jsonOut = directors;
            }

        return (jsonOut);
        });
    }

