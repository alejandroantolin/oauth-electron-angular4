'use strict';

const {app, BrowserWindow} = require('electron')
var request = require('superagent');
var options = require('./config.json');

exports.startRequest = (win, callback) =>  {
    this.window = new BrowserWindow({parent: win, modal: true, width: 500, height: 630, webPreferences: {nodeIntegration: false}});
    var authURL = `https://github.com/login/oauth/authorize?client_id=${options.id}&scope=${options.scopes}`;
    this.window.loadURL(authURL);
    this.window.once('ready-to-show', () => {
        this.window.show()
    })

    this.window.webContents.on('will-navigate', (event, url) => {
        handleCallback(url, callback);
    });

    this.window.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
        handleCallback(newUrl, callback);
    });

    this.window.on('close', () => {
        this.window = null;
    }, false);

}

let handleCallback = (url, callback) => {
    var raw_code = /code=([^&]*)/.exec(url) || null;
    var code = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
    var error = /\?error=(.+)$/.exec(url);
    if (code) {
        requestGithubToken(code, callback);
    } else if (error) {
        alert('Oops! Something went wrong and we couldn\'t' +
        'log you in using Github. Please try again.');
    }
}

let requestGithubToken = (code, callback) => {
    request.post('https://github.com/login/oauth/access_token', {
        client_id: options.id,
        client_secret: options.secret,
        code: code,
    }).end((err, response) => {
        this.window.destroy();
        if (err) {
            callback(err);
        }
        var access_token = response.body.access_token;
        callback(response.body.access_token);
    });
}



