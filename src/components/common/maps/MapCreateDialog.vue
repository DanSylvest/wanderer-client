<template>
    <div>
        <md-dialog
            :md-active.sync="showEditDialog"
            class="wd-medium-dialog"
            :md-click-outside-to-close="false"
            @md-clicked-outside="onClickedOutside"
            @md-closed='$emit("update:show", false)'
        >
            <map-editor @success="onEditSuccess" class="wd-group-tabs" />
        </md-dialog>

        <md-dialog-confirm
            :md-active.sync="showCancelDialog"
            md-title="Are you sure want to leave creating dialog?"
            md-content="All progress will lost!"
            md-confirm-text="Close"
            md-cancel-text="Back"
            @md-confirm='$emit("update:show", false)'
        />
    </div>
</template>

<script>
    import MapEditor from "./MapEditor.vue";

    export default {
        name: "MapCreateDialog",
        components: {MapEditor},
        props: {
            show : {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                showEditDialog: false,
                showCancelDialog: false
            }
        },
        watch : {
            show (val) {
                this.showEditDialog = val;
            }
        },
        methods: {
            onEditSuccess (event) {
                this.$emit("update:show", false);
                this.$emit("success", event);
            },
            onClickedOutside () {
                this.showCancelDialog = true;
            }
        }
    }
</script>

<style lang="scss">
    .wd-group-tabs {
        .wd-ui-tabs {
            .wd-ui-tabs__content {
                width: 700px;
                height: 350px;
            }
        }
    }
</style>