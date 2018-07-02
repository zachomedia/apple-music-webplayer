import Vue from 'vue';
import App from './App.vue';

import BootstrapVue from 'bootstrap-vue';

Vue.config.productionTip = false

// Load Bootstrap
Vue.use(BootstrapVue);

// Load Font Awesome
import 'font-awesome/css/font-awesome.css';

// Vue.js 2 filters
import Vue2Filters from 'vue2-filters';
Vue.use(Vue2Filters)

// Local storage
import VueLocalStorage from 'vue-localstorage';
Vue.use(VueLocalStorage);

// Vue router
import VueRouter from 'vue-router';
Vue.use(VueRouter);

new Vue({
  render: h => h(App)
}).$mount('#app')
