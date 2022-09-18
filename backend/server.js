const express = require('express')
const bodyParser = require('body-parser')
const path = require('path');
const app = express()
const cors = require("cors");
const port = 3000
const {utils} = require('./utils/utilityMethods')
const {database} = require('./database')
const fileUpload = require('express-fileupload')
app.use(fileUpload())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(bodyParser.raw({type: 'application/octet-stream', limit : '3mb'}))
app.use(express.static(path.resolve(__dirname + '/client/dist')))
app.use(cors());

app.use('*', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

 
app.post('/user/data', function (req, res) {
  res.send(utils.parseUserData(req.body));
});

app.post('/image', function (req, res) {
  const image = req.files.image;
  const imageName = image.name.split('.')[0];
  utils.resizeImage(image, imageName)
  .then((newImage) => {
    res.write(newImage, 'binary');
    res.end();
  })
  .catch((error) => {
    res.send(error);
  })
  .finally(() => {
    utils.fileCleanUp(imageName);
  })
});

app.get('/users', function (req, res) {
  database.users.getUsers()
  .then((users) => {res.send(users)})
  .catch((error) => {res.send(error)})
});

app.post('/users', function (req, res) {
  const body = req.body
  database.users.addUser(body)
  .then(() => {res.end()})
  .catch((error) => {res.send(error)})
});

app.delete('/users/:id', function (req, res) {
  const userId = req.params.id
  database.users.deleteUser(userId)
  .then(() => {res.end()})
  .catch((error) => {res.send(error)})
});

app.get('/users/:id', function (req, res) {
  const userId = req.params.id
  database.users.getUser(userId)
  .then((user) => {res.send(user)})
  .catch((error) => {res.send(error)})
});

app.post('/users/:id/password', function (req, res) {
  const userId = req.params.id
  const password = req.body.password
  database.passwords.addPassword(userId, password )
  .then(() => {res.end()})
  .catch((error) => {res.send(error)})
});

app.get('/passwords', function (req, res) {
  database.passwords.getPasswords()
  .then((passwords) => {res.send(passwords)})
  .catch((error) => {res.send(error)})
});

app.get('/passwords/active', function (req, res) {
  database.passwords.getActivePasswords()
  .then((passwords) => {res.send(passwords)})
  .catch((error) => {res.send(error)})
});

app.listen(port, () => {
    console.log('Server started at http://localhost:' + port);
})
