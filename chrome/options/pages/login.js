const Login = view('login', {
  // props: ['email', 'password'],
  data() {
    return {
      // origin: 'http://ves' + 'ela.soft' + 'room.pro',
      origin: 'https://my.goldenlife.me',
      email: '',
      password: ''
    }
  },

  methods: {
    async submit() {
      const data = this.toJSON()
      await communicate({origin: data.origin})
      localStorage.origin = data.origin
      const {success} = await api('POST', 'user/login', null, data)
      if (success) {
        router.push('/')
      }
    }
  }
})
