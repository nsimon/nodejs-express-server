$(function ()
    {
    var tmpl;        // Main template HTML
    var tdata = {};  // JSON data object that feeds the template

    // Initialize page
    var initPage = function ()
        {
        // Get director name
        parts = window.location.href.split ("/");
        var director_name = parts [5];
 
        // Load the HTML template
        $.get ("/templates/director_page.div", function (d)
            {
            tmpl = d;
            });

        // Retrieve the server data and then initialise the page
        // ex: /v1/directors/Quentin.json
        $.getJSON ("/v1/directors/" + director_name + ".json", function (d)
            {
            var movie_d = massage_director (d);

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

function massage_director (d)
    {
    if (d.error != null)
        {
        return d;
        }

    // example json (d):
    //  { "error": null,
    //    "data": { "director_data":
    //  { "director": "Quentin",
    //    "movies": [{ "filename": "Reservoir_Dogs.json",
    //                 "poster_url": "Reservoir_Dogs.jpg",
    //                 "desc": "Reservoir Dogs" },
    //
    //               { "filename": "Pulp_Fiction.json ",
    //                 "poster_url": "Pulp_Fiction.jpg",
    //                 "desc": "Pulp Fiction" }]}}};

    // Set to "director_data" section of json
    var af = d.data.director_data;

    // ex: Quentin
    var director = af.director;
    
    var obj = { movies: [] };

    for (var i = 0; i < af.movies.length; i++)
        {
        // ex: Pulp_Fiction.json
        var movie_foldername = af.movies [i].filename;

        // path to jpg. ex: /directors/Quentin/Pulp_Fiction_1994.jpg
        var poster_url = "/directors/" + director + "/" + af.movies [i].poster_url;

        // path to url. ex: /director/Quentin/Pulp_Fiction_1994 (slice remove .json extension)
        var movie_url = "/pages/director/" + director + "/" + movie_foldername.slice (0, -5);

        obj.movies.push ({ poster_url: poster_url, movie_url: movie_url, desc: af.movies [i].filename });
        }
    return obj;
    }

