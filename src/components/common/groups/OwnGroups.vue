<template>
    <div class="wd-own-groups wd fs flex box-sizing flex-column">
        <div v-if="groups.length > 0 && loaded" class="own-groups-toolbar">
            <md-button class="md-dense md-primary md-raised" @click="onShowCreateDialog">
                <md-icon>add</md-icon>
                <span style="vertical-align: middle">Add group</span>
            </md-button>
        </div>

        <md-table v-if="groups.length > 0 && loaded" class="wd-own-groups-table">
            <md-table-row>
                <md-table-head style="width: 150px">Name</md-table-head>
                <md-table-head style="width: 180px">Owner</md-table-head>
                <md-table-head>Description</md-table-head>
            </md-table-row>

            <md-table-row
                @contextmenu="onContextMenu(item.id, $event)"
                @click="onRowClick(item.id, $event)"
                class="cursor-pointer"
                v-for="item in groups"
                :key="item.id"
            >
                <md-table-cell>{{item.name}}</md-table-cell>
                <md-table-cell>{{item.owner}}</md-table-cell>
                <md-table-cell>{{item.description}}</md-table-cell>
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
    import CustomPromise from "../../../js/env/promise";

    import api from "../../../js/api";

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
            this._mountedPromise = new CustomPromise();
        },
        mounted: function () {
            //todo this some bullshit but... i don't know how fix it
            this._mountedPromise.resolve();
        },
        beforeDestroy() {
            this._mountedPromise.native.cancel();
        },
        methods: {
            _loadData: function () {
                api.eve.group.list().then(function (_groups) {
                    this.groups = _groups;
                    this.loaded = true;

                    // eslint-disable-next-line no-unused-vars
                }.bind(this), function (_err) {
                    // eslint-disable-next-line no-debugger
                    debugger
                }.bind(this))
            },
            close: function () {

            },
            load: function () {
                // setTimeout(function () {
                //     this._mountedPromise.native.then(this._loadData.bind(this));
                // }.bind(this), 400)

                this._loadData();
                // this._loadData();
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
                this.$refs.groupsEditDialogRef.show().then(function (_options) {
                    this.groups.push({
                        id: _options.id,
                        name: _options.name,
                        owner: _options.owner,
                        description: _options.description,
                        characters: _options.characters,
                        corporations: _options.corporations,
                        alliances: _options.alliances,
                    });
                }.bind(this), function () {
                    // do nothing
                }.bind(this));
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
                }).then(function (_options) {
                    item.name = _options.name;
                    item.description = _options.description;
                    item.characters = _options.characters;
                    item.corporations = _options.corporations;
                }.bind(this), function () {
                    // do nothing
                }.bind(this));
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
                api.eve.group.remove(this._currentContextGroup).then(function () {
                    this.groups.eraseByObjectKey("id", this._currentContextGroup);
                    this._currentContextGroup = null;
                }.bind(this), function (_err) {
                    // do nothing
                    // TODO maybe need show small snackbar
                    // debugger;
                    alert(_err);
                }.bind(this));
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
            &.md-card.md-table,
            &.md-table.md-theme-default .md-table-content,
            &.md-table.md-theme-default .md-table-alternate-header {
                background-color: $bg-secondary;
            }
        }
    }
</style>
