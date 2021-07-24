<template>
    <div>
        <transition name="fade">
            <div class="wd fs wd-ui-group-editor" v-if="showGroupEditor">
                <div class="wd fs box-sizing padding-primary" >
                    <wd-tabs>
                        <wd-tab id="tab-preferences" wd-label="Preferences" class="wd-tab wd-tab-preferences wd fs box-sizing padding-primary">
                            <md-field md-clearable>
                                <label>Name</label>
                                <md-input v-model="name" @input="onEditFormChange" @change="onEditFormChange"></md-input>

                                <transition name="fade" mode="out-in">
                                    <span class="md-helper-text wd-hint-negative" v-show="!isValidName">
                                        * Group name should contain at least 3 symbols and begins with a symbol
                                    </span>

                                    <span class="md-helper-text wd-hint-positive" v-show="isValidName">Valid</span>
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
                        </wd-tab>

                        <wd-tab id="tab-characters" wd-label="Characters" class="wd-tab wd-tab-characters wd fs box-sizing">
                            <EveSearcher :items="characters" @changed="onListsChanged('characters', $event)" type="character" editing />
                        </wd-tab>

                        <wd-tab id="tab-corporations" wd-label="Corporations" class="wd-tab wd-tab-corporations wd fs box-sizing">
                            <EveSearcher :items="corporations" @changed="onListsChanged('corporations', $event)" type="corporation" editing />
                        </wd-tab>

                        <wd-tab id="tab-alliances" wd-label="Alliances" class="wd-tab wd-tab-alliances wd fs box-sizing">
                            <EveSearcher :items="alliances" @changed="onListsChanged('alliances', $event)" type="alliance" editing />
                        </wd-tab>

<!--                        <wd-tab id="tab-moderators" wd-label="Moderators" class="wd-tab wd-tab-moderators wd fs box-sizing">-->
<!--                            <EveSearcher :items="moderators" @changed="onListsChanged('moderators', $event)" type="character" editing />-->
<!--                        </wd-tab>-->

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
    import api from "../../../js/api";
    import EveSearcher from "../searchers/EveSearcher";
    import helper from "../../../js/utils/helper.js";
    import GroupOwnInfoMixin from "../../mixins/groupOwnInfo.js";
    import GroupPublicInfoMixin from "../../mixins/groupPublicInfo.js";
    import WdTab from "../../ui/Tabs/WdTab.vue";
    import WdTabs from "../../ui/Tabs/WdTabs.vue";

    export default {
        name: "GroupEditDialog",
        components: {
            EveSearcher,
            WdTab,
            WdTabs,
        },
        mixins: [GroupOwnInfoMixin, GroupPublicInfoMixin],
        props: {
            editing: {
                type: Boolean,
                default: false
            }
        },
        data: function () {
            return {
                name: "",
                description: "",
                characters: [],
                corporations: [],
                alliances: [],
                // moderators: [],
                isDirty: false,
                valid: false,

                isValidName: false,
            }
        },
        watch : {
            groupId(val) {
                this.lGroupId = val;

                GroupOwnInfoMixin.methods.callUpdate(this);
                GroupPublicInfoMixin.methods.callUpdate(this);
            }
        },
        computed: {
            showGroupEditor () {
                return this.isAllLoaded || !this.isEditing;
            },
            isAllLoaded () {
                return this.loadedGroupPublicInfo && this.loadedGroupOwnInfo;
            },
            saveButtonEnabled () {
                return this.showGroupEditor && this.isDirty && this.valid;
            },
            isEditing () {
                return this.editing;
            },
            isDescriptionEmpty () {
                return this.description === "";
            }
        },
        methods: {
            onLoadedGroupOwnInfo (data) {
                GroupOwnInfoMixin.methods.onLoadedGroupOwnInfo.call(this, data);

                this.characters = data.characters;
                this.corporations = data.corporations;
                this.alliances = data.alliances;
            },
            onLoadedGroupPublicInfo (data) {
                GroupPublicInfoMixin.methods.onLoadedGroupPublicInfo.call(this, data);

                this.name = data.name;
                this.description = data.description;
                this.validateEditForm();
                this.$nextTick(() =>  this.isDirty = false);
            },
            onEditSubmit: function () {
                let options = {
                    name: this.name,
                    description: this.description,
                    characters: this.characters.map(x => parseInt(x)),
                    corporations: this.corporations,
                    alliances: this.alliances,
                    // moderators: this.moderators,
                };

                let pr;

                if (this.editing)
                    pr = api.eve.group.edit(this.lGroupId, options);
                else
                    pr = api.eve.group.add(options);

                pr.then(
                    data => {
                        let out = {
                            name: options.name,
                            description: options.description,
                        }

                        if (!this.editing) {
                            out.id = data.groupId;
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
            onListsChanged (type, event) {
                this[type] = event;
                this.setDirty();
                this.validateEditForm();
            },
            validateEditForm: function () {
                this.isValidName = validateName(this.name, 3);
                let isValidDescription = validateName(this.description, 0);
                let containCharacter = this.characters.length > 0;
                this.valid = this.isValidName && isValidDescription && containCharacter;
            }
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