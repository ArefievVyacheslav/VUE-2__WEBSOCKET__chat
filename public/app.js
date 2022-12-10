const socket = io()

Vue.component('chat-message', {
  props: [ 'message', 'user' ],
  template: `
      <div class="message" :class="{ 'owner': message.id === user.id }">
        <div class="message-content z-depth-1">{{ message.name }}: {{ message.message }}</div>
      </div>
`
})

new Vue({
  el: '#app',
  data () {
    return {
      message: null,
      messages: [],
      users: [],
      user: {}
    }
  },
  methods: {
    sendMessage () {
      const message = { name: this.user.name, text: this.message, id: this.user.id }
      socket.emit('message:create', message, err => {
        if (err) console.log(err)
        else this.message = ''
      })
    },
    scrollToBottom (node) {
      setTimeout(() => node.scrollTop = node.scrollHeight)
    },
    initializeConnection () {
      socket.on('users:update', users => this.users = [ ...users ])
      socket.on('message:new', message => {
        this.messages.push(message)
        this.scrollToBottom(this.$refs.messages)
      })
    }
  },
  created () {
    const params = window.location.search.split('&')
    const name = params[ 0 ].split('=')[ 1 ]
    const room = params[ 1 ].split('=')[ 1 ]
    this.user = { name, room }
  },
  mounted () {
    socket.emit('join', this.user, data => {
      if (typeof data === 'string') console.log(data)
      else {
        this.user.id = data.userId
        this.initializeConnection()
      }
    })
  }
})
