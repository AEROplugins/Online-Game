const socket = io()

socket.on('connected', () => {
    console.log('connected on server')
})

setInterval(() => {
    socket.emit('registred-players')
    socket.emit('players-online')
},5000)

socket.on('players-online', (data) => {
    console.log(`${socket.id}: Request[players-online] response:`+data)
    $('#online-players').html(data)
})

socket.on('registred-players', (data) => {
    console.log(`${socket.id}: Request[registred-players] response:`+data)
    $('#registred-players').html(data)
})