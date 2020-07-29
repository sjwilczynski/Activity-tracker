const express = require('express');
const path = require('path');
const mockData = require("./mock-data.json")
const app = express();

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// An api endpoint that returns a short list of items
app.get('/api/getData', (req,res) => {
    res.json(mockData);
});

// Handles any requests that don't match the ones above
app.get('/', (req,res) =>{
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);