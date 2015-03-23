module.exports = (io)->
  io.on 'connection', (socket)->
    console.log 'a user connected'

    do
      data <- socket.on 'join'
      console.log 'want join', data
      socket.join data.room

    do
      data <- socket.on 'wantPlaylist'
      console.log 'want playlist in rooms ', socket.rooms

      socket.rooms.filter (r)-> r isnt socket.id
      |> (r)-> r[0]
      |> (room)-> socket.broadcast.to room
      |> (s)-> s.emit 'wantPlaylist', socket.id

    do
      {playlist, target} <- socket.on 'replyPlaylist'
      console.log 'reply with playlist ', playlist, 'to', target

      socket
      .broadcast
      .to target
      .emit 'replyPlaylist', playlist

    do
      playlist <- socket.on 'updatePlaylist'
      console.log 'someone wants to update', playlist

      socket
      .broadcast
      .emit 'updatePlaylist', playlist