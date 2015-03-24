first = -> it[0]
last = -> it[*-1]

rooms = []

export generateSessionID = -> (rooms |> last |> (+ 1)) || 0

export Session = (io)->
  socket <- io.on 'connection'
  console.log 'a user connected'
  jointRoom = null

  do
    data <- socket.on 'join'
    console.log 'want join', data
    socket.join data.room
    jointRoom := data.room
    
    Number data.room
    |> -> rooms.push it if it not in rooms

  do
    <- socket.on 'disconnect'

    remove = ->
      Number it
      |> rooms.indexOf
      |> rooms.splice _, 1
    
    io.sockets.adapter.rooms[jointRoom]
    |> -> if not it or Object.keys(it) is 0 then remove jointRoom

  do
    data <- socket.on 'wantPlaylist'
    console.log 'want playlist in rooms ', socket.rooms

    #just want to try it out lol
    socket.rooms.filter (r)-> r isnt socket.id
    |> first
    |> socket.broadcast.to _
    |> -> it.emit 'wantPlaylist', socket.id

  do
    {playlist, target} <- socket.on 'replyPlaylist'
    console.log 'reply with playlist ', playlist, 'to', target

    socket
    .broadcast
    .to target
    .emit 'replyPlaylist', playlist

  passCommand = (commandName)->
    data <- socket.on commandName
    console.log 'someone wants to update', data

    socket.rooms
    .filter (r)-> r isnt socket.id
    .reduce ((s,id)-> s.to id), socket.broadcast
    .emit commandName, data

  passCommand 'updatePlaylist'
  ['play' 'pause' 'stop' 'next' 'previous' 'rewind' 'fastforward' 'mute' 'unmute']
  .forEach -> passCommand it