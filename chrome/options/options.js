const ui = {
  textarea: 'textarea',
  success: '.alert-success',
  warning: '.alert-warning',
  danger: '.alert-danger'
}

for(const name in ui) {
  ui[name] = document.querySelector(ui[name])
}

function bootstrapAlert(type, text, timeout) {
  const alert = ui[type]
  alert.innerHTML = text || ''
  alert.style.display = text ? 'block' : ' none'
  if (timeout) {
    if (alert.tid) {
      clearTimeout(alert.tid)
    }
    alert.tid = setTimeout(function () {
      alert.style.display = 'none'
    }, timeout * 1000)
  }
}

bootstrapAlert('warning', 'Loading...')

function domainToRegex(domain) {
  domain = domain
    .replace('www.', '')
  let regex = domain.replace(/\./g, '\\.')
  regex = `^https?:\\/\\/[\\w\\-\\.]+${regex}\\/`
  return {domain, regex}
}

const buttons = {
  save: function () {
    const rules =
      _.uniq(ui.textarea.value.split(/\s*\n\s*/))
        .map(s => '#' === s[0] ? '\n' + s : s)
        .join('\n')

    chrome.storage.sync.set({rules}, function () {
      bootstrapAlert('success', 'Success', 30)
    })
  },

  reset: function () {
    chrome.storage.sync.clear(function () {
      location.reload()
    })
  },

  'add-domain': function () {
    let url = prompt('Enter URL')
    if (!url) {
      bootstrapAlert('danger', 'No URL', 10)
      return
    }
    const match = /^((ht|f)tps?:\/\/)?([^\/]+)/.exec(url)
    if (match) {
      const {regex, domain} = domainToRegex(match[3])
      let comment = ` # ${domain}\n`
      if ('#' === ui.textarea.value[0]) {
        comment += '\n'
      }
      ui.textarea.value = regex + comment + ui.textarea.value
    }
    else {
      bootstrapAlert('danger', 'Invalid URL ' + url, 5)
    }
  }
}

chrome.storage.sync.get('rules', function ({rules}) {
  if (!rules) {
    // [].map.call(document.querySelectorAll('[target=_blank]'), s => /^https?:\/\/(www\.)?([^\/]+)\/$/.exec(s.href))
    // .filter(s => s).map(s => s[2]).sort().join(' ')
    porn = porn
      .split(/\s*\n\s*/g)
      .filter(s => s && s.trim())
      .map((s) => domainToRegex(s).regex)
    rules = [
      '# Special URLs',
      /^chrome:/,
      /^https?:..\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}/,
      /^https?:..[^\/]*localhost/,
      /^https?:..[^\/]*\.local/,

      '\n# Well known sites',
      /^https?:..[^\/]*apple\.com/,
      /^https?:..[^\/]*aws\.amazon\.com/,
      /^https?:..[^\/]*bing\.com/,
      /^https?:..[^\/]*facebook.com\/(messages|games|livemap|onthisday|translations|editor|saved)\//,
      /^https?:..[^\/]*gmail\.com/,
      /^https?:..[^\/]*google(\.com)?\.([a-z]+)/,
      /^https?:..[^\/]*api\.telegram\.org/,
      /^https?:..[^\/]*vk\.com\/(im|video|friends|feed|groups|edit|apps)(\?act=\w+)$/,
      /^https?:..[^\/]*yahoo\.com/,
      /^https?:..[^\/]*yandex\.([a-z]+)/,
      '\n# Porn sites'
    ]
      .map(s => 'string' == typeof s ? s : s.toString().slice(1, -1))
      .concat(porn)
      .join('\n')
  }

  ui.textarea.value = rules
  if ('function' === typeof ui.textarea.setSelectionRange) {
    ui.textarea.setSelectionRange(0, 0)
  }
  ui.textarea.focus()

  for (const name in buttons) {
    document
      .getElementById(name)
      .addEventListener('click', buttons[name])
  }

  bootstrapAlert('warning')
})
