function view(id, options) {
  options.template = document.getElementById('view-' + id).innerHTML
  return Vue.component(id, options)
}

Vue.prototype.toJSON = function () {
  return _.pick(this, Object.keys(this.$data))
}

function buildURL(options, uri, params) {
  let url = options.origin
  url += options.token ? `/serve/~${options.token}/` : '/serve/'
  url += uri
  if (!_.isEmpty(params)) {
    const array = []
    for(const key in params) {
      array.push(key + '=' + params[key])
    }
    url += '?' + array.join('&')
  }
  return url
}

async function api(method, uri, params, body) {
  const options = {
    mode: 'cors',
    method,
    headers: {
      accept: 'application/json'
    }
  }
  if (body) {
    options.body = JSON.stringify(body)
    options.headers['content-type'] = 'application/json'
  }
  const r = await fetch(buildURL(localStorage, uri, params), options)
  return r.json()
}

async function handshake(options = localStorage) {
  const r = await fetch(buildURL(options, 'token/handshake'), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json'
    },
    body: JSON.stringify({
      expires: "2030-01-01T00:00:00.000Z",
      name: navigator.userAgent,
      type: 'app'
    })
  })
  const config = await r.json()
  if (config.token) {
    localStorage.token = config.token.id
  }
  return config
}

function communicate(options) {
  if (!localStorage.token) {
    return handshake(options)
  }
}
