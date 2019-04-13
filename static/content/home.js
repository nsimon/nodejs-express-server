$(function ()
    {
    var tmpl;    // Main template HTML
    tdata = {};  // JSON data object that feeds the template
 
    // Initialize page
    var initPage = function ()
        {
        // Load the HTML template
        $.get ("/templates/director_list.div", function (d)
            {
            tmpl = d;
            });
 
        // Retrieve the server data and then initialise the page
        // ex: /v1/directors.json
        $.getJSON ("/v1/directors.json", function (d)
            {
            $.extend (tdata, d.data);
            });
 
        // When AJAX calls are complete, parse the template replacing mustache tags with vars
        $(document).ajaxStop (function ()
            {
            var renderedPage = Mustache.to_html (tmpl, tdata);

            $("body").html (renderedPage);
            });
        }();
    });

