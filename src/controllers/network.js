import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://localhost:4000',
  timeout: 1000,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  }
})


export default {
  getLobbyInfo() {
    return instance.get('/lobby')
  },
  getLobbies() {
    return instance.get('/lobby/games')
  },
  getLobby(code) {
    return instance.get(`/lobby/games?code=${code}`)
  },
  createLobby(publicLobby, user) {
    return instance.post('/lobby/create', {public: publicLobby, user})
  },
  getChessDefaults() {
    return instance.get('/lobby/default/chess')
  }
}