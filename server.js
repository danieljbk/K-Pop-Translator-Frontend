import mongoose from 'mongoose'
import cors from 'cors'
import livereload from 'livereload'
import connectLivereload from 'connect-livereload'

import express from 'express'
const app = express()

import path from 'path'
const __dirname = path.resolve()

import dotenv from 'dotenv'
dotenv.config()

const port = process.env.PORT || 8080

// open livereload high port and start to watch public directory for changes
const liveReloadServer = livereload.createServer()
liveReloadServer.watch(path.join(__dirname, 'public'))

// ping browser on Express boot, once browser has reconnected and handshaken
liveReloadServer.server.once('connection', () => {
  setTimeout(() => {
    liveReloadServer.refresh('/')
  }, 100)
})

// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({ origin: '*' }))
app.use(connectLivereload())

// send the user to index html page in spite of the url
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, './public/index.html'))
})

import searchRouter from './src/routes/search.js'
app.use('/search/', searchRouter)

import songsRouter from './src/routes/songs.js'
app.use('/songs/', songsRouter)

import spotifyRouter from './src/routes/spotify.js'
app.use('/spotify/', spotifyRouter)

import mirinaeRouter from './src/routes/mirinae.js'
app.use('/mirinae/', mirinaeRouter)

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', (error) => console.log(error))
db.once('open', () => {
  console.log('Connected to database')

  // start the server
  app.listen(port, () => {
    if (process.send) {
      process.send('online')
    }
    console.log('Server has started on port ' + port)
  })
})
