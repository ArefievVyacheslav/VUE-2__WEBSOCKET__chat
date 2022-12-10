class Users {
  constructor () {
    this.users = []
  }
  get(id) {
    return this.users.find(user => user.id === id)
  }
  add (id, name, room) {
    this.users.push({ id, name, room })
  }
  remove(id) {
    this.users.filter(user => user.id !== id)
    return this.users.find(user => user.id === id)
  }
  getByRoom(room) {
    return this.users.filter(user => user.room === room)
  }
}

module.exports = function () {
  return new Users()
}
