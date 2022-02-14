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

mongoose.connect(connection_url)
  .then(() => {
    console.log('Connected to Database!');
  })
  .catch(err => {
    console.log(err);
    console.log('Failed to connect to Database!');
  });

// function requireHTTPS(req, res, next) {
//   // The 'x-forwarded-proto' check is for Heroku
//   if (!req && !req.secure && req.get('x-forwarded-proto') !== 'https') {
//     return res.redirect('https://' + req.get('host') + req.url);
//   }
//   next();
// }
// app.use(requireHTTPS());
// app.use(express.static(path.join(__dirname, './angular')));
app.use(express.static('./backend/angular'));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join("backend/images")));
// app.use("/", express.static(path.join(__dirname, "angular")));

//Middlewares
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, content-type, accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCHED, DELETE, OPTIONS, PUT');
  next();
});


//router
app.get('/home', (req, res) => {
  res.sendFile('index.html', { root: 'backend/angular' });
});
app.use("/api/posts", postRoutes);
app.use("/api/user", userRoutes);
// app.use((req, res, next) => {
//   res.sendFile(path.join(__dirname + "angular", "index.html"));
// });

module.exports = app;
