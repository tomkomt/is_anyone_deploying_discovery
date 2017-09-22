const express = require('express');
const http = require('http');
const cloudant = require('cloudant');
const exec = require('child_process').exec;
const app = express();

var discoverOpm = function() {
  var postResponse = function(resultCode) {
    resultCode = resultCode == '401' ? 1 : 0;
    console.log('[Discover] Result code is...' + resultCode);
    console.log('[Discover] Data for GET...' + JSON.stringify(resultCode));
    var curlLink;
    if(resultCode == 1) {
      curlLink = 'powershell curl http://is-toni-deploying.eu-gb.mybluemix.net/esp/opm/insertQuery?serverStatus=1';
    } else {
      curlLink = 'powershell curl http://is-toni-deploying.eu-gb.mybluemix.net/esp/opm/insertQuery?serverStatus=0';
    }
    console.log('[Discover] Exec...' + curlLink);
    exec(curlLink, function (error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
  }

  console.log('[Discover] Start of discovery...');
  var resultCode;
  var headOptions = {
    host: 'web-ite.swissre.com',
    port: 80,
    path: '/webapp/opm/serviceQuery',
    method: 'HEAD',
    headers: {
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.8,sk;q=0.6,cs;q=0.4',
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36'
    }
  };

  var reqHead = http.request(headOptions, function (reqRes) {
    resultCode = reqRes.statusCode;
    postResponse(resultCode);
  });
  reqHead.end();
  console.log('[Discover] End of discovery request...');
  reqHead.on('error', function(e) {
    resultCode = e.code;
    postResponse(resultCode);
    console.log('[Discover] HEAD result code...' + resultCode);
  });
}

app.get('/', function (req, res) {
  res.send('Hello World!')
});


app.get('/discover/opm', function (req, res) {
  discoverOpm();
});

app.listen(3000, function () {
  console.log('Backend discovery listening on port 3000!');
  discoverOpm();
  setInterval(function() {
    discoverOpm();
  }, 60000);
})
