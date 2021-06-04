const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const connectDB = require('./config/db');
const fileupload = require('express-fileupload');
const errorHandler = require('./middleware/errorHandler');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const mongoSanitizer = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

// ROUTE files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

//connect to database
connectDB();

//load env var
dotenv.config({ path: './config/config.env' });

const app = express();

// to get json data
app.use(express.json());

//cokie parser
app.use(cookieParser());

//Dev loging midleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// file upload
app.use(fileupload());

// Preventing from no SQL injection
app.use(mongoSanitizer());

// Set sucurity headers
app.use(helmet());

// Prevent xss attacks
app.use(xss());

// rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});

app.use(limiter);

// Prevent http  param polution
app.use(hpp());

// Enable CORS
app.use(cors());

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

//Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);

const port = process.env.PORT || 5000;

const server = app.listen(port, () =>
  console.log(
    `Server is starting in ${process.env.NODE_ENV} mode on port : ${process.env.PORT}`
      .yellow
  )
);

//Handaled and unhandaled promise
process.on('unhandledRejection', (err, promise) => {
  console.log(`ERROR: ${err.message}`.red);
  //closing server and exit procces
  server.close(() => process.exit(1));
});
