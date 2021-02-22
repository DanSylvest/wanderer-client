<template>
    <div class="wd fs md-layout md-alignment-center-center">
        <component :is="innerPage"></component>
    </div>
</template>

<script>
    import asyncComponentLoader from "../asyncComponentLoader";
    import asyncScriptsLoader from "../asyncScriptsLoader";
    import modules from "../conf/modules";
    import RouterController from "./../js/router";
    import api from "../js/api";
    import cache from "../js/cache/cache.js";

    export default {
        name: "Router",
        props: {
            cPage: {
                type: String,
                default: ""
            }
        },
        data: function () {
            return {
                page: this.cPage,
                innerPage: ""
            }
        },
        mounted: function () {
            this.currentPage = this.page;
            this.update();

            api.init();
            api.on("ready", this.onReady.bind(this));
            api.on("closed", this.onClosed.bind(this));
        },
        watch: {
            cPage: function (_val) {
                this.currentPage = _val;
                this.update();
            }
        },
        methods: {
            onReady: function () {
                cache.init();

                this.router = new RouterController({
                    query: location.search
                });
                this.router.run().then(this.onRoute.bind(this));
            },
            // eslint-disable-next-line no-unused-vars
            onClosed (event) {
                setTimeout(() => {
                    window.vueApp.showErrorModal({
                        title: "Error",
                        message: "Connection with server has lost or client can't establish connection.",
                        callback : () => {
                            window.location = window.location.origin + window.location.pathname;
                        }
                    });
                }, 500);
            },
            onRoute: function (_data) {
                this.currentPage = _data.page;

                this.update();
            },
            update: function () {
                let info = modules[this.currentPage];
                if(info) {
                    if (info.isComponent) {
                        asyncComponentLoader(this.currentPage).then(() => {
                            this.innerPage = info.componentName;
                            this.$emit("ready");
                        })
                    } else {
                        asyncScriptsLoader(this.currentPage).then(() => {});
                    }
                }
            }
        }
    }
</script>

<style scoped>

</style>