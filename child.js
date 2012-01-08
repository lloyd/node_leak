const http = require('http');

process.title = 'leak_child';

var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(0, "127.0.0.1", function() {
  console.log(server.address());
  process.send(server.address().port);
});
