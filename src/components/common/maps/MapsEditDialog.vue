<template>
    <div>
        <md-dialog :md-active.sync="showEditDialog" @md-opened="onEditDialogOpened" @md-closed="onDialogClosed" class="">
            <md-dialog-title>{{header}}</md-dialog-title>

            <div class="wd box-sizing wd-dialog-content">
                <md-tabs md-dynamic-height>
                    <md-tab id="tab-preferences" md-label="Preferences">
                        <div class="wd fs box-sizing">

                            <md-field md-clearable>
                                <label>Name</label>
                                <md-input v-model="formName" @input="onEditFormChange" @change="onEditFormChange"></md-input>
                            </md-field>

                            <md-field md-clearable>
                                <md-icon v-if="(formDescriptionIcon === 'warning')" class="md-accent">
                                    <md-tooltip md-direction="top">Description must contains minimum 4 letter</md-tooltip>
                                    {{/*createDescriptionIcon*/}}
                                </md-icon>
                                <label>Description</label>
                                <md-input v-model="formDescription" @input="onEditFormChange" @change="onEditFormChange"></md-input>
                            </md-field>

                            <md-switch v-model="formIsPrivate" class="md-primary">Is Private</md-switch>
                        </div>
                    </md-tab>

                    <md-tab id="tab-groups" md-label="Groups">
                        <div class="groups-tab wd box-sizing ">
                            <div class="wd relative flex flex-align-center box-sizing padding-vertical-primary">
                                <md-autocomplete
                                        v-model="searchDefaultGroupValue"
                                        :md-options="groups"
                                        md-layout="box"
                                        @md-selected="searchDefaultGroupValue = $event.name; onSearchDefaultGroupSelected($event)"
                                        @md-changed="onSearchDefaultGroupChanged"
                                        @md-opened="onACOpened"
                                        md-dense
                                >

                                    <label><md-icon>search</md-icon> Select group</label>

                                    <template slot="md-autocomplete-item" slot-scope="{ item, term }">
                                        <md-highlight-text :md-fuzzy-search="false" :md-term="term">{{ item.name }}</md-highlight-text>
                                    </template>

                                    <template slot="md-autocomplete-empty" slot-scope="{ term }">
                                        Such group not exist "{{ term }}"!
                                    </template>
                                </md-autocomplete>

                                <md-button
                                        class="md-raised md-accent"
                                        :disabled="searchAddButtonDisabled"
                                        @click="onSearchAddButtonClick"
                                >
                                    <md-icon>add</md-icon>
                                </md-button>
                            </div>

                            <div>
                                <md-table v-show="searchAttachedGroups.length > 0" class="groups-table" md-card @md-selected="onRowsSelected" v-model="searchAttachedGroups">
                                    <md-table-toolbar>
                                        <h1 class="md-title">Groups attached to map</h1>
                                    </md-table-toolbar>

                                    <md-table-toolbar slot="md-table-alternate-header" slot-scope="{ count }">
                                        <div class="md-toolbar-section-start">Groups selected - {{count}}</div>

                                        <div class="md-toolbar-section-end">
                                            <md-button class="md-icon-button" @click="onDeleteRows">
                                                <md-icon>delete</md-icon>
                                            </md-button>
                                        </div>
                                    </md-table-toolbar>

                                    <md-table-row slot-scope="{ item }" class="wd cursor-pointer" md-auto-select md-selectable="multiple" slot="md-table-row">
                                        <md-table-cell md-label="Name">{{item.name}}</md-table-cell>
                                        <md-table-cell md-label="Owner">{{item.owner}}</md-table-cell>
                                        <md-table-cell md-label="Description">{{item.description}}</md-table-cell>
                                    </md-table-row>
                                </md-table>

                                <md-empty-state
                                        v-show="searchAttachedGroups.length === 0"
                                        md-icon="group_add"
                                        md-label="Add groups to map"
                                        md-description="Groups allow you attach to map some users, corporations, alliances."
                                >
                                </md-empty-state>
                            </div>
                        </div>
                    </md-tab>
                </md-tabs>
            </div>

            <md-dialog-actions>
                <md-button class="md-primary md-accent" @click="showEditDialog = false">Close</md-button>
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
    import helper from "../../../js/utils/helper.js";

    export default {
        name: "MapsEditDialog",
        props: [

        ],
        data: function () {
            return {
                maps: [],
                groups: [],

                header: "",

                searchAddButtonDisabled: true,
                searchDefaultGroupValue: "",
                searchDefaultGroupItem: null,
                searchAttachedGroups: [
                    // {name: "kek21", description: "kek21", owner: "kek21", id: "asdfasd123wdfasdf"},
                ],
                searchAttachedGroupsSelected: [],

                formName: "",
                formDescription: "",
                formDescriptionIcon: "",
                formIsPrivate: true,
                formButtonDisabled: true,
                showEditDialog: false,
            }
        },
        mounted: function () {
            let prarr = [];

            prarr.push(api.eve.group.list());
            prarr.push(api.eve.map.list());

            Promise.all(prarr)
                .then(
                    arr => {
                        this.groups = arr[0];
                        this.maps = arr[1];
                    },
                    err => helper.errorHandler(this, err)
                );
        },
        methods: {
            _load: function () {

            },
            show: function (_options) {
                this._state = !_options ? "add" : "edit";
                this.header = this._state === "add" ? "Create new map" : "Edit map - " + _options.name;

                this._showPromise = new CustomPromise();

                if(_options) {
                    this._loadGroups(_options.groups)
                        .then(
                            groups => {
                                this.showEditDialog = true;

                                this.mapId = _options.mapId;
                                this.formName = _options.name;
                                this.formDescription = _options.description;
                                this.searchAttachedGroups = groups;
                            },
                            err => this._showPromise.reject(err)
                        );
                } else {
                    this.showEditDialog = true;
                }

                return this._showPromise.native;
            },
            close: function () {

            },

            _loadGroups (groups) {
                let pr = new CustomPromise();

                Promise.all(groups.map(x => api.eve.group.info(x)))
                    .then(
                        result => {
                            result.map((x, i) => result[i].id = groups[i])
                            pr.resolve(result);
                        },
                        err => {
                            helper.errorHandler(this, err);
                            pr.reject(err);
                        }
                    );

                return pr.native;
            },

            // ========= SEARCHING GROUPS PART ===========
            onACOpened: function (){
                setTimeout(function () {
                    window.dispatchEvent(new Event('resize'));
                }.bind(this), 10)
            },

            onSearchDefaultGroupChanged: function (_event) {
                setTimeout(function () {
                    this.searchDefaultGroupItem = _event;
                }.bind(this), 0);
            },
            onSearchDefaultGroupSelected: function (_event) {
                this.formDefaultGroupItem = _event;
                this.searchAddButtonDisabled = false;
            },
            onSearchAddButtonClick: function (/*_event*/) {
                if(!this.searchAttachedGroups.searchByObjectKey("id", this.formDefaultGroupItem.id)) {
                    this.searchAttachedGroups.push(this.formDefaultGroupItem);
                    this.searchAddButtonDisabled = true;
                    this.searchDefaultGroupValue = "";
                }
            },
            onRowsSelected: function (_selectedGroups) {
                this.searchAttachedGroupsSelected = _selectedGroups;
            },
            onDeleteRows: function (/*_selectedGroups*/) {
                for (let a = 0; a < this.searchAttachedGroupsSelected.length; a++) {
                    this.searchAttachedGroups.eraseByObjectKey("id", this.searchAttachedGroupsSelected[a].id);
                }
                this.searchAttachedGroupsSelected = [];
            },
            // ========= SEARCHING GROUPS PART ===========


            // ========= EDITING DIALOG PART ===========
            onEditDialogOpened: function () {
                this.validateEditForm();
            },
            onDialogClosed: function () {
                this.clearForm();
            },
            onEditSubmit: function () {
                let groups = [];

                for (let a = 0; a < this.searchAttachedGroups.length; a++) {
                    groups.push(this.searchAttachedGroups[a].id);
                }

                let options = {
                    name: this.formName,
                    description: this.formDescription,
                    groups: groups
                };

                let pr = new CustomPromise();

                switch(this._state) {
                    case "add":
                        pr = api.eve.map.add(options)
                        break;
                    case "edit":
                        pr = api.eve.map.edit(this.mapId, options)
                        break;
                }

                pr.then(
                    data => {
                        if(this._state === "add") {
                            options.id = data.mapId;
                            options.owner = data.owner;
                        }

                        this.clearForm();
                        this.showEditDialog = false;
                        this._showPromise.resolve(options);
                    },
                    err => helper.errorHandler(this, err)
                );
            },
            onEditFormChange: function (/*_event*/) {
                this.validateEditForm();
            },
            validateEditForm: function () {
                let isValidName = validateName(this.formName, 3);
                let isValidDescription = validateName(this.formDescription, 0);

                this.setFieldState("Name", isValidName);
                this.setFieldState("Description", isValidDescription);

                this.formButtonDisabled = !(isValidName && isValidDescription);
            },
            // ========= EDITING DIALOG PART ===========
            setFieldState: function (_type, _field, _valid) {
                this["form" + _field + "Icon"] = _valid ? "done": "warning";
            },
            clearForm: function () {
                this.formName = "";
                this.formDescription = "";
                this.formDescriptionIcon = "";
                this.formIsPrivate = false;

                this.searchAttachedGroups = [];
            },
        }
    }

    let validateName = function (_nickname, _allowLength) {
        _allowLength = _allowLength !== undefined ? _allowLength : 3;

        if(_allowLength === 0 && _nickname === "")
            return true;

        if(!_nickname)
            return false;

        if(_nickname.length <= _allowLength)
            return false;

        return !!_nickname.match(/[A-Za-z_][A-Za-z_\- ]*?/m);
    };
</script>

<style lang="scss">
    @import "./src/css/variables";

    .wd-dialog-content {
        height: 70%;
        width: 700px;

        & .md-tab {
            padding-left: 20px;
            padding-right: 20px;
        }

        .groups-tab {
            height: 500px;
        }

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
</style>