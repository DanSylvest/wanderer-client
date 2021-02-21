import Vue from 'vue'
import App from './App.vue'
import Notifications from 'vue-notification'
import VueMaterial from 'vue-material'
import './css/main.scss'
import "./js/env/tools/standardTypeExtend"

import store from "./js/store";


Vue.use(VueMaterial);
Vue.use(Notifications)

Vue.config.productionTip = false

// eslint-disable-next-line no-undef
globalThis.vueApp = new Vue({
    store: store,
    render: h => h(App),
}).$mount('#app')


