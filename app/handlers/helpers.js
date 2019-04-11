// TODO: place helper functions in here (available to server.js)

exports.version = '0.1.0';

exports.make_error = function (err, msg)
    {
    var e = new Error (msg);
    e.code = err;
    return e;
    }

exports.send_success = function (response, data)
    {
    response.writeHead (200, { "Content-Type": "application/json" });
    var output = { error: null, data: data };
    response.end (JSON.stringify (output) + "\n");
    }

exports.send_failure = function (response, rest_rc, message)
    {
    response.writeHead (rest_rc, { "Content-Type" : "application/json" });
    response.end (JSON.stringify ({ error: rest_rc, message: message }) + "\n");
    }

exports.invalid_resource = function ()
    {
    return exports.make_error ("invalid_resource", "the requested resource does not exist");
    }

exports.no_such_album = function ()
    {
    return exports.make_error ("no_such_album", "the specified album does not exist");
    }

