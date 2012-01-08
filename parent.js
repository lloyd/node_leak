const
child_process = require('child_process'),
http = require('http'),
forward = require('./http_forward.js');

process.title = 'leak_parent';

var kid = child_process.fork('./child.js');

kid.on('message', function(m) {
  var server = http.createServer(function (req, res) {
    forward('http://127.0.0.1:' + m, req, res, function(err) {
      if (err) console.log('error!');
    });
  }).listen(0, "127.0.0.1", function() {
    console.log('forwarder running on http://127.0.0.1:' + server.address().port);
  });
});
