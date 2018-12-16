// Import Vue + extensions
import Vue from 'vue';
import App from './App.vue';

// Load Font Awesome
import 'font-awesome/css/font-awesome.css';

// Vue.js 2 filters
import Vue2Filters from 'vue2-filters';

// Vue Moment
import VueMoment from 'vue-moment';

// Bootstrap
import BootstrapVue from 'bootstrap-vue';

// Vue router
import VueRouter from 'vue-router';

// Load Vuex store
import store from './store';

Vue.use(Vue2Filters);
Vue.use(VueMoment);
Vue.use(BootstrapVue);
Vue.use(VueRouter);

// Handle init
if (window.MusicKit) {
  store.dispatch('musicKit/init');
} else {
  document.addEventListener('musickitloaded', () => {
    store.dispatch('musicKit/init');
  });
}

new Vue({
  store,
  render: h => h(App)
}).$mount('#app');
