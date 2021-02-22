<template>
    <div id="app" class="wd fs fms">
        <transition name="loader-fade">
            <div class="wd fs fms wd-full-min-size md-layout flex-column" v-if="isShowMainLoader">
                <MainLoader></MainLoader>
                <Copyright class="c-copyright"></Copyright>
            </div>
        </transition>
        <transition name="page-anim">
            <div class="wd fs fms" v-show="!isShowMainLoader">
                <Router @ready="onRouterReady"></Router>
            </div>
        </transition>

        <notifications group="mainNotifications" position="bottom right"/>

        <Dialog :show="globalDialog.show" :title="globalDialog.title" :message="globalDialog.message" :close-handler="globalDialog.callback" />
    </div>
</template>

<script>
    import MainLoader from './components/ui/MainLoader.vue'
    import Copyright from "./components/ui/Copyright";
    import Router from "./components/Router";
    import Dialog from "./components/ui/Dialog.vue";

    export default {
        name: 'App',
        components: {
            Router,
            Copyright,
            MainLoader,
            Dialog
        },
        mounted: function () {

        },
        methods: {
            onRouterReady: function (/*_data*/) {
                setTimeout(() => {
                    this.isShowMainLoader = false;
                }, 1000);
            },
            showErrorModal ({title, message, callback}) {
                this.globalDialog.show = true;
                this.globalDialog.title = title;
                this.globalDialog.message = message;
                this.globalDialog.callback = callback;
            }
        },
        data: function() {
            return {
                // eslint-disable-next-line vue/require-prop-type-constructor
                isShowMainLoader: true,
                routerPage: "",

                globalDialog: {
                    show: false,
                    message: "kek",
                    callback: () => {}
                }
            };
        }
    }
</script>

<style lang="scss">
    #app {
        overflow: hidden;
    }

    .loader-fade-leave-active {
        transition: opacity .5s, transform 500ms;
        transform: scale(1, 1);

        .c-copyright {
            opacity: 0;
        }
    }
    .loader-fade-leave-to {
        opacity: 0;
        transform: scale(.5, .5);
    }

    .page-anim-enter-active {
        transition: opacity 1200ms, transform 500ms;
        transform: scale(.8, .8);
        opacity: 0;
    }

    .page-anim-enter-active {
        opacity: 0.1;
    }

    .page-anim-enter-to {
        opacity: 1;
        transform: scale(1, 1);
        .c-copyright {
            opacity: 1;
        }
    }

</style>
