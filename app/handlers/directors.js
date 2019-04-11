var helpers = require ("./helpers.js");
var async   = require ("async");
var fs      = require ("fs");

exports.version = "0.1.0";

exports.list_all = function (request, response)
    {
    load_director_list (function (err, directors)
        {
        if (err)
            {
            helpers.send_failure (response, 500, err);
            }
        else
            {
            helpers.send_success (response, { directors: directors });
            }
        });
    };

function load_director_list (callback)
    {
    // assume that any directory in our "directors" subfolder is a director
    fs.readdir ("../static/directors", function (err, files)
        {
        if (err)
            {
            callback (helpers.make_error ("file_error", JSON.stringify (err)));
            return;
            }

        console.log ("files: ", files);

        var only_dirs = [];

        async.forEach (files, function (element, cb)
            {
            fs.stat ("../static/directors/" + element, function (err, stats)
                {
                if (err)
                    {
                    cb (helpers.make_error ("file_error", JSON.stringify (err)));
                    return;
                    }
                else
                    {
                    only_dirs.push ({ name: element });
                    }

                cb (null);
                });
            },

            function (err)
                {
                callback (err, err ? null : only_dirs);
                }
            );
        });
    };

