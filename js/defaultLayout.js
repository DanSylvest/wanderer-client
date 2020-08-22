/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/11/20.
 */

var template = `
<div class="md-layout md-alignment-center-center fs">
    <div class="md-layout-item md-size-5">
        <md-progress-spinner :md-diameter="100" :md-stroke="10" md-mode="indeterminate"></md-progress-spinner>
    </div>
</div>`;


Vue.use(VueMaterial.default);


window.app = new Vue({
    el: '#vuePort',
    data: {
        currentView: ""
    },
    mounted: function () {

    },
    methods: {

    }
});

Vue.component("lol", {
    props: [
    ],
    data: function () {
        return {

        }
    },
    template: template,
    mounted: function () {

    },
    methods: {
    }
});

app.currentView = "lol";
