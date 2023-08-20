import Vue from 'vue';
import App from './App.vue';
import Notifications from 'vue-notification'; /** https://www.npmjs.com/package/vue-notification */
import VueMaterial from 'vue-material';
import './css/main.scss';
import './js/env/tools/standardTypeExtend';

import store from './js/store';
import config from './js/compiled.config';

Vue.use(VueMaterial);
Vue.use(Notifications);

Vue.config.productionTip = false;

// eslint-disable-next-line no-undef
globalThis.vueApp = new Vue({
  store: store,
  render: h => h(App),
  methods: {
    showErrorModal ({ title, message, callback }) {
      window.vueApp.$children[0].showErrorModal({ title, message, callback });
    },
  },
}).$mount('#app');

setTimeout(() => {
  window.logging = config.logging || false;
}, 10);