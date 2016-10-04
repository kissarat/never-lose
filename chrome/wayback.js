const urls = {}

const excludes = [
  /^https?:..[^\/]*archive.org/,
  /^https?:..[^\/]*facebook.com/,
  /^https?:..[^\/]*google.(com|ua|ru)/,
  /^https?:..[^\/]*gmail.com/,
  /^https?:..[^\/]*vk.com/,
  /^https?:..[^\/]*yandex.(ru|ua)/,
  /^https?:..[^\/]*amazon.com/,
  /^https?:..[^\/]*wikipedia.org/,
  /^https?:..[^\/]*bing.com/,
  /^https?:..[^\/]*yahoo.com/,
  /^https?:..[^\/]*apple.com/,
  /^https?:..[^\/]*evart[\w\-.]+com/,
  /^https?:..\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}/,
]

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if ('complete' === changeInfo.status) {
    if (!urls[tab.url] && !excludes.some(rex => rex.test(tab.url))) {
      urls[tab.url] = {}
    }
  }
})

function request(url) {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', url)
  xhr.send(null)
  return xhr
}

function archive(url) {
  request('https://web.archive.org/save/' + url)
}

function closest() {
  const now = Math.round(Date.now()/1000) * 1000
  for (const url in urls) {
    const info = urls[url]
    if (!info.last) {
      info.last = now
      request('https://archive.org/wayback/available?url=' + url).addEventListener('load', function (e) {
        const snapshots = JSON.parse(e.target.responseText).archived_snapshots
        let closest
        if (snapshots.closest) {
          closest = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/.exec(snapshots.closest.timestamp)
          if (closest) {
            closest = new Date(+closest[1], +closest[2], +closest[3], +closest[4], +closest[5], +closest[6])
          }
          else {
            console.error('Invalid timestamp ' + snapshots.closest.timestamp)
          }
        }
        if (!closest || now - closest.getTime() > 3600 * 1000) {
          archive(url)
        }
      })
      return
    }
  }
}

setInterval(function () {
  setTimeout(closest, Math.random() * 800)
}, 1000)
