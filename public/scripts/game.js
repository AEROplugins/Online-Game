const nickname_p_tag = document.getElementById('account-nickname')
const username_p_tag = document.getElementById('account-username')
const password_p_tag = document.getElementById('account-password')

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

const socket = io()

let mePlayer = {}
let serverPersons = []

socket.on('connected', () => {
    console.log('connected on server')

    socket.emit('join-game',{
        username: username_p_tag.innerText,
        password: password_p_tag.innerHTML
    })
})

socket.on('load-player', (player) => {
    mePlayer = player
    console.log(`you player is loaded from server: `, mePlayer)
})

socket.on('start-gameloop', () => {
    setInterval(() => {gameloop()},1000/60)
})

socket.on('persons-update', (persons) => {
    console.log(`you received all persons datas from server: `, persons)
    serverPersons = persons
})

function gameloop() {
    tick()
    render()
}

function tick() {
    socket.emit('persons-update')
}

function render() {
    resetCanvas()
    renderPlayers()
}

function renderPlayers() {
    serverPersons.forEach((person) => {
        ctx.fillStyle = 'whitesmoke'
        ctx.fillRect(person.x, person.y, person.width, person.height)
    })
}

function resetCanvas() {
    ctx.fillStyle = '#333'
    ctx.fillRect(0,0,canvas.width,canvas.height)
}

document.addEventListener('keyup', (event) => {
    let key = event.key

    socket.emit('keyup', key, mePlayer.account)
})

document.addEventListener('keydown', (event) => {
    let key = event.key

    socket.emit('keydown', key, mePlayer.account)
})