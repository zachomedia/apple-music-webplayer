// Import Vue + extensions
import Vue from 'vue';
import App from './App.vue';

// Load Font Awesome
import 'font-awesome/css/font-awesome.css';

// Vue.js 2 filters
// (note use src since dist includes eval() calls, which breaks CSP)
import Vue2Filters from 'vue2-filters/src';

// Vue Moment
import VueMoment from 'vue-moment';

// Bootstrap
import BootstrapVue from 'bootstrap-vue';

// Vue router
import VueRouter from 'vue-router';

// Load Vuex store
import store from './store';

// Raven
import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';

// Private config
import privateConfig from './private';

Vue.use(Vue2Filters);
Vue.use(VueMoment);
Vue.use(BootstrapVue);
Vue.use(VueRouter);

// Configure Sentry
if (privateConfig.sentry) {
  Raven
    .config(privateConfig.sentry)
    .addPlugin(RavenVue, Vue)
    .install();
}

// Handle init
if (MusicKit) {
  store.dispatch('musicKit/init');
} else {
  document.addEventListener('musickitloaded', () => {
    store.dispatch('musicKit/init');
  });
}

new Vue({
  store,
  render: h => h(App),
  mixins: [Vue2Filters.mixin]
}).$mount('#app');
