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

        // ex: /v1/directors/Quentin/movie/Pulp_Fiction.json
        $.getJSON ("/v1/directors/" + director_name + "/movie/" + movie_name + ".json", function (d)
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

    var filename  = d.data.filename;  // ex: Pulp_Fiction.json
    var desc      = d.data.desc;      // ex: Pulp Fiction
    var director  = d.data.director;  // ex: Scorsese

    // ex: /directors/Scorsese/Pulp_Fiction.jpg
    var poster_url = "/directors/" + director + "/" + d.data.poster_url;

    var obj = { "director": director, "poster_url": poster_url, "desc": filename };

    return obj;
    }

