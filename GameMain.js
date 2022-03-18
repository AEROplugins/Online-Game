const contas = require('./database').contas

class Player {
    constructor(nickname, account, person) {
        this.nickname = nickname,
        this.account = account,
        this.person = person
    }

    get getName() {
        return this.nickname
    }

    get getAccount() {
        return this.account
    }

    get getPerson() {
        return this.person
    }

}

class Person {
    constructor(x, y, speed, width, height) {
        this.x = x;
        this.y = y;
        this.speed = speed
        this.width = width
        this.height = height
        this.up = false,
        this.down = false,
        this.left = false,
        this.right = false
    }

    get getLocation() {
        return {
            x: this.x,
            y: this.y
        }
    }

    get getSpeed() {
        return this.speed
    }

    get getSize() {
        return {
            width: this.width,
            height: this.height,
        }
    }

}

const onlinePlayers = []
const offlinePlayers = []
const allPlayers = []

function createNewPlayer(account) {
    const newPerson = new Person(0,0,1,10,10)
    const newPlayer = new Player(account.nickname, account, newPerson)

    const havePlayerCreated = verifyAccountHavePlayer(account)

    if(havePlayerCreated) {
        return havePlayerCreated
    }

    allPlayers.push(newPlayer)
    return newPlayer
}

function verifyAccountHavePlayer(account) {
    const condicion = allPlayers.find((player) => {
        const playerAccount = player.account
        
        const condicionOne = playerAccount.username === account.username
        const condicionTwo = playerAccount.password === account.password

        if(condicionOne && condicionTwo) {
            return true
        } else {
            return false
        }
    })
}

function getPlayerAccount(account) {
    return allPlayers.find((player) => {
        const playerAccount = player.account
        
        const condicionOne = playerAccount.username === account.username
        const condicionTwo = playerAccount.password === account.password

        if(condicionOne && condicionTwo) {
            return true
        } else {
            return false
        }
    })
}

module.exports = {
    allPlayers,
    onlinePlayers,
    offlinePlayers,
    createNewPlayer,
    getPlayerAccount
}