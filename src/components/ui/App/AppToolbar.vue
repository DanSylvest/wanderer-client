<template>
    <div class="wd f-width app-toolbar">
        <slot></slot>
    </div>
</template>

<script>
    export default {
        name: "AppToolbar"
    }
</script>

<style scoped lang="scss">
    @import "src/css/variables";

    .wd {
        &.app-toolbar {
            height: 40px;
            background-color: $bg-secondary;
            border-bottom: 1px solid $bg-3;
        }
    }
</style>