'use strict';

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const request = require('request-promise');
const iconv = require('iconv-lite');
const fs = require('fs');
const jimp = require("jimp");
const util = require("util");
const writeFile = util.promisify(fs.writeFile);

// The following environment variables are set by app.yaml (app.flexible.yaml or
// app.standard.yaml) when running on Google App Engine,
// but will need to be manually set when running locally.
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_SENDER = process.env.SENDGRID_SENDER;
const SENDGRID_TO = process.env.SENDGRID_TO;
const Sendgrid = require('@sendgrid/client');

Sendgrid.setApiKey(SENDGRID_API_KEY);

const app = express();

// function to encode file data to base64 encoded string
function base64_encode(file) {
  // read binary data
  var bitmap = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  return bitmap.toString('base64');
}

function compositeImage(baseImagePath, setImagePath, dstImagePath) {
  return Promise.all([jimp.read(baseImagePath),jimp.read(setImagePath)])
  .then(image => {return image[0].composite(image[1], 0, 0).write(dstImagePath)})
}

function poststr() {
  var mainokazu = [];
  var calsolt = [];
  var caltitle = [];
  var timestamp = (new Date()).toISOString().replace(/[^0-9]/g, "");
  const blackimg = {
    uri: 'https://www2.mdlife-md-lunch.com/itami2userhtml/display/images/item0001A001.jpg',
    method: "GET",
    encoding: null
  }
  const whiteimg = {
    uri: 'https://www2.mdlife-md-lunch.com/itami2userhtml/display/images/item0001B001.jpg',
    method: "GET",
    encoding: null
  }
  const menu = { 
    uri: 'https://www2.mdlife-md-lunch.com/itami2userhtml/display/menu000101.html',
    method: "GET",
    encoding: null
  }
  return request(blackimg)
  .then(body => writeFile('/tmp/black_raw.jpg', body, 'binary'))
  .then(() => request(whiteimg))
  .then(body => writeFile('/tmp/white_raw.jpg', body, 'binary'))
  .then(() => compositeImage('/tmp/black_raw.jpg', 'kuro.png', '/tmp/black.jpg'))
  .then(() => compositeImage('/tmp/white_raw.jpg', 'siro.png', '/tmp/white.jpg'))
  .then(() => request(menu))
  .then(body => {
    var decodestr, match, re;
    decodestr = iconv.decode(new Buffer.from(body, 'binary'), "SHIFT_JIS");
    re = /<td\s*class\s*=\s*"menu2".*?>(.*?)<\/td>/g;
    while ((match = re.exec(decodestr))) {
      mainokazu.push(match[1].replace(/<.*?>/, " "));
    }
    re = /<td\s*class\s*=\s*"cal".*?>(.*?)<\/td>/g;
    while ((match = re.exec(decodestr))) {
      calsolt.push(parseFloat(match[1].replace(/[^.0-9]/g, ""), 10) || 0);
    }
    re = /<td\s*class\s*=\s*"caltitle".*?>(.*?)<\/td>/g;
    while ((match = re.exec(decodestr))) {
      caltitle.push(match[1].replace(/<.*?>/, " "));
    }
    if (mainokazu[2]) {
      return eval("`"+fs.readFileSync("./mail_template.html")+"`");
    } else {
      return eval("`"+fs.readFileSync("./mail_template_blackonly.html")+"`");
    }
  })
}

app.get('/', (req, res) => {
  poststr().then(str => {
    var black_base64 = base64_encode('/tmp/black.jpg');
    var white_base64 = base64_encode('/tmp/white.jpg');
    var timestamp = (new Date()).toISOString().replace(/[^0-9]/g, "");
    var request = {
      method: 'POST',
      url: '/v3/mail/send',
      body: {
        personalizations: [
          {
            to: [{}],
            subject: `今日の昼ごはん(${timestamp.slice(0, 4)}年${timestamp.slice(4, 6)}月${timestamp.slice(6, 8)}日)`,
          },
        ],
        from: {email: SENDGRID_SENDER},
        content: [
          {
            type: 'text/html',
            value: str,
          },
        ],
        attachments: [
          {
            content: black_base64,
            filename: 'black.jpg',
            type: 'image/jpeg',
            disposition: 'inline',
            content_id: 'black.jpg'
          },
          {
            content: white_base64,
            filename: 'white.jpg',
            type: 'image/jpeg',
            disposition: 'inline',
            content_id: 'white.jpg'
          },
        ],
      },
    };
    var to_array = SENDGRID_TO.split(',');
    var arrTo = [];
    for (var i = 0; i < to_array.length; i++) {
      arrTo.push({ "email": to_array[i] });
    }
    request.body.personalizations[0]['to'] = arrTo;

    if (req.query.test) {
      request.mailSettings = {
        sandboxMode: {
          enable: true,
        },
      };
    }

    try {
      Sendgrid.request(request);
    } catch (err) {
      next(err);
      return;
    }

    res.status(200).send('Email sent');
  })
});

if (module === require.main) {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });
}

module.exports = app;
