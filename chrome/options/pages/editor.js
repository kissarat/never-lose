const Editor = view('editor', {
  data() {
    return {
      name: 'Regex',
      text: ''
    }
  },

  created() {
    if (+localStorage.article) {
      this.load()
    }
  },

  methods: {
    async submit() {
      const data = this.toJSON()
      data.type = 'note'
      const {success, article} = await api('POST', 'article/save', _.pick(localStorage, 'id'), data)
      if (success) {
        localStorage.article = article.id
        chrome.storage.local.set({rules: article.text})
      }
    },

    async load() {
      const {article} = await api('GET', 'article/get', {id: +localStorage.article})
      if (article) {
        this.text = article.text
        chrome.storage.local.set({rules: article.text})
      }
    }
  }
})
