<template>
    <div>
        <md-dialog :md-active.sync="showDialog" @md-opened="onEditDialogOpened" @md-closed="onDialogClosed" class="wd-allowed-dialog">
            <md-dialog-title>{{header}}</md-dialog-title>

            <div style="padding: 20px; height: 70%" class="bs">
<!--                <md-table>-->
<!--                    <md-table-row>-->
<!--                        <md-table-head style="width: 150px">Character</md-table-head>-->
<!--                        <md-table-head style="width: 150px">Track</md-table-head>-->
<!--                    </md-table-row>-->

<!--                    <md-table-row v-for="item in characters" :key="item.id">-->
<!--                        <md-table-cell>{{item.name}}</md-table-cell>-->
<!--                        <md-table-cell>-->
<!--                            <md-switch v-model="item.track" class="md-primary"></md-switch>-->
<!--                        </md-table-cell>-->
<!--                    </md-table-row>-->
<!--                </md-table>-->

                <div class="wd-allowed-list" v-for="item in characters" :key="item.id">
                    <div class="wd-allowed-item wd flex flex-align-center relative">
                        <div>
                            <img class="md-icon" :src="'https://images.evetech.net/characters/' + item.id + '/portrait'" style="margin-right: 10px;" alt="Char portrait"/>
                        </div>
                        <div class="wd font-size-medium-large">{{item.name}}</div>
                        <div class="wd absolute right ">
                            <md-switch v-model="item.track" class="md-primary"></md-switch>
                        </div>
                    </div>
                </div>
            </div>

            <md-dialog-actions>
                <md-button class="md-primary md-accent" @click="showDialog = false">Close</md-button>
                <md-button
                        class="md-primary md-raised"
                        @click="onEditSubmit">Confirm</md-button>
            </md-dialog-actions>
        </md-dialog>
    </div>
</template>

<script>
    import CustomPromise from "../../../js/env/promise";
    import api from "../../../js/api";

    export default {
        name: "AllowedDialog",
        props: [

        ],
        data: function () {
            return {
                characters: [],
                header: "Set accounts tracking",
                showDialog: false
            }
        },
        mounted: function () {

        },
        methods: {
            show: function (_groupId) {
                this._showPromise = new CustomPromise();

                this._groupId = _groupId;
                this._loadCharacters(_groupId).then(function() {
                    this.showDialog = true;
// eslint-disable-next-line no-debugger
// debugger
                }.bind(this), function() {
                    this._showPromise.reject();
                }.bind(this));

                return this._showPromise.native;
            },
            close: function () {

            },
            _loadCharacters: function (_groupId) {
                let pr = new CustomPromise();

                api.eve.group.getAllowedCharacters(_groupId).then(function(_characters) {
                    this.characters = _characters;
                    pr.resolve();
                }.bind(this),function(_err) {
                    pr.reject(_err);
                }.bind(this));

                return pr.native;
            },
            // ========= EDITING DIALOG PART ===========
            onEditDialogOpened: function () {
                // this.validateEditForm();
            },
            onDialogClosed: function () {
                // this.clearForm();
            },
            onEditSubmit: function () {
                api.eve.group.updateAllowedCharacters(this._groupId, this.characters).then(function() {
                    this.showDialog = false;
                }.bind(this),function(_err) {
                    alert(_err);
                }.bind(this))
            }
        }
    }
</script>

<style lang="scss">
    @import "./src/css/variables";

    .wd-allowed-dialog {
        .md-switch {
            /*margin-bottom: 0;*/
            /*margin-top: 0;*/
        }

        .md-icon {
            border: 1px solid $border-color-primary-6;
            border-radius: 4px;
            height: 40px;
            width: 40px;
        }
    }
</style>

