var http = require('http');
var serveStaticFiles = require('ecstatic')({ root: __dirname + '/static' });
var port = process.env.PORT || 8000;

http.createServer(function (req, res) {
    if (req.url.indexOf('/api') === 0) {
        return require('./lib/api-handler')(req, res);
    }
    serveStaticFiles(req, res);
}).listen(port);

console.log('Listening on http://localhost:%d', port);
