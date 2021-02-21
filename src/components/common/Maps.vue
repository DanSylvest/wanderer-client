<template>
    <div class="wd-maps">
        <div class="maps-toolbar" v-show="maps.length > 0">
            <md-button class="md-dense md-accent md-raised" @click="addSimple">
                <md-icon>add</md-icon>
                <span style="vertical-align: middle">Add map</span>
            </md-button>

            <md-button class="md-dense md-primary md-raised" @click="add">
                <md-icon>add</md-icon>
                <span style="vertical-align: middle">Add map (advanced)</span>
            </md-button>
        </div>

        <div class="maps-content md-scrollbar">
            <md-table v-model="maps" v-show="loaded && maps.length > 0" class="maps-table" md-fixed-header>
                <md-table-row
                    slot="md-table-row"
                    @contextmenu="onContextMenu(item.id, $event)"
                    @click="onMapRowClick(item.id, $event)"
                    slot-scope="{ item }"
                >
                    <md-table-cell md-sort-by="name" md-label="Name">{{item.name}}</md-table-cell>
                    <md-table-cell md-sort-by="owner"  md-label="Owner">{{item.owner}}</md-table-cell>
                    <md-table-cell md-sort-by="description"  md-label="Description">{{item.description}}</md-table-cell>
                </md-table-row>
            </md-table>


            <md-empty-state
                v-if="loaded && maps.length === 0"
                md-icon="layers"
                md-label="Create your map!"
                md-description="Map allow you attach groups and track characters. Its simple! Just click this button."
            >
                <md-button class="md-dense md-primary md-raised" @click="addSimple">
                    <span style="vertical-align: middle">Create</span>
                </md-button>
            </md-empty-state>
        </div>

        <MapsEditDialog ref="mapsEditDialogRef"></MapsEditDialog>
        <MapsEditDialogSimple ref="mapsEditDialogSimpleRef"></MapsEditDialogSimple>

        <ContextMenu :c-activated.sync="mapContextMenuEnable" :c-offset-x="contextOffsetX" :c-offset-y="contextOffsetY">
            <ContextMenuItem c-title="Edit" c-icon="edit" @click="onMapContextMenuEdit" />
            <ContextMenuItem c-title="Remove" c-icon="delete" @click="onMapContextMenuRemove" />
        </ContextMenu>
    </div>
</template>

<script>
    import ContextMenu from "../ui/ContextMenu/ContextMenu";
    import ContextMenuItem from "../ui/ContextMenu/ContextMenuItem";
    import MapsEditDialog from "./maps/MapsEditDialog";
    import MapsEditDialogSimple from "./maps/MapsEditDialogSimple";

    import api from "../../js/api";
    import helper from "../../js/utils/helper.js";

    export default {
        name: "Maps",
        components: {
            ContextMenu, ContextMenuItem, MapsEditDialog, MapsEditDialogSimple
        },
        props: [],
        data: function () {
            return {
                maps: [],
                groups: [],

                loaded: false,
                mapContextMenuEnable: false,
                contextOffsetX: 0,
                contextOffsetY: 0,
            }
        },
        mounted: function () {
            this._loadData();
        },
        methods: {
            close: function () {

            },
            refresh: function () {

            },
            _loadData: function ( ) {
                let prarr = [];

                prarr.push(api.eve.group.list());
                prarr.push(api.eve.map.list());

                Promise.all(prarr)
                    .then(
                        arr => {
                            this.loaded = true;
                            this.groups = arr[0];
                            this.maps = arr[1];
                        },
                        err => helper.errorHandler(this, err)
                    );
            },
            edit: function (_mapId) {
                let mapItem = this.maps.searchByObjectKey("id", _mapId);
                // let groupItem = this.groups.searchByObjectKey("id", mapItem.guestGroup);

                this.$refs.mapsEditDialogRef.show({
                    mapId : mapItem.id,
                    name : mapItem.name,
                    description : mapItem.description,
                    groups : mapItem.groups,
                }).then(function(_options){
                    mapItem.name = _options.name;
                    mapItem.description = _options.description;
                    mapItem.groups = _options.groups;
                }.bind(this), function(){
                    // do nothing
                }.bind(this));
            },
            add: function () {
                this.$refs.mapsEditDialogRef.show().then(function(_options){
                    this.maps.push({
                        id          : _options.id,
                        name        : _options.name,
                        owner       : _options.owner,
                        description : _options.description,
                        groups      : _options.groups,
                    });
                }.bind(this), function(){
                    // do nothing
                }.bind(this));
            },
            addSimple: function () {
                this.$refs.mapsEditDialogSimpleRef.show().then(function(_options){
                    this.maps.push({
                        id          : _options.id,
                        name        : _options.name,
                        owner       : _options.owner,
                        description : _options.description,
                        groups      : _options.groups,
                    });
                }.bind(this), function(){
                    // do nothing
                }.bind(this));
            },
            onMapRowClick: function (_mapId/*, _event*/) {
                this.edit(_mapId);
            },
            onContextMenu: function (_mapId, _event) {
                _event.stopPropagation();
                _event.preventDefault();

                this.mapContextMenuCurrentMap = _mapId;
                this.mapContextMenuEnable = true;
                this.contextOffsetX = _event.x + 10;
                this.contextOffsetY = _event.y + 10;
            },
            onMapContextMenuEdit: function () {
                this.edit(this.mapContextMenuCurrentMap);
            },
            onMapContextMenuRemove: function () {
                api.eve.map.remove(this.mapContextMenuCurrentMap)
                    .then(
                        () => {
                            this.maps.eraseByObjectKey("id", this.mapContextMenuCurrentMap);
                            this.mapContextMenuCurrentMap = null;
                        },
                        error => helper.errorHandler(this, error)
                    );
            }
        }
    }
</script>


<style lang="scss">
    @import "src/css/variables";

    .wd-maps {
        display: flex;
        flex-direction: column;

        & > .maps-toolbar {
            padding-bottom: 10px;
            padding-top: 5px;
        }

        & > .maps-content {
            .maps-table {
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
    }
</style>
