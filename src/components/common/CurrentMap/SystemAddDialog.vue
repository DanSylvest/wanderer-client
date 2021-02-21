<template>
    <div class="wd off-user-select" >
        <md-dialog :md-active.sync="showEditDialog" @md-opened="onEditDialogOpened" @md-closed="onDialogClosed" class="wd-medium-dialog">
            <md-dialog-title>Add system</md-dialog-title>

            <div class="wd box-sizing wd-dialog-content off-user-select">
                <md-field md-clearable>
                    <md-autocomplete
                            v-model="selectedValue"
                            :md-options="systems"
                            md-options-id="solarSystemName"
                            md-layout="box"
                            @md-selected="onACSelected($event)"
                            @md-changed="onACChanged"
                            @md-opened="onACOpened"
                            md-dense
                            ref="searchField"
                    >

                        <label><md-icon>search</md-icon>Select a character</label>

                        <template slot="md-autocomplete-item" slot-scope="{ item, term }">
                            <div class="wd-char-item wd flex flex-align-center font-size-medium">
                                <div :class="getClassBySystemData(item)">{{item.typeName}}</div>
                                <md-highlight-text :md-fuzzy-search="false" :md-term="term">{{ item.solarSystemName }}</md-highlight-text>
                                <div class="constellation-name">{{item.constellationName}}</div>
                                <div class="region-name">{{item.regionName}}</div>
                            </div>
                        </template>

                        <template slot="md-autocomplete-empty" slot-scope="{ term }">
                            System {{ term }} was not found!
                        </template>
                    </md-autocomplete>
                    <span class="wd-hint md-helper-text">* Start search system. You should type at least 2 symbols.</span>
                </md-field>
            </div>

            <md-dialog-actions>
                <md-button class="md-primary md-accent" @click="close">Close</md-button>
                <md-button
                        class="md-primary md-raised"
                        @click="onEditSubmit"
                        :disabled="formButtonDisabled">Confirm</md-button>
            </md-dialog-actions>
        </md-dialog>
    </div>
</template>

<script>
    import CustomPromise from "../../../js/env/promise";
    import api from "../../../js/api";
    import SpamFilter from "../../../js/env/spamFilter.js";
    import environment from "../../../js/core/map/environment.js";
    import helper from "../../../js/utils/helper.js";

    export default {
        name: "MapsEditDialogSimple",
        props: {
            activated: {
                type: Boolean,
                default: false
            },
        },
        data: function () {
            return {

                systems: [],
                currentSystem: "",
                selectedValue: "",
                showEditDialog: this.activated,
                formButtonDisabled: true,
            }
        },
        mounted: function () {
            this._selectLock = false;
            this.selectedItem = null;
            this.searchMatch = "";
            this._passChange = false;
            this._spamFilter = new SpamFilter(this._makeSearch.bind(this), 500);
        },
        beforeDestroy() {
            this._otid !== -1 && clearTimeout(this._otid);
            this._otid = -1;
        },
        watch: {
            activated: function (val) {
                this.showEditDialog = val;
            }
        },
        methods: {
            close: function () {
                this._otid !== -1 && clearTimeout(this._otid);
                this._otid = -1;

                this.selectedValue = "";
                this.selectedItem = null;
                this.systems = [];
                this.formButtonDisabled = true;
                this.$emit("update:activated", false);
            },

            // ========= SEARCHING GROUPS PART ===========
            onACOpened: function (){
                this.search();
                setTimeout(function () {
                    window.dispatchEvent(new Event('resize'));
                }.bind(this), 10)
            },

            onACSelected: function (item) {
                this.$nextTick(() => {
                    this.selectedValue = item.solarSystemName;
                    this.selectedItem = item;
                    this._selectLock = true;
                    this.formButtonDisabled = false;
                });
            },
            onACChanged: function (_event) {
                if(!this._selectLock) {
                    this.searchMatch = _event;
                    this.search();
                    this.formButtonDisabled = true;
                }
                this._selectLock = false;
            },

            search () {
                if(this._passChange){
                    this._passChange = false;
                    return;
                }

                if(this.searchMatch.length >= 2) {
                    let pr = new CustomPromise();
                    this.systems = pr.native
                    this._spamFilter.call(this.searchMatch, pr);
                } else {
                    this.systems = [];
                }
            },

            // ========= SEARCHING GROUPS PART ===========


            getStaticClassColor: function (_staticClass) {
                return environment.typeClasses[_staticClass];
            },

            // eslint-disable-next-line no-unused-vars
            getClassBySystemData (data) {
                let colorClass = "";
                switch (data.systemType) {
                    case 0:
                    case 1:
                    case 2:
                        colorClass = environment.securityForegroundClasses[data.security];
                        break;
                    case 3:
                    case 4:
                        colorClass = environment.typeClasses[data.typeName];
                        break;
                    case 5:
                        break;
                }
                return colorClass;
            },

            // ========= EDITING DIALOG PART ===========
            onEditDialogOpened: function () {
                this._otid !== -1 && clearTimeout(this._otid);
                this._otid = setTimeout(() => {
                    let input = this.$refs.searchField.$children[0].$children[0].$children[0].$el;
                    input.focus();
                }, 200);
            },
            onDialogClosed: function () {
                this.close();
            },
            onEditSubmit: function () {
                this.$emit("system-selected", this.selectedItem.solarSystemId);
            },
            // ========= EDITING DIALOG PART ===========

            _makeSearch: function (_match, _pr) {
                api.eve.map.solarSystem.fastSearch({match: _match})
                    .then(
                        data => _pr.resolve(data),
                        err => helper.errorHandler(this, err)
                    )
            }
        }
    }
</script>

<style lang="scss">
    @import "./src/css/variables";

    .wd-hint {
        color: $hint-color !important;
    }

    .wd-char-item {
        & > div:not(:last-child) {
            margin-right: 7px;
        }

        & > .constellation-name {
            color: $fg-primary-2;
            font-size: 13px;
        }

        & > .region-name {
            color: $fg-primary-2;
            font-size: 13px;
        }
    }

    .wd-medium-dialog {
        .md-dialog-title {
            padding: 20px 20px 0;
        }


        .wd-dialog-content {
            height: 70%;
            padding-left: 30px;
            padding-right: 30px;
            width: 500px;


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