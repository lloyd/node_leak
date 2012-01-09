const
url = require('url'),
http = require('http'),
https = require('https'),
querystring = require('querystring');

module.exports = function(dest, req, res, cb) {
  var u = url.parse(dest.toString());

  var m = u.protocol === 'http:' ? http : https;

  var preq = m.request({
    host: u.hostname,
    port: u.port,
    path: u.pathname,
    method: req.method,
    agent: false
  }, function(pres) {
    res.statusCode = pres.statusCode;
    // forward along Content-Type and Content-Length, if available
    if (pres.headers.hasOwnProperty('content-type')) {
      res.setHeader('Content-Type', pres.headers['content-type']);
    }
    if (pres.headers.hasOwnProperty('content-length')) {
      res.setHeader('Content-Length', pres.headers['content-length']);
    }
    if (pres.headers.hasOwnProperty('set-cookie')) {
      res.setHeader('Set-Cookie', pres.headers['set-cookie']);
    }
    pres.on('data', function (chunk) {
      res.write(chunk);
    }).on('end', function() {
      res.end();
      pres.removeAllListeners();
      pres.destroy();
      preq.removeAllListeners();
      preq.destroy();
      cb();
    });
  }).on('error', function(e) {
    preq.removeAllListeners();
    preq.destroy();
    cb(e);
  });

  if (req.headers['content-type']) {
    preq.setHeader('Content-Type', req.headers['content-type']);
  }

  // forward cookies
  if(req.headers['cookie']) {
    preq.setHeader('Cookie', req.headers['cookie']);
  }

  // if the body has already been parsed, we'll write it
  if (req.body) {
    var data = querystring.stringify(req.body);
    preq.setHeader('content-length', data.length);
    preq.write(data);
    preq.end();
  } else {
    req.on('data', function(chunk) { preq.write(chunk) })
      .on('end', function() { preq.end() });
  }
};
