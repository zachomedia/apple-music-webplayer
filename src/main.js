import Vue from 'vue'
import App from './App.vue'

import BootstrapVue from 'bootstrap-vue'

Vue.config.productionTip = false

// Load Bootstrap
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
Vue.use(BootstrapVue);

// Load Font Awesome
import 'font-awesome/css/font-awesome.css'

// Vue.js 2 filters
import Vue2Filters from 'vue2-filters'
Vue.use(Vue2Filters)

new Vue({
  render: h => h(App)
}).$mount('#app')
