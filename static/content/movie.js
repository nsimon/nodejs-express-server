$(function ()
    {
    var tmpl;        // Main template HTML
    var tdata = {};  // JSON data object that feeds the template

    // Initialize page
    var initPage = function ()
        {
        parts = window.location.href.split ("/");

        // ex: Scorsese
        var director_name = parts [5];

        // ex: Pulp_Fiction
        var movie_name = parts [6];

        // Load the HTML template
        $.get ("/templates/movie_page.div", function (d)
            {
            tmpl = d;
            });

        // ex: /v1/directors/Quentin/movies/Pulp_Fiction_1994.json
        $.getJSON ("/v1/directors/" + director_name + "/movies/" + movie_name + ".json", function (d)
            {
            var movie_d = massage_movie (d);

            $.extend (tdata, movie_d);
            });

        // When AJAX calls are complete, parse the template replacing mustache tags with vars
        $(document).ajaxStop (function ()
            {
            var renderedPage = Mustache.to_html (tmpl, tdata);

            $("body").html (renderedPage);
            });
        }();
    });

function massage_movie (d)
    {
    if (d.error != null)
        {
        return d;
        }

    // example json (d):
    //  { "error": null,
    //    "data": { "director": director,
    //              "moviename": movie,
    //              "moviejpg":  movie + ".jpg",
    //              "moviejson": movie + ".json" }
    //  };

    var director  = d.data.director;   // ex: Quentin
    var moviename = d.data.moviename;  // ex: Pulp Fiction_1994
    var moviejpg  = d.data.moviejpg;   // ex: Pulp_Fiction_1994.jpg
    var moviejson = d.data.moviejson;  // ex: Pulp_Fiction_1994.json

    // ex: /directors/Quentin/Pulp_Fiction_1994.jpg
    var poster_url = "/directors/" + director + "/" + moviejpg;

    var obj = { "director": director, "moviename": moviename, "poster_url": poster_url };

    return obj;
    }

