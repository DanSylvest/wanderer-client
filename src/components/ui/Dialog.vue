<template>
    <md-dialog :md-active.sync="showModal" :md-click-outside-to-close="false" :md-close-on-esc="false">
        <md-dialog-title>{{localTitle}}</md-dialog-title>

        <md-dialog-content>
            {{localMessage}}
        </md-dialog-content>

        <md-dialog-actions>
<!--            <md-button class="md-primary" @click="showDialog = false">Close</md-button>-->
            <md-button class="md-primary" @click="onDialogClose">Close</md-button>
        </md-dialog-actions>
    </md-dialog>

</template>

<script>
    export default {
        name: "Dialog",
        props: {
            show: {
                type: Boolean,
                default: false
            },
            title: {
                type: String,
                default: ""
            },
            message: {
                type: String,
                default: ""
            },
            closeHandler: {
                type: Function,
                default: () => {}
            }
        },
        data: function () {
            return {
                showModal: this.show,
                localMessage: this.message,
                localTitle: this.title,
                onClose: this.closeHandler
            }
        },
        methods: {
            onDialogClose () {
                this.showModal = false;
                this.onClose();
            }
        },
        watch: {
            show (val) {
                this.showModal = val;
            },
            message (val) {
                this.localMessage = val;
            },
            title (val) {
                this.localTitle = val;
            },
            closeHandler (val) {
                this.onClose = val;
            }
        }
    }
</script>

<style scoped>

</style>