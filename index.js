const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser')
const cors = require('cors')
const limit = require("express-rate-limit");
const Events = require('./Routes/Events');
const Users = require('./Routes/Users');

require('dotenv').config();

const app = express()
const port = 3006


const server = require('http').Server(app);

app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(morgan('dev'))
app.use(cors())

app.use("/api/events", Events);
app.use("/api/users", Users);

app.use(limit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 1000, // 200 request
  message: {
    toManyRequest: true,
  }
}))



//Default Index Page
app.use(express.static(__dirname + '/dist'));
//Send all other items to index file
app.get('*', (req, res) => res.sendFile(__dirname + '/dist/index.html'));

server.listen(port, function () {
  console.debug(`listening on port ${port}`);
});