const express = require('express')
const bodyParser = require('body-parser')

const port = 8080;
const path = require('path')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

const contas = require('./database.js').contas
const allPlayers = require('./GameMain.js').allPlayers
const offlinePlayers = require('./GameMain.js').offlinePlayers
const onlinePlayers = require('./GameMain.js').onlinePlayers

const server_status = {
    online: 0
}

app.use(bodyParser.urlencoded({ extended: true }))

app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')
app.use('/public', express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, '/views'))

io.on('connection', (socket) => {
    server_status.online++
    socket.emit('connected')
    console.log(`new Connection [${socket.id}]`)

    socket.on('disconnect', () => {
        server_status.online--
    })

    socket.on('players-online', () => {
        socket.emit('players-online', server_status.online)
    })

    socket.on('registred-players', () => {
        socket.emit('registred-players', contas.length)
    })

    socket.on('join-game', (account) => {
        
        account = verifyAccountCredencial(account)

        if(!account) {
            return
        }

        const havePlayer = allPlayers.find((player) => {
            const playerAccount = player.account
            const condicionOne = playerAccount.username === account.username
            const condicionTwo = playerAccount.password === account.password

            if(condicionOne && condicionTwo) {
                return true
            } else {
                return false
            }
        })

        if(havePlayer) {
            console.log(`${account.username} have a player!`)
            socket.emit('load-player',havePlayer)
        } else {
            console.log(`${account.username} not have a player... creating`)
            const newPlayer = require('./GameMain.js').createNewPlayer(account)
            console.log(`${account.username} you player is created: `,newPlayer)
            socket.emit('load-player',newPlayer)
        }

        socket.emit('start-gameloop')

    })

    socket.on('keyup', (key, account) => {

        account = verifyAccountCredencial(account)

        if(!account) {
            return
        }


        console.log(`${account.username} KEYUP emited key[${key}]`)

        const player = require('./GameMain.js').getPlayerAccount(account)
        
        switch(key) {
            case 'w':
                player.person.up = false
                break
            case 's':
                player.person.down = false
                break
            case 'd':
                player.person.right = false
                break
            case 'a':
                player.person.left = false
                break
        }
    })

    socket.on('keydown', (key, account) => {

        account = verifyAccountCredencial(account)

        if(!account) {
            return
        }
        
        console.log(`${account.username} KEYDOWN emited key[${key}]`)

        const player = require('./GameMain.js').getPlayerAccount(account)
        
        switch(key) {
            case 'w':
                player.person.up = true
                break
            case 's':
                player.person.down = true
                break
            case 'd':
                player.person.right = true
                break
            case 'a':
                player.person.left = true
                break
        }
    })

    socket.on('persons-update', () => {

        socket.emit('persons-update',getAllPersons())

    })

})



// - EXPRESS

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/painel', (req, res) => {
    res.render('callback', {callback: 'modulo em desenvolvimento 🤖'})
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', (req, res) => {
    try {

        if(verifyNullInputs(req)) {
            res.render('callback', { callback: 'null inputs' })
            return
        }

        const request = {
            username: req.body.username,
            password: req.body.password,
        }

        console.log(`new Request[/login] => `, request)

        let account = verifyAccountCredencial(request)

        if (account) {
            res.render('game', account)
            console.log(`request[/login] user logged!`)
        } else {
            res.render('callback',{callback: 'usuario ou senha invalidos... 👎'})
            console.log(`request[/login] not accepted`)
        }

    } catch(e) {
        res.render('callback', { callback: '🤒 internal server error: ' + e })
    }
})

function verifyAccountCredencial(request) {
    return contas.find((account) => account.username === request.username && account.password === request.password)
}

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', (req, res) => {
    try {
        if (verifyNullInputs(req)) {
            res.render('callback', { callback: 'null inputs' })
            return
        }

        const request = {
            username: req.body.username,
            password: req.body.password,
            nickname: req.body.nickname ? req.body.nickname : `player#${(Math.random() * 9999999).toFixed()}`
        }

        console.log(`new Request[/register] => `, request)

        let account = verifyAccountExist(request)

        if (account) {
            res.render('callback', { callback: 'a conta registrada ja existe! 👎' })
        } else {
            contas.push(request)
            console.log(`request[/register] accepted`)
            res.render('callback', { callback: 'registrado com sucesso 👍' })
        }
    } catch (e) {
        res.render('callback', { callback: '🤒 internal server error: ' + e })
    }
})

function verifyNullInputs(req) {
    return !(req.body.username && req.body.password)
}

function verifyAccountExist(request) {
    return contas.find((account) => account.username === request.username || account.password === request.password)
}

setInterval(() => {
    updateMovement()
},1000/60)

function updateMovement() {
    allPlayers.forEach((player) => {
        if(player.person.up) {
            player.person.y-=player.person.speed
        } else if(player.person.down) {
            player.person.y+=player.person.speed
        }

        if(player.person.left) {
            player.person.x-=player.person.speed
        } else if(player.person.right) {
            player.person.x+=player.person.speed
        }
    })
}

function  getAllPersons() {
    let persons = []
    allPlayers.forEach(player => persons.push(player.person))
    return persons
}

http.listen(port, () => {
    console.log('server in online on port ' + port)
})

