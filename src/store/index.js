// Import Vue + extensions
import Vue from 'vue';
import Vuex from 'vuex';

// Import store
import musicKit from './modules/musicKit';

// Initialize Vue extensions
Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    musicKit
  },
  strict: true
});
