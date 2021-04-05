<template>
    <div class="wd-table-cell wd fs">
        <div class="wd-table-cell__content wd fs">
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
        mounted() {

        }
    }
</script>

<style scoped>

</style>