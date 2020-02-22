var express = require('express');
var router = express.Router();
var request = require('request');
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

var request = require('request');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  console.log(credentials);
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

router.get('/stories', async function (req, res, next) {

  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Drive API.
    authorize(JSON.parse(content), async function (auth) {
      const drive = google.drive({ version: 'v3', auth });
      drive.files.list({
        q: "parents in '1CAQlXNXi3gQf-Z39pNHzT7gyChrHv-B_'"
      }).then(async function (value) {
        list = await getValues(drive, value)
        res.status(200).json(list)
      })
    })
  });


});

async function getValues(drive, value) {
  let list = [];
  for (let i = 0; i < value.data.files.length; i++) {
    let v = { doc: null, meta: null };
    if (value.data.files[i].mimeType === "application/vnd.google-apps.document") {
      v.doc = await drive.files.export({
        fileId: value.data.files[i].id,
        mimeType: "text/html"
      })
      v.meta = await drive.files.get({ fileId: value.data.files[i].id })
      list.push(v);
    }

  }
  return list
}

/*Spotify authorization*/
var client_id = 'a3b7800b71e74934aa288bc3846a8f61'; // Your client id
var client_secret = '48822fdd901345259f57d4e2e2e2726d'; // Your secret

router.get('/spotifyPlaylists', function(req, res, next) {
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
      grant_type: 'client_credentials'
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
  
      // use the access token to access the Spotify Web API
      var token = body.access_token;
      var options = {
        url: 'https://api.spotify.com/v1/users/oecs54niyzomumcfvuq5v83ws/playlists',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        json: true
      };
      request.get(options, function(error, response, body) {
        res.status(200).json(response)
      });
    }
  });
})


module.exports = router;
