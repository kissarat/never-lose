const urls = {}
const queue = []
let last = Date.now()
const excludes = [
  /^chrome:/,
  /^https?:..\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}/,
  /^https?:..[^\/]*amazon.com/,
  /^https?:..[^\/]*apple.com/,
  /^https?:..[^\/]*archive.org/,
  /^https?:..[^\/]*bing.com/,
  /^https?:..[^\/]*evart[\w\-.]+com/,
  /^https?:..[^\/]*facebook.com/,
  /^https?:..[^\/]*gmail.com/,
  /^https?:..[^\/]*google.(com|ua|ru)/,
  /^https?:..[^\/]*vk.com/,
  /^https?:..[^\/]*wikipedia.org/,
  /^https?:..[^\/]*yahoo.com/,
  /^https?:..[^\/]*yandex.(ru|ua)/
]

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
  url = url.split('#')
  return new Promise(function (resolve, reject) {
    let info = urls[url]
    if (!info) {
      urls[url] = info = {
        url: url,
        start: Date.now()
      }
    }
    if (excludes.some(rex => rex.test(url))) {
      reject()
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
    .catch(function () {
      chrome.tabs.create({url: 'https://web.archive.org/web/*/' + info.url})
    })
})

chrome.webRequest.onHeadersReceived.addListener(function (res) {
    if ('main_frame' === res.type && 'GET' === res.method) {
      find(res.url).then(function (info) {
        save(_.extendKeys(info, res, 'statusCode', 'url'))
      })
    }
  },
  {urls: ["<all_urls>"]}
)
