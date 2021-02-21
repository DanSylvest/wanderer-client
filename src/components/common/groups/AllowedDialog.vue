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
                            <img class="md-icon" :src="'https://images.evetech.net/characters/' + item.id + '/portrait'" style="margin-right: 10px;" alt=""/>
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
                    @click="onEditSubmit"
                >Confirm</md-button>
            </md-dialog-actions>
        </md-dialog>
    </div>
</template>

<script>
    import CustomPromise from "../../../js/env/promise";
    import api from "../../../js/api";
    import helper from "../../../js/utils/helper.js";

    export default {
        name: "AllowedDialog",
        components: {},
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
                this._groupId = _groupId;
                this._loadCharacters(_groupId).then(() => this.showDialog = true);
            },
            close: function () {

            },
            _loadCharacters: function (_groupId) {
                let pr = new CustomPromise();

                api.eve.group.getAllowedCharacters(_groupId)
                    .then(
                        data => {
                            this.characters = data;
                            pr.resolve();
                        },
                        err => helper.errorHandler(this, err)
                    );

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
                api.eve.group.updateAllowedCharacters(this._groupId, this.characters)
                    .then(
                        () => this.showDialog = false,
                        err => helper.errorHandler(this, err)
                    )
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

