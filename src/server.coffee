express = require 'express'
app = express()
http = require('http').Server app
io = require('socket.io') http
{generateSessionID, Session} = require './socket'

serverPort = process.env.OPENSHIFT_NODEJS_PORT || 8000
serverIpAddress = process.env.OPENSHIFT_NODEJS_IP || 'localhost'

app.get '/', (req, res)->
  res.redirect '/session/'+generateSessionID()

app.get '/session/:id', (req, res)->
  res.sendFile "#{__dirname}/client/session.html"

app.use '/client', express.static "#{__dirname}/client"
app.use '/fonts', express.static "#{__dirname}/client/fonts"

Session io

http.listen serverPort, serverIpAddress, ->
  console.log 'listening on *:8000', arguments