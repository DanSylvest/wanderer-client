const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, '..', 'dist')));

const port = process.env.HTTP_PORT || 3000;

app.listen(port, () => {
    console.log(`Server is listening on port http://localhost:${port}`);
});