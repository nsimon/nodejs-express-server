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

