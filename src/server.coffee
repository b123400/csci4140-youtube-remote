express = require 'express'
app = express()
http = require('http').Server app
io = require('socket.io') http

app.get '/', (req, res)->
  res.send '<h1>Hello world</h1>'

app.get '/session/:id', (req, res)->
  res.sendFile "#{__dirname}/client/session.html"

app.use '/client', express.static "#{__dirname}/client"

io.on 'connection', (socket)->
  console.log 'a user connected'

http.listen 3000, ->
  console.log 'listening on *:3000'