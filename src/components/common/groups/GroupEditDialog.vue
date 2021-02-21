<template>
    <div>
        <md-dialog
            :md-active.sync="showEditDialog"
            @md-opened="onEditDialogOpened"
            @md-closed="onDialogClosed"
            class="wd-groups-edit-dialog wd-medium-dialog"
        >
            <md-dialog-title>{{header}}</md-dialog-title>

            <div class="wd-edc-content wd box-sizing">
                <md-tabs md-dynamic-height>
                    <md-tab id="tab-preferences" md-label="Preferences">
                        <div class="wd-tab wd-tab-preferences wd fs box-sizing">

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

                        </div>
                    </md-tab>

                    <md-tab id="tab-characters" md-label="Characters">
                        <div class="wd-tab wd-tab-characters wd fs box-sizing">
                            <CharactersSearcher ref="charactersSearcherRef" ></CharactersSearcher>
                        </div>
                    </md-tab>

                    <md-tab id="tab-corporations" md-label="Corporations">
                        <div class="wd-tab wd-tab-corporations wd fs box-sizing">
                            <CorporationsSearcher ref="corporationsSearcherRef" ></CorporationsSearcher>
                        </div>
                    </md-tab>

                    <md-tab id="tab-alliances" md-label="Alliances">
                        <div class="wd-tab wd-tab-alliances wd fs box-sizing">
                            <AlliancesSearcher ref="alliancesSearcherRef" ></AlliancesSearcher>
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
    import api from "../../../js/api";
    import CustomPromise from "../../../js/env/promise";
    import AlliancesSearcher from "../searchers/AlliancesSearcher";
    import CharactersSearcher from "../searchers/CharactersSearcher";
    import CorporationsSearcher from "../searchers/CorporationsSearcher";
    import helper from "../../../js/utils/helper.js";

    export default {
        name: "GroupEditDialog",
        components: {
            AlliancesSearcher, CharactersSearcher, CorporationsSearcher
        },
        props: [],
        data: function () {
            return {
                groups: [],

                header: "",
                formName: "",
                formDescription: "",
                formDescriptionIcon: "",
                formButtonDisabled: true,
                showEditDialog: false,
            }
        },
        mounted: function () {
            this._loadData();
            this._loadTid = -1;
        },
        beforeDestroy: function () {
            this._loadTid !== -1 && clearTimeout(this._loadTid);
            this._loadTid = -1;
        },
        methods: {
            _loadData: function () {
                api.eve.group.list()
                    .then(
                        data => {
                            this.groups = data;
                            this.loaded = true;
                        },
                        err => helper.errorHandler(this, err)
                    );
            },
            show: function (_options) {
                this._state = !_options ? "add" : "edit";
                this.header = this._state === "add" ? "Create new group" : "Edit group - " + _options.name;

                this._showPromise = new CustomPromise();

                if (_options) {
                    let prarr = [];

                    prarr.push(this._loadCharacters(_options.characters));
                    prarr.push(this._loadCorporations(_options.corporations));
                    prarr.push(this._loadAlliances(_options.alliances));

                    Promise.all(prarr)
                        .then(
                            arr => {
                                this.showEditDialog = true;

                                this.itemId = _options.id;
                                this.formName = _options.name;
                                this.formDescription = _options.description;

                                this._loadTid = setTimeout(function () {
                                    this._loadTid = -1;
                                    this.$refs.charactersSearcherRef.setElements(arr[0]);
                                    this.$refs.corporationsSearcherRef.setElements(arr[1]);
                                    this.$refs.alliancesSearcherRef.setElements(arr[2]);
                                }.bind(this), 100);
                            },
                            err => helper.errorHandler(this, err)
                        );
                } else {
                    this.showEditDialog = true;
                }

                return this._showPromise.native;
            },
            close: function () {

            },
            _loadCharacters: function (_characters) {
                let pr = new CustomPromise();

                let prarr = [];

                for (let a = 0; a < _characters.length; a++) {
                    prarr.push(api.eve.character.getName(_characters[a]));
                }

                Promise.all(prarr).then(function (_result) {
                    for (let a = 0; a < _result.length; a++) {
                        _result[a].id = _characters[a];
                    }
                    pr.resolve(_result);
                }.bind(this), function (_err) {
                    pr.reject(_err);
                }.bind(this));

                return pr.native;
            },
            _loadCorporations: function (_corporationIds) {
                let pr = new CustomPromise();

                let prarr = [];

                for (let a = 0; a < _corporationIds.length; a++) {
                    prarr.push(api.eve.corporation.info(_corporationIds[a]));
                }

                Promise.all(prarr).then(function (_result) {
                    for (let a = 0; a < _result.length; a++) {
                        _result[a].id = _corporationIds[a];
                    }
                    pr.resolve(_result);
                }.bind(this), function (_err) {
                    pr.reject(_err);
                }.bind(this));

                return pr.native;
            },
            _loadAlliances: function (_allianceIds) {
                let pr = new CustomPromise();

                let prarr = [];

                for (let a = 0; a < _allianceIds.length; a++) {
                    prarr.push(api.eve.alliance.info(_allianceIds[a]));
                }

                Promise.all(prarr).then(function (_result) {
                    for (let a = 0; a < _result.length; a++) {
                        _result[a].id = _allianceIds[a];
                    }
                    pr.resolve(_result);
                }.bind(this), function (_err) {
                    pr.reject(_err);
                }.bind(this));

                return pr.native;
            },
            // ========= EDITING DIALOG PART ===========

            onEditDialogOpened: function () {
                this.validateEditForm();
            },
            onDialogClosed: function () {
                this.clearForm();
            },
            onEditSubmit: function () {
                let characters = [];
                let corporations = [];
                let alliances = [];
                let attachedCharacters = this.$refs.charactersSearcherRef.getElements();
                let attachedCorporations = this.$refs.corporationsSearcherRef.getElements();
                let attachedAlliances = this.$refs.alliancesSearcherRef.getElements();

                for (let a = 0; a < attachedCharacters.length; a++) {
                    characters.push(attachedCharacters[a].id);
                }

                for (let a = 0; a < attachedCorporations.length; a++) {
                    corporations.push(attachedCorporations[a].id);
                }

                for (let a = 0; a < attachedAlliances.length; a++) {
                    alliances.push(attachedAlliances[a].id);
                }

                let options = {
                    name: this.formName,
                    description: this.formDescription,
                    characters: characters,
                    corporations: corporations,
                    alliances: alliances,
                };

                let pr = new CustomPromise();

                switch (this._state) {
                    case "add":
                        pr = api.eve.group.add(options);
                        break;
                    case "edit":
                        pr = api.eve.group.edit(this.itemId, options);
                        break;
                }

                pr.then(
                    data => {
                        if (this._state === "add") {
                            options.id = data.groupId;
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

                this.formButtonDisabled = !(isValidName /*&& isValidDescription*/);
            },
            // ========= EDITING DIALOG PART ===========
            setFieldState: function (_type, _field, _valid) {
                this["form" + _field + "Icon"] = _valid ? "done" : "warning";
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
    .wd-groups-edit-dialog {
        & > .wd-edc-content {
            height: 70%
        }

        .wd-tab {
            padding: 0 20px;

            &.wd-tab-preferences {}

            &.wd-tab-corporations,
            &.wd-tab-alliances,
            &.wd-tab-characters {
                height: 500px
            }
        }
    }
</style>