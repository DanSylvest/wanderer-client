const express = require('express');
const app = express();
const path = require('path');
const https = require('https');
const fs = require('fs');

app.use(express.static(path.join(__dirname, '..', 'dist')));

const port = process.env.HTTPS_PORT || 3000;

console.log('SSL_CERT', process.env.SSL_PATH_CERT);
console.log('SSL_KEY', process.env.SSL_PATH_KEY);

// Загрузите SSL-сертификаты
const options = {
    key: fs.readFileSync(process.env.SSL_PATH_KEY),
    cert: fs.readFileSync(process.env.SSL_PATH_CERT)
};


https.createServer(options, app).listen(port, () => {
    console.log(`Server is listening on https://localhost:${port}`);
});