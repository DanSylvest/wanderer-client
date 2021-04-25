<template>
    <div class="wd-table-cell wd fs"
         @click="$emit('clicked', $event)"
         @contextmenu="$emit('context', $event)"
    >
        <div class="wd-table-cell__content wd fs" :style="'justify-content: ' + alignment">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    export default {
        name: "TableCell",
        props: {
            id: {
                type: String,
                default: ""
            },
            alignment: {
                type: String,
                default: "center"
            }
        },
        data: function () {
            return {
                lId: this.id
            }
        },
        watch: {
            id (val) {
                this.lId = val;
            }
        },
        computed: {

        },
        mounted() {

        }
    }
</script>

<style lang="scss">

</style>