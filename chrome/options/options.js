const NotFound = {template: '<p>Page not found</p>'}
const Home = {template: '<p>home page</p>'}
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
      '/': Home,
      '/about': About,
      '*': NotFound
    },
    (component, path) => ({path, component})
  )
})

const app = new Vue({
  router
})
  .$mount('#app')
