const NotFound = {template: '<p>Page not found</p>'}
const About = {template: '<p>about page</p>'}

function map(object, cb) {
  const array = []
  for (const key in object) {
    array.push(cb(object[key], key))
  }
  return array
}

const router = new VueRouter({
  routes: map({
      '/': Editor,
      '/about': About,
      '/login': Login,
      '*': NotFound,
    },
    (component, path) => ({path, component})
  )
})

const app = new Vue({
  router
})
  .$mount('#app')
