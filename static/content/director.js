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
    //    "data": { "director_data": { "director": "Quentin",
    //      "movies": [{ "moviename": "Pulp_Fiction_1994",
    //                   "moviejpg":  "Pulp_Fiction_1994.jpg",
    //                   "moviejson": "Pulp_Fiction_1994.json" },
    //
    //                 { "moviename": "Jackie_Brown_1997",
    //                   "moviejpg":  "Jackie_Brown_1997.jpg",
    //                   "moviejson": "Jackie_Brown_1997.json" }]}}};

    // Set to "director_data" section of json
    var af = d.data.director_data;

    // ex: Quentin
    var director = af.director;
    
    var obj = { movies: [] };

    for (var i = 0; i < af.movies.length; i++)
        {
        // ex: Pulp_Fiction_1994
        var moviename = af.movies [i].moviename;

        // path to jpg. ex: /directors/Quentin/Pulp_Fiction_1994.jpg
        var poster_url = "/directors/" + director + "/" + af.movies [i].moviejpg;

        // path to url. ex: /pages/director/Quentin/Pulp_Fiction_1994
        var movie_url = "/pages/director/" + director + "/" + moviename;

        //alert ("poster_url: " + poster_url + "\n" + 
        //       "movie_url: "  + movie_url  + "\n" +
        //       "moviename: "  + moviename);

        obj.movies.push ({ moviename: moviename, poster_url: poster_url, movie_url: movie_url });
        }

    return obj;
    }

