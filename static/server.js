import { DEFAULT_PORT, SERVER_ADDRESS } from './constants';

const http = require('http');
const express = require('express');
const fileUpload = require('express-fileupload');
const httpProxy = require('http-proxy');
const path = require('path');
require("babel-core/register");
require("babel-polyfill");

const proxy = httpProxy.createProxyServer({});

const app = express();

app.use(require('morgan')('short'));

(function initWebpack() {
    const webpack = require('webpack');
    const webpackConfig = require('./webpack/common.config');

    const compiler = webpack(webpackConfig);

    app.use(require('webpack-dev-middleware')(compiler, {
        noInfo: true, publicPath: webpackConfig.output.publicPath,
    }));

    app.use(require('webpack-hot-middleware')(compiler, {
        log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000,
    }));

    app.use(express.static(path.join(__dirname, '/')));
}());

app.all(/^\/api\/(.*)/, (req, res) => {
    proxy.web(req, res, { target: SERVER_ADDRESS });
});

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.use(fileUpload());

// upload endpoint
app.post('/upload', (req, res) => {
    if (req.files === null) {
        return res.status(400).json({ msg: 'No file uploaded' });
    }

    const file = req.files.file;

    file.mv(`${__dirname}/../data/${file.name}`, err => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
        res.json({status: true, message: '${file.name} is uploaded'})
    });
});

const server = http.createServer(app);
server.listen(process.env.PORT || DEFAULT_PORT, () => {
    const address = server.address();
    console.log('Listening on: %j', address);
    console.log(' -> that probably means: http://localhost:%d', address.port);
});
