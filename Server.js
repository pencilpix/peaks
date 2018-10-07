const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const router = require('./router')


const mongodb = 'mongodb://localhost/peaksdb'
const VERSION = require('./package.json').version
const PORT = process.env.PORT || 2500
const app = express();
let db = null


mongoose.connect(mongodb, { useNewUrlParser: true })
db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))




app.use(bodyParser.json())

app.use(bodyParser.urlencoded({ extended: true }))

app.use(router)

app.use('/*', (req, res, next) => {
  res.status(404).end(
    `
    <div style="height: 400px; width: 400px; margin: auto; font-family: monaco">
      <h1 style="font-size: 1.5rem; color: teal">PEAKS v${VERSION}</h1>
      <p style="color: #757575; font-size: 1rem">The page you are looking for is not found!</p>
      <p style="color: #666; font-size: 1rem">This server intended to be used for internal use only. use it to get peaks and save it to your server.</p>
      <p style="color: #424242; font-size: 1rem"><b>example using axios</b></p>
      <pre style="padding: .5rem; background-color: #f5f5f5">
        axios.get('/peaks?track=http://example.domain/audio.mp3');
      </pre>
    </div>
    `
  )
})



app.listen(PORT, () => {
  console.log('PEAKS v' + VERSION, '\n Server is listening to port: ' + PORT);
})




