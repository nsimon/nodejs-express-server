$(function ()
    {
    var tmpl;        // Main template HTML
    var tdata = {};  // JSON data object that feeds the template

    // Initialize page
    var initPage = function ()
        {
        parts = window.location.href.split ("/");

        // need movie_name
        alert ("parts: " + parts);

        // ex: Scorsese
        var director_name = parts [5];

        // ex: Pulp_Fiction
        // var movie_name = parts [?];

        // Load the HTML template
        $.get ("/templates/movie_page.div", function (d)
            {
            tmpl = d;
            });

        // ex: /v1/directors/Quentin/movies/Pulp_Fiction.json
        // $.getJSON ("/v1/directors/" + director_name + "/movies/" + movie_name + ".json", function (d)

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

    var obj = { movies: [] };

    var af = d.data.director_data;

    for (var i = 0; i < af.movies.length; i++)
        {
        var url = "/directors/" + af.short_name + "/" + af.movies [i].filename;

        obj.movies.push ({ url: url, desc: af.movies [i].filename });
        }

    return obj;
    }

