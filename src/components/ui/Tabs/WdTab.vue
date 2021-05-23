<template>
    <div class="wd-ui-tab wd fs">
        <transition name="fade-fast" @after-enter="onAfterShow" @after-leave="onAfterHide">
            <div v-if="lShow" class="wd fs">
                <slot />
            </div>
        </transition>
    </div>
</template>

<script>
    import CustomPromise from "../../../js/env/promise.js";
    export default {
        name: "WdTab",
        props: {
            wdLabel: {
                type: String,
                default: ""
            }
        },
        data : function () {
            return {
                lShow: false,
                label: this.wdLabel
            }
        },
        methods: {
            hide () {
                if(this._lastPromise)
                    this._lastPromise.native.cancel();

                this._lastPromise = new CustomPromise();
                this.lShow = false;
                return this._lastPromise.native;
            },
            show () {
                if(this._lastPromise)
                    this._lastPromise.native.cancel();

                this._lastPromise = new CustomPromise();
                this.lShow = true;
                return this._lastPromise.native;
            },
            onAfterShow () {
                // this.$emit("after-show");
                this._lastPromise.resolve();
            },
            onAfterHide () {
                // this.$emit("after-hide");
                this._lastPromise.resolve();
            }
        }
    }
</script>

<style scoped lang="scss">
    .wd-ui-tab {

    }
</style>