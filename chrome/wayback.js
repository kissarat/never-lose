const urls = {}
const queue = []
let last = Date.now()

let excludes = []

const _ = {
  random(min, max) {
    return Math.round(min + Math.random() * (max - min))
  },

  extendKeys(target, source, ...keys) {
    keys.forEach(function (key) {
      target[key] = source[key]
    })
    return target
  }
}

function find(url) {
  if (url && url.split) {
    url = url.split('#')[0]
  }
  else {
    if (url) {
      console.error(url)
    }
    throw new Error('invalid url')
  }
  return new Promise(function (resolve, reject) {
    let info = urls[url]
    if (!info) {
      urls[url] = info = {
        url: url,
        start: Date.now()
      }
    }
    if (excludes.some(rex => rex.test(url))) {
      reject({
        excluded: true,
        url: url
      })
    }
    else {
      resolve(info)
    }
  })
}

function save(info) {
  return new Promise(function (resolve) {
    urls[info.url] = info
    resolve(info)
  })
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if ('complete' === changeInfo.status) {
    find(tab.url).then(function (info) {
      if (!info.archived) {
        setTimeout(archiveClosest, _.random(50, 500), info.url)
      }
    })
  }
})

function request(method, url) {
  const xhr = new XMLHttpRequest()
  xhr.open(method, url)
  xhr.send(null)
  return xhr
}

function archive(url) {
  const now = Date.now()
  if (now - last > 500) {
    request('POST', 'https://web.archive.org/save/' + url).addEventListener('load', function () {
      find(url).then(function (info) {
        info.archived = Date.now()
        save(info)
      })
    })
    last = now
  }
  else {
    queue.push(url)
    setTimeout(() => archive(queue.unshift()), _.random(50, 500), url)
  }
}

function requestClosest(url) {
  return find(url)
    .then(function (info) {
      return new Promise(function (resolve, reject) {
        if (info && info.closest) {
          resolve(info)
        }
        else if (200 === info.statusCode) {
          const xhr = request('GET', 'https://archive.org/wayback/available?url=' + info.url)
          xhr.addEventListener('load', function (e) {
            try {
              const snapshots = JSON.parse(e.target.responseText).archived_snapshots
              info.closest = snapshots.closest
              save(info).then(resolve)
            }
            catch (ex) {
              reject(ex)
            }
          });
          xhr.addEventListener('error', reject)
        }
      })
    })
}

function archiveClosest(url) {
  requestClosest(url).then(function (info) {
    if (info.closest) {
      var t = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/.exec(info.closest.timestamp)
      if (t) {
        t = Date.UTC(+t[1], t[2] - 1, +t[3], +t[4], +t[5], +t[6])
        const delta = Date.now() - t
        if (delta > 3600 * 1000) {
          archive(info.url)
        }
      }
      else {
        console.error('Invalid timestamp ' + t)
      }
    }
    else if (200 === info.statusCode) {
      archive(info.url)
    }
  })
}

chrome.browserAction.onClicked.addListener(function (tab) {
  requestClosest(tab.url)
    .then(function (info) {
      if (info.closest) {
        chrome.tabs.create({url: info.closest.url})
      }
      else {
        chrome.tabs.create({url: 'https://web.archive.org/web/*/' + info.url})
      }
    })
    .catch(function (err) {
      if (err.excluded) {
        alert(`The url ${err.url} is in excluded list`)
      }
      else {
        chrome.tabs.create({url: 'https://web.archive.org/web/*/' + info.url})
      }
    })
})

function loadRules() {
  chrome.storage.local.get('rules', function ({rules}) {
    rules = rules ? rules.split('\n') : []
    excludes = [
      /^https?:\/{2}[^\/]*archive\.org/,
      /^https?:\/{2}[^\/]*archive\.is/,
      /(kissarat|11351378)/
    ]
    rules
      .map(function (s) {
        const m = /^(.*)\s+#(.*)$/.exec(s)
        return m ? m[1] : s
      })
      .filter(s => s.trim())
      .forEach(function (rule) {
        excludes.push(new RegExp(rule))
      })
  })
}

chrome.storage.onChanged.addListener(loadRules)

chrome.webRequest.onHeadersReceived.addListener(function (res) {
    if ('main_frame' === res.type && 'GET' === res.method) {
      find(res.url).then(function (info) {
        save(_.extendKeys(info, res, 'statusCode'))
      })
    }
  },
  {urls: ["<all_urls>"]}
)

loadRules()