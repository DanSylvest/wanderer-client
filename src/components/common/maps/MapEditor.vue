<template>
    <div class="wd fs">
        <transition name="fade">
            <div class="wd fs wd-ui-group-editor" v-if="showMapEditor">
                <div class="wd fs box-sizing padding-primary">
                    <wd-tabs @tab-changed="() => helpCounter++">
                        <wd-tab id="tab-preferences" wd-label="Preferences" class="wd-tab wd-tab-preferences wd fs box-sizing padding-primary">
                            <div class="wd fs box-sizing">
                                <md-field md-clearable>
                                    <label>Name</label>
                                    <md-input v-model="name" @input="onEditFormChange" @change="onEditFormChange"></md-input>

                                    <transition name="fade" mode="out-in">
                                        <span class="md-helper-text wd-hint-negative" v-if="!isValidName">
                                            * Group name should contain at least 3 symbols and begins with a symbol
                                        </span>
                                        <span v-if="isValidName" class="md-helper-text wd-hint-positive">Name is valid</span>
                                    </transition>
                                </md-field>

                                <md-field md-clearable>
                                    <label>Description</label>
                                    <md-input v-model="description" @input="onEditFormChange" @change="onEditFormChange"></md-input>

                                    <transition name="fade">
                                        <span class="wd-hint-positive md-helper-text" v-if="isDescriptionEmpty">
                                            You can leave this field empty
                                        </span>
                                    </transition>
                                </md-field>
                            </div>
                        </wd-tab>

                        <wd-tab id="tab-groups" wd-label="Groups" class="wd-tab wd-tab-groups wd fs box-sizing">
                            <div class="wd-eve-search wd fs">
                                <div class="wd flex flex-align-center box-sizing padding-vertical-primary">
                                    <md-autocomplete
                                        v-model="searchDefaultGroupValue"
                                        :md-options="groupsOwnList"
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

                                <transition name="fade" mode="out-in">
                                    <div v-if="groups.length > 0" class="wd fs">
                                        <wd-table
                                            v-if="true"
                                            :key="helpCounter"
                                            :rows="groups"
                                            @selected="selected = $event"
                                            selectable
                                            class="wd padding-primary fs"
                                        >
                                            <template v-slot:toolbar>
                                                <div class="md-toolbar-section-start wd-capital-letter">Groups</div>
                                            </template>

                                            <template v-slot:alternate-toolbar>
                                                <div class="md-toolbar-section-start wd-capital-letter">Groups selected - {{selected.length}}</div>

                                                <div class="md-toolbar-section-end">
                                                    <md-button class="md-icon-button" @click="onDeleteRows">
                                                        <md-icon>delete</md-icon>
                                                    </md-button>
                                                </div>
                                            </template>

                                            <template v-slot:header >
                                                <table-header-cell sortable id="name" alignment="start" class="wd-capital-letter">Name</table-header-cell>
                                                <table-header-cell sortable id="owner" class="wd-capital-letter">Owner</table-header-cell>
                                                <table-header-cell sortable id="description" class="wd-capital-letter">Description</table-header-cell>
                                            </template>

                                            <template v-slot:row="{row}">
                                                <table-cell id="name" class="wd fs padding-horizontal-primary" alignment="start">{{row.name}}</table-cell>
                                                <table-cell id="owner" class="wd fs padding-horizontal-primary" >
                                                    <character-with-ticker :character-id="row.owner" />
                                                </table-cell>
                                                <table-cell id="description" class="wd fs padding-horizontal-primary" >{{row.description}}</table-cell>
                                            </template>
                                        </wd-table>
                                    </div>

                                    <md-empty-state
                                        v-if="groups.length === 0"
                                        md-icon="group_add"
                                        md-label="Add groups to map"
                                        md-description="Groups allow you attach to map some users, corporations, alliances."
                                    />
                                </transition>
                            </div>
                        </wd-tab>

                    </wd-tabs>
                </div>

                <div class="md-toolbar-section-end">
                    <md-button class="md-primary md-raised" @click="onEditSubmit" :disabled="!saveButtonEnabled">Save</md-button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    import MapInfoMixin from "../../mixins/mapInfo.js";
    import WdTab from "../../ui/Tabs/WdTab.vue";
    import WdTabs from "../../ui/Tabs/WdTabs.vue";
    import GroupsOwnMixin from "../../mixins/groupsOwn.js";
    import WdTable from "../../ui/Table/WdTable.vue";
    import TableCell from "../../ui/Table/TableCell.vue";
    import TableHeaderCell from "../../ui/Table/TableHeaderCell.vue";
    import CharacterWithTicker from "../Characters/CharacterWithTicker.vue";
    import CustomPromise from "../../../js/env/promise.js";
    import api from "../../../js/api.js";
    import helper from "../../../js/utils/helper.js";
    import MapGroupsMixin from "../../mixins/mapGroups.js";

    export default {
        name: "MapEditor",
        components: {
            WdTab, WdTabs,
            WdTable, TableCell, TableHeaderCell,
            CharacterWithTicker
        },
        mixins: [MapInfoMixin, GroupsOwnMixin, MapGroupsMixin],
        props: {
            editing: {
                type: Boolean,
                default: false
            }
        },
        watch : {
            mapId(val) {
                this.lMapId = val;

                MapInfoMixin.methods.callUpdate(this);
                MapGroupsMixin.methods.callUpdate(this);
            }
        },
        data () {
            return {
                name: "",
                description: "",
                groups: [],

                isValidName: false,
                isDirty: false,
                valid: false,

                helpCounter: 0,
                selected: [],

                searchAddButtonDisabled: true,
                searchDefaultGroupValue: "",
                searchDefaultGroupItem: null,
            }
        },
        computed: {
            showMapEditor () {
                return this.isAllLoaded || !this.isEditing;
            },
            isAllLoaded () {
                return this.loadedMapInfo && this.loadedGroupsOwn;
            },
            saveButtonEnabled () {
                return this.showMapEditor && this.isDirty && this.valid;
            },
            isEditing () {
                return this.editing;
            },
            isDescriptionEmpty () {
                return this.description === "";
            }
        },
        methods : {
            onLoadedMapGroups (data) {
                MapGroupsMixin.methods.onLoadedMapGroups.call(this, data);

                this.groups = data;
                this.validateEditForm();
                this.$nextTick(() =>  this.isDirty = false);
            },
            onLoadedMapInfo (data) {
                MapInfoMixin.methods.onLoadedMapInfo.call(this, data);

                this.name = data.name;
                this.description = data.description;
                this.validateEditForm();
                this.$nextTick(() =>  this.isDirty = false);
            },
            onLoadedGroupsOwn (data) {
                GroupsOwnMixin.methods.onLoadedGroupsOwn.call(this, data);

                this.groupsOwnList = data;
                this.validateEditForm();
            },
            onEditSubmit () {
                let groups = this.groups.map(x => x.id);

                let options = {
                    name: this.name,
                    description: this.description,
                    groups: groups
                };

                let pr = new CustomPromise();

                if (!this.editing)
                    pr = api.eve.map.add(options);
                else
                    pr = api.eve.map.edit(this.mapId, options);

                pr.then(
                    data => {
                        let out = {
                            name: options.name,
                            description: options.description,
                        }

                        if (!this.editing) {
                            out.id = data.mapId;
                            out.owner = data.owner;
                        }

                        this.isDirty = false;
                        this.$emit("success", out);
                    },
                    err => helper.errorHandler(this, err)
                );
            },
            setDirty () {
                this.isDirty = true;
            },
            onEditFormChange () {
                this.setDirty();
                this.validateEditForm();
            },
            validateEditForm: function () {
                this.isValidName = validateName(this.name, 3);
                let isValidDescription = validateName(this.description, 0);
                let containCharacter = this.groups.length > 0;
                this.valid = this.isValidName && isValidDescription && containCharacter;
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
                if(!this.groups.searchByObjectKey("id", this.formDefaultGroupItem.id)) {
                    this.groups.push(this.formDefaultGroupItem);
                    this.searchAddButtonDisabled = true;
                    this.searchDefaultGroupValue = "";
                    this.setDirty();
                    this.validateEditForm();
                }
            },
            onDeleteRows: function () {
                this.selected.map(x => this.groups.eraseByObjectKey("id", x.id));
                this.validateEditForm();
            },
            // ========= SEARCHING GROUPS PART ===========
        }
    }

    let validateName = function (_nickname, _allowLength) {
        _allowLength = _allowLength !== undefined ? _allowLength : 3;

        if(_allowLength === 0 && _nickname === "")
            return true;

        if(!_nickname)
            return false;

        if(_nickname.length < _allowLength)
            return false;

        return !!_nickname.match(/[A-Za-z_][A-Za-z_\- ]*?/m);
    };
</script>

<style scoped lang="scss">
    .md-autocomplete.md-field {
        margin: 0;
    }

    .wd-eve-search {
        display: grid;
        grid-template-rows: auto calc(100% - 68px);
    }
</style>