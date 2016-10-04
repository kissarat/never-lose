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

function random(min, max) {
  return Math.round(min + Math.random() * (max - min))
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if ('complete' === changeInfo.status) {
    if (!urls[tab.url] && !excludes.some(rex => rex.test(tab.url))) {
      urls[tab.url] = {start: Date.now()}
      const url = tab.url.split('#')
      setTimeout(closest, random(50, 500), url[0])
    }
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
    request('POST', 'https://web.archive.org/save/' + url)
    last = now
  }
  else {
    queue.push(url)
    setTimeout(() => archive(queue.unshift()), random(50, 500), url)
  }
}

function closest(url) {
  request('GET', 'https://archive.org/wayback/available?url=' + url).addEventListener('load', function (e) {
    const snapshots = JSON.parse(e.target.responseText).archived_snapshots
    let closest
    if (snapshots.closest) {
      closest = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/.exec(snapshots.closest.timestamp)
      if (closest) {
        closest = Date.UTC(+closest[1], closest[2] - 1, +closest[3], +closest[4], +closest[5], +closest[6])
      }
      else {
        console.error('Invalid timestamp ' + snapshots.closest.timestamp)
      }
    }
    const delta = closest ? (Date.now() - closest) / 1000 : Number.MAX_VALUE
    if (delta > 3600) {
      archive(url)
    }
  })
}
