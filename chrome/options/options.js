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
  regex = `^https?:\\/{2}([^\\/]+\\.)?${regex}\\/`
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

// [].map.call(document.querySelectorAll('[target=_blank]'), s => /^https?:\/\/(www\.)?([^\/]+)\/$/.exec(s.href)).filter(s => s).map(s => s[2]).sort().join(' ')
function processDomainList(list) {
  if ('string' === typeof list) {
    list = list.split(/\s*\n\s*/g)
  }
  return list
    .map(s => s.trim())
    .map((s) => s && s.indexOf('#') < 0 ? domainToRegex(s).regex : s)
}

chrome.storage.sync.get('rules', function ({rules}) {
  if (!rules) {
    rules = [
      '# Special URLs',
      /^chrome(-extension)?:/,
      /^https?:\/{2}\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}/,
      /^https?:\/{2}[^\/]*localhost/,
      /^https?:\/{2}[^\/]*\.local/,

      '\n# Well known sites',
      /^https?:\/{2}[^\/]*facebook\.com\/(messages|games|livemap|onthisday|translations|editor|saved)\//,
      /^https?:\/{2}[^\/]*google(\.com)?\.([a-z]+)/,
      /^https?:\/{2}[^\/]*(google|yahoo)(\.co)\.([a-z]{2})/,
      /^https?:\/{2}[^\/]*vk\.com\/(im|video|friends|feed|groups|edit|apps)(\?act=\w+)$/,
      /^https?:\/{2}[^\/]*yandex\.([a-z]+)/,
      /^https?:\/{2}t\.co\//,
      /^https?:\/{2}[gt]mail\.com\//,
      /^https?:\/{2}(web|api)\.telegram\.org\//
    ]
      .map(s => 'string' == typeof s ? s : s.toString().slice(1, -1))
      .concat(processDomainList(well_known))
      .concat(processDomainList(advertise))
      .concat(processDomainList(porn))
      .join('\n')
  }

  ui.textarea.value = rules.replace(/\n\n\n/g, '\n\n')
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
