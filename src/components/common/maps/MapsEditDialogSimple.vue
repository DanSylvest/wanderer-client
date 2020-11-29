<template>
    <div class="wd off-user-select" >
        <md-dialog :md-active.sync="showEditDialog" @md-opened="onEditDialogOpened" @md-closed="onDialogClosed" class="wd-medium-dialog">
            <md-dialog-title>Creating map</md-dialog-title>

            <div class="wd box-sizing wd-dialog-content off-user-select">
                <md-field md-clearable>
                    <label>Name</label>
                    <md-input v-model="formName" @input="onEditFormChange" @change="onEditFormChange"></md-input>
                    <span class="wd-hint md-helper-text">* Map name should contain at least 3 symbols and begins with a symbol</span>
                </md-field>

                <md-field md-clearable>
                    <label>Description</label>
                    <md-input v-model="formDescription" @input="onEditFormChange" @change="onEditFormChange"></md-input>
                    <span class="wd-hint md-helper-text">You can leave this field empty</span>
                </md-field>

                <md-field md-clearable>
                    <md-autocomplete
                        v-model="charactersValue"
                        :md-options="characters"
                        md-layout="box"
                        @md-selected="charactersValue = $event.name; onACSelected($event)"
                        @md-changed="onACChanged"
                        @md-opened="onACOpened"
                        md-dense
                    >

                        <label><md-icon>search</md-icon>Select a character</label>

                        <template slot="md-autocomplete-item" slot-scope="{ item, term }">
                            <div class="wd-char-item wd flex flex-align-center font-size-medium">
                                <img class="md-icon" :src="'https://images.evetech.net/characters/' + item.id + '/portrait'" alt="Char portrait"/>
                                <md-highlight-text :md-fuzzy-search="false" :md-term="term">{{ item.name }}</md-highlight-text>
                            </div>
                        </template>

                        <template slot="md-autocomplete-empty" slot-scope="{ term }">
                            Such character not found "{{ term }}"!
                        </template>
                    </md-autocomplete>
                    <span class="wd-hint md-helper-text">* Choose a character to create a map for</span>
                </md-field>

                <div>
                    <md-checkbox v-model="formIsCorporationShare" class="md-primary" :disabled="!enableCorporations">Share with corporation</md-checkbox>
                </div>
                <div>
                    <md-checkbox v-model="formIsAllianceShare" class="md-primary" :disabled="!enableAlliances">Share with alliance</md-checkbox>
                </div>
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
    import exists from "../../../js/env/tools/exists";

    export default {
        name: "MapsEditDialogSimple",
        props: [

        ],
        data: function () {
            return {
                characters: [],
                charactersValue: "",
                charactersItem: null,
                enableCorporations: false,
                enableAlliances: false,

                formName: "",
                formDescription: "",
                formIsCorporationShare: false,
                formIsAllianceShare: false,
                formButtonDisabled: true,
                showEditDialog: false,
            }
        },
        mounted: function () {

        },
        methods: {
            show: function () {
                this._showPromise = new CustomPromise();

                api.eve.character.list().then(x => {
                    this.characters = x.sort((a, b) => +new Date(a.addDate) - +new Date(b.addDate));
                    this.charactersValue = this.characters[0].name;
                    this.charactersItem = this.characters[0];
                    this.updateSwitchboxes();
                    this.showEditDialog = true;
                });

                return this._showPromise.native;
            },
            updateSwitchboxes: function () {
                this.formIsCorporationShare = false;
                this.formIsAllianceShare = false;
                this.enableCorporations = exists(this.charactersItem) && exists(this.charactersItem.corporationId);
                this.enableAlliances = exists(this.charactersItem) && exists(this.charactersItem.allianceId);
            },
            close: function () {

            },

            // ========= SEARCHING GROUPS PART ===========
            onACOpened: function (){
                setTimeout(function () {
                    window.dispatchEvent(new Event('resize'));
                }.bind(this), 10)
            },
            onACChanged: function (_event) {
                if(_event === "") {
                    this.charactersItem = null;
                }

                setTimeout(function () {
                    this.charactersValue = _event;
                    this.updateSwitchboxes();
                    this.validateEditForm();
                }.bind(this), 0);
            },
            onACSelected: function (_event) {
                this.charactersItem = _event;
                this.updateSwitchboxes();
                this.validateEditForm();
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
                let data = {
                    name: this.formName,
                    description: this.formDescription,
                    shareForCorporation: this.formIsCorporationShare,
                    shareForAlliance: this.formIsAllianceShare,
                    characterId: this.charactersItem.id
                };

                api.eve.map.addFast(data).then(function(data){
                    this.clearForm();
                    this.showEditDialog = false;
                    this._showPromise.resolve({
                        id          : data.mapId,
                        name        : data.name,
                        owner       : data.owner,
                        description : data.description,
                        groups      : data.groups,
                    });
                }.bind(this), function(){

                }.bind(this));
            },
            onEditFormChange: function (/*_event*/) {
                this.validateEditForm();
            },
            validateEditForm: function () {
                let isValidName = validateName(this.formName, 3);
                let isValidDescription = validateName(this.formDescription, 0);

                this.setFieldState("Name", isValidName);
                this.setFieldState("Description", isValidDescription);

                let isValidCharacter = exists(this.charactersItem);

                this.formButtonDisabled = !(isValidName && isValidDescription && isValidCharacter);
            },
            // ========= EDITING DIALOG PART ===========
            setFieldState: function (_type, _field, _valid) {
                this["form" + _field + "Icon"] = _valid ? "done": "warning";
            },
            clearForm: function () {
                this.formName = "";
                this.formDescription = "";
                this.charactersItem = null;
                this.charactersValue = "";
                this.updateSwitchboxes();
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

        return !!_nickname.match(/[A-Za-z_][A-Za-z0-9_\- ]*?/m);
    };
</script>

<style lang="scss">
    @import "./src/css/variables";

    .wd-hint {
        color: $hint-color !important;
    }

    .wd-char-item {

        & > img {
            margin-right: 10px !important;
            height: 30px;
            width: 30px;
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