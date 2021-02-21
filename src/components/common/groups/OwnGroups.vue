<template>
    <div class="wd-own-groups wd fs flex box-sizing flex-column">
        <div v-if="groups.length > 0 && loaded" class="own-groups-toolbar">
            <md-button class="md-dense md-primary md-raised" @click="onShowCreateDialog">
                <md-icon>add</md-icon>
                <span style="vertical-align: middle">Add group</span>
            </md-button>
        </div>

        <md-table v-model="groups" v-if="groups.length > 0 && loaded" class="wd-own-groups-table" md-fixed-header >
            <md-table-row
                @contextmenu="onContextMenu(item.id, $event)"
                @click="onRowClick(item.id, $event)"
                class="cursor-pointer"
                slot="md-table-row"
                slot-scope="{ item }"
            >
                <md-table-cell md-sort-by="name" md-label="Name">{{item.name}}</md-table-cell>
                <md-table-cell md-sort-by="owner"  md-label="Owner">{{item.owner}}</md-table-cell>
                <md-table-cell md-sort-by="description"  md-label="Description">{{item.description}}</md-table-cell>
            </md-table-row>
        </md-table>

        <md-empty-state
            v-if="groups.length === 0 && loaded"
            md-icon="layers"
            md-label="Create your group!"
            md-description="Group allow you attach characters, corporations and alliances. Also you able to attach group to your own map."
        >
            <md-button class="md-dense md-primary md-raised" @click="onShowCreateDialog">
                <span style="vertical-align: middle">Create</span>
            </md-button>
        </md-empty-state>

        <GroupEditDialog ref="groupsEditDialogRef" ></GroupEditDialog>

        <ContextMenu :c-activated.sync="groupContextMenuEnable" :c-offset-x="contextOffsetX" :c-offset-y="contextOffsetY">
            <ContextMenuItem c-title="Edit" c-icon="edit" @click="onGroupContextMenuEdit" />
            <ContextMenuItem c-title="Remove" c-icon="delete" @click="onGroupContextMenuRemove" />
        </ContextMenu>
    </div>
</template>

<script>
    import ContextMenu from "../../ui/ContextMenu/ContextMenu";
    import ContextMenuItem from "../../ui/ContextMenu/ContextMenuItem";
    import GroupEditDialog from "./GroupEditDialog";

    import api from "../../../js/api";
    import helper from "../../../js/utils/helper.js";

    export default {
        name: "OwnGroups",
        components: {
            ContextMenu, ContextMenuItem, GroupEditDialog
        },
        props: [],
        data: function () {
            return {
                loaded: false,
                groups: [],
                groupContextMenuEnable: false,
                contextOffsetX: 0,
                contextOffsetY: 0
            }
        },
        beforeMount() {
        },
        mounted: function () {
            //todo this some bullshit but... i don't know how fix it
            this.$nextTick().then(this._loadData);
        },
        beforeDestroy() {
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
            onRowClick: function (_groupId/*, _event*/) {
                this.edit(_groupId);
            },
            onShowCreateDialog: function () {
                this.add();
            },
            find: function (_groupId) {
                return this.groups.searchByObjectKey("id", _groupId);
            },
            add: function () {
                this.$refs.groupsEditDialogRef.show()
                    .then(
                        options => {
                            this.groups.push({
                                id: options.id,
                                name: options.name,
                                owner: options.owner,
                                description: options.description,
                                characters: options.characters,
                                corporations: options.corporations,
                                alliances: options.alliances,
                            });
                        },
                        // err => {
                        //
                        // }
                    );
            },
            edit: function (_groupId) {
                let item = this.find(_groupId);

                this.$refs.groupsEditDialogRef.show({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    characters: item.characters,
                    corporations: item.corporations,
                    alliances: item.alliances,
                })
                    .then(
                        options => {
                            item.name = options.name;
                            item.description = options.description;
                            item.characters = options.characters;
                            item.corporations = options.corporations;
                        },
                        // err => {
                        //
                        // }
                    );
            },

            onContextMenu: function (_groupId, _event) {
                _event.stopPropagation();
                _event.preventDefault();

                this._currentContextGroup = _groupId;
                this.groupContextMenuEnable = true;
                this.contextOffsetX = _event.x + 10;
                this.contextOffsetY = _event.y + 10;
            },
            onGroupContextMenuEdit: function () {
                this.edit(this._currentContextGroup);
            },
            onGroupContextMenuRemove: function () {
                api.eve.group.remove(this._currentContextGroup)
                    .then(
                        () => {
                            this.groups.eraseByObjectKey("id", this._currentContextGroup);
                            this._currentContextGroup = null;
                        },
                        err => helper.errorHandler(this, err)
                    );
            }
        }
    }
</script>

<style lang="scss">
    @import "./src/css/variables";

    .wd-own-groups {

        & > .own-groups-toolbar {
            padding-bottom: 10px;
        }

        & > .wd-own-groups-table {
            height: calc(100vh - 118px);

            .md-content.md-table-content {
                height: initial !important;
                max-height: initial !important;;
            }

            &.md-card.md-table,
            &.md-table.md-theme-default .md-table-content,
            &.md-table.md-theme-default .md-table-alternate-header {
                background-color: $bg-primary;
            }

            .md-table-fixed-header {
                padding-right: 0 !important;
                background-color: $bg-secondary
            }

            .md-table-head,
            .md-table-cell {
                &:nth-child(2) {
                    .md-table-cell-container {
                        white-space: nowrap;
                    }
                }

                &:nth-child(3) {
                    width: 100%;
                }
            }
        }
    }
</style>
