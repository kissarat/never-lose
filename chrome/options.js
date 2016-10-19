const textarea = document.querySelector('textarea')
const successButton = document.querySelector('.btn-primary')
const resetButton = document.querySelector('.btn-danger')
const successAlert = document.querySelector('.alert-success')

chrome.storage.sync.get('rules', function ({rules}) {
  if (!rules) {
    // [].map.call(document.querySelectorAll('[target=_blank]'), s => /^https?:\/\/(www\.)?([^\/]+)\/$/.exec(s.href)).filter(s => s).map(s => s[2]).sort().join(' ')
    porn = porn
      .split(/\s*\n\s*/g)
      .filter(s => s)
      .map(function (s) {
        s = s.replace(/\./g, '\\.')
        return `^https?:\\/\\/[\\w\\-\\.]+${s}\\/`
      })
    rules = [
      '# Special URLs',
      /^chrome:/,
      /^https?:..\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}/,
      /^https?:..[^\/]*localhost/,
      /^https?:..[^\/]*.local/,

      '\n# Well known sites',
      /^https?:..[^\/]*apple.com/,
      /^https?:..[^\/]*aws.amazon.com/,
      /^https?:..[^\/]*bing.com/,
      /^https?:..[^\/]*facebook.com\/(messages|games|livemap|onthisday|translations|editor|saved)\//,
      /^https?:..[^\/]*gmail.com/,
      /^https?:..[^\/]*google.([a-z]+)/,
      /^https?:..[^\/]*api.telegram.org/,
      /^https?:..[^\/]*vk.com\/(im|video|friends|feed|groups|edit|apps)(\?act=\w+)$/,
      /^https?:..[^\/]*wikipedia.org/,
      /^https?:..[^\/]*yahoo.com/,
      /^https?:..[^\/]*yandex.([a-z]+)/,
      '\n# Porn sites'
    ]
      .map(s => 'string' == typeof s ? s : s.toString().slice(1, -1))
      .concat(porn)
      .join('\n')
  }

  textarea.value = rules

  successButton.addEventListener('click', function () {
    chrome.storage.sync.set({rules: textarea.value}, function () {
      successAlert.style.display = 'block'
      setTimeout(function () {
        successAlert.style.display = 'none'
      }, 3000)
    })
  })
})

resetButton.addEventListener('click', function () {
  chrome.storage.sync.clear(function () {
    location.reload()
  })
})
