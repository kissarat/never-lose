const textarea = document.querySelector('textarea')
const successButton = document.querySelector('.btn-primary')
const resetButton = document.querySelector('.btn-danger')
const successAlert = document.querySelector('.alert-success')

chrome.storage.sync.get('rules', function ({rules}) {
  if (!rules) {
    rules = [
      /^chrome:/,
      /^https?:..\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}/,
      /^https?:..[^\/]*localhost/,
      /^https?:..[^\/]*.local/,

      '\n# Your rules',
      /^https?:..[^\/]*aws.amazon.com/,
      /^https?:..[^\/]*apple.com/,
      /^https?:..[^\/]*bing.com/,
      /^https?:..[^\/]*evart[\w\-.]+com/,
      /^https?:..[^\/]*facebook.com\/(messages|games|livemap|onthisday|translations|editor|saved)\//,
      /^https?:..[^\/]*gmail.com/,
      /^https?:..[^\/]*google.(com|ua|ru)/,
      /^https?:..[^\/]*api.telegram.org/,
      /^https?:..[^\/]*vk.com\/(im|video|friends|feed|groups|edit|apps)(\?act=\w+)$/,
      /^https?:..[^\/]*wikipedia.org/,
      /^https?:..[^\/]*yahoo.com/,
      /^https?:..[^\/]*yandex.(ru|ua)/
    ]
      .map(s => 'string' == typeof s ? s : s.toString().slice(1, -1))
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
