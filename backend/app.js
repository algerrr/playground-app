const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');

//DB Config
const app = express();
const connection_url = 'mongodb+srv://tester:' + process.env.MONGO_ATLAS_PW + '@cluster0.ha07g.mongodb.net/angular-post?retryWrites=true&w=majority';

// console.log(connection_url);

mongoose.connect(connection_url)
  .then(() => {
    console.log('Connected to Database!');
  })
  .catch(err => {
    console.log(err);
    console.log('Failed to connect to Database!');
  });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//development
// app.use("/images", express.static(path.join("backend/images")));
// app.use(express.static('./backend/angular'));

//prod
console.log(path.join(__dirname));
console.log(path.join(__dirname, "images"));
console.log(path.join(__dirname, "angular"));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/", express.static(path.join(__dirname, "angular")));

//Middlewares
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, content-type, accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCHED, DELETE, OPTIONS, PUT');
  next();
});


//router
app.use("/api/posts", postRoutes);
app.use("/api/user", userRoutes);
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "angular", "index.html"));
});

module.exports = app;
