const
child_process = require('child_process'),
http = require('http'),
forward = require('./http_forward.js'),
gcstats = require('gcstats'),
fs = require('fs');

var startTime = new Date();

var filename = "data_" + (process.env['LEAK'] ? "leak" : "noleak");

var memoryFile = fs.createWriteStream(filename + "_mem.txt");
var trendFile = fs.createWriteStream(filename + "_trend.txt");

gcstats.on('gc', function(e) {
  if (e.compacted) {
    trendFile.write(((new Date() - startTime) / 1000.0).toFixed(1) + " " + gcstats.stats().usage_trend + "\n");
  }
});

setInterval(function() {
  memoryFile.write(((new Date() - startTime) / 1000.0).toFixed(1) + " " + process.memoryUsage().heapUsed + "\n");
}, 2000);

process.title = 'leak_parent';

var kid = child_process.fork('./child.js');

kid.on('message', function(m) {
  var server = http.createServer(function (req, res) {
    forward('http://127.0.0.1:' + m, req, res, function(err) {
      if (err) console.log('error', err);
    });
  }).listen(0, "127.0.0.1", function() {
    console.log('forwarder running on http://127.0.0.1:' + server.address().port);
  });
});

process.on('SIGHUP', function() {
  console.log(process.memoryUsage());
});
