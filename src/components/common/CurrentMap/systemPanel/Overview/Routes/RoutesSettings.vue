<template>
    <div class="wd off-user-select" >
        <md-dialog :md-active.sync="showEditDialog" @md-opened="onEditDialogOpened" @md-closed="onDialogClosed" class="wd-medium-dialog">
            <md-dialog-title>Filtering and setting routes</md-dialog-title>

            <div class="wd box-sizing wd-routes-dialog wd-dialog-content off-user-select">
                <md-field>
                    <label>Select a path type</label>
                    <md-select v-model="lSettings.pathType" name="movie" id="movie">
                        <md-option value="shortest">Shortest</md-option>
                        <md-option value="secure">Secure</md-option>
                        <md-option value="insecure">Insecure</md-option>
                    </md-select>
                </md-field>

                <md-switch v-model="lSettings.includeMassCrit">Include critical mass chains</md-switch>
                <md-switch v-model="lSettings.includeEol">Include EOL chains</md-switch>
                <md-switch v-model="lSettings.includeFrig">Include Frigate chains</md-switch>
                <md-switch v-model="lSettings.includeCruise">Include Cruise chains</md-switch>
                <md-switch v-model="lSettings.avoidWormholes">Avoid Wormholes region</md-switch>
                <md-switch v-model="lSettings.avoidPochven">Avoid Pochven region</md-switch>
                <md-switch v-model="lSettings.avoidEdencom">Avoid Edencom systems</md-switch>
                <md-switch v-model="lSettings.avoidTriglavian">Avoid Triglavian systems</md-switch>
                <md-switch v-model="lSettings.includeThera">Include Thera chains</md-switch>
            </div>

            <md-dialog-actions>
                <md-button class="md-primary md-accent" @click="close">Close</md-button>
                <md-button class="md-primary md-raised" @click="onEditSubmit">Confirm</md-button>
            </md-dialog-actions>
        </md-dialog>
    </div>
</template>

<script>
    import environment from "../../../../../../js/core/map/environment.js";

    export default {
        name: "MapsEditDialogSimple",
        props: {
            activated: {
                type: Boolean,
                default: false
            },
            settings: {
                type: Object,
                default: () => ({...environment.defaultRouteSettings})
            }
        },
        data: function () {
            return {
                showEditDialog: this.activated,
                lSettings : this.settings
            }
        },
        mounted: function () {
        },
        beforeDestroy() {
        },
        watch: {
            activated: function (val) {
                this.showEditDialog = val;
            },
            settings (val) {
                this.lSettings = val;
            }
        },
        methods: {
            close: function () {
                this.$emit("update:activated", false);
            },

            // ========= EDITING DIALOG PART ===========
            onEditDialogOpened: function () {

            },
            onDialogClosed: function () {
                this.close();
            },
            onEditSubmit: function () {
                this.$emit("edited", {...this.settings});
            },
        }
    }
</script>

<style lang="scss">
    @import "./src/css/variables";

    .wd-medium-dialog {
        .md-dialog-title {
            padding: 20px 20px 0;
        }

        .wd-routes-dialog {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }

        .wd-dialog-content {
            height: 70%;
            padding-left: 30px;
            padding-right: 30px;
            width: 350px;


            .md-autocomplete.md-field {
                margin: 0;
            }

            .groups-table {
                height: 400px;

                &.md-card.md-table,
                &.md-table.md-theme-default .md-table-content,
                &.md-table.md-theme-default .md-table-alternate-header {
                    background-color: $bg-secondary;
                }
            }
        }
    }
</style>