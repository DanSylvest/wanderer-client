
import Vue from 'vue'
import App from './App.vue'

import VueMaterial from 'vue-material'
import './css/main.scss'
import "./js/env/tools/standardTypeExtend"

Vue.use(VueMaterial)

Vue.config.productionTip = false

// eslint-disable-next-line no-undef
globalThis.vueApp = new Vue({
  render: h => h(App),
}).$mount('#app')
