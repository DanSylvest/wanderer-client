<template>
    <div class="wd flex fs">
        <div class="dsc-left" ref="appLeftMenuRef">
            <slot name="AppLeftMenu"></slot>
        </div>
        <div class="dsc-right wd fs flex flex-column">
            <div class="dsc-toolbar">
                <slot name="AppToolbar"></slot>
            </div>
            <div class="wd fs overflow-hidden app-content padding-primary">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>

    export default {
        name: "App",
        components: {
            // Menu,
            // Toolbar
        },
        mounted() {
            // let el = this.$refs.appLeftMenuRef;

            // el.children.length

            // // eslint-disable-next-line no-debugger
            // debugger

            // this.$nextTick(()=>{
            //     // eslint-disable-next-line no-debugger
            //     debugger
            // })

        }
    }
</script>

<style scoped lang="scss">
    @import "src/css/variables";

    .wd {
        &.app-content {
            background-color: $bg-primary;
        }
    }
</style>