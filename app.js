const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const ejs = require('ejs');


const dbHost = process.env.DB_HOST || 'localhost'
const dbPort = process.env.DB_PORT || 27017
const dbName = process.env.DB_NAME || 'db_Blog'

const mongoUrl = `mongodb://${dbHost}:${dbPort}/${dbName}`

// Trong thơi gian docker-compose khởi tạo service app thì mongo chưa load xong, nên sẽ để 5s đẻ load
const connectWithRetry = function () { 
  return mongoose.connect(mongoUrl, { useNewUrlParser: true, useFindAndModify: false }, (err) => {
    if (err) {
      console.error('Failed to connect to mongo on startup - retrying in 5 sec', err)
      setTimeout(connectWithRetry, 5000)
    }
  })
}
connectWithRetry()

const api_blog = require('./routes/api_blog')

const app = express()

app.disable('x-powered-by')

// setup template engine
app.set('views', path.join(__dirname, '/views/'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(flash())

app.use('/api', api_blog)

// Lỗi 404 
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.send({message:"error"})
})
const port = process.env.PORT
app.listen(port, () => {
  console.log(`dangdh11 Example app listening at http://localhost:${port}`)
})

module.exports = app
