<template>
    <div class="wd fs">
        <transition name="fade">
            <div class="wd fs wd-groups" v-if="showMaps">
                <div class="wd fs padding-primary wd-groups__table">
                    <wd-table
                        :rows="mapsList"
                        @row-clicked="onRowClicked"
                        @selected="selectedMaps = $event"
                        selectable
                        class="text-centering  wd"
                        :active-rows="activeRows"
                    >
                        <template v-slot:toolbar>
                            <div class="md-toolbar-section-start">
                                Maps
                            </div>

                            <div class="md-toolbar-section-end">
                                <md-button class="md-dense md-accent md-raised" @click="showCreateSimpleDialog = true">
                                    <md-icon>add</md-icon>
                                    <span style="vertical-align: middle">Add map</span>
                                </md-button>

                                <md-button class="md-dense md-primary md-raised" @click="showCreateDialog = true">
                                    <md-icon>add</md-icon>
                                    <span style="vertical-align: middle">Add map (advanced)</span>
                                </md-button>
                            </div>
                        </template>

                        <template v-slot:alternate-toolbar>
                            <div class="md-toolbar-section-start">
                                Actions with selected
                            </div>

                            <div class="md-toolbar-section-end">
                                <md-button class="md-icon-button" @click="onRemoveMaps">
                                    <md-tooltip md-direction="bottom">Delete</md-tooltip>
                                    <md-icon>delete</md-icon>
                                </md-button>
                            </div>
                        </template>

                        <template v-slot:header >
                            <table-header-cell sortable id="name" >Name</table-header-cell>
                            <table-header-cell sortable id="owner">Owner</table-header-cell>
                            <table-header-cell sortable id="description">Description</table-header-cell>
                        </template>

                        <template v-slot:row="{row}">
                            <table-cell id="name" class="wd padding-vertical-small">{{row.name}}</table-cell>
                            <table-cell id="owner" class="wd fs padding-horizontal-primary">
                                <character-with-ticker :character-id="row.owner" />
                            </table-cell>
                            <table-cell id="description" class="wd padding-horizontal-primary">{{row.description}}</table-cell>
                        </template>
                    </wd-table>
                </div>

                <div class="wd-groups__info">
                    <transition name="fade">
                        <div v-if="isEditingMap" class="wd-wgi-container wd fs">
                            <map-editor :map-id="selectedMapId" @success="onMapEdited" :editing="true"/>
<!--                            <related-maps :group-id="selectedGroupId" />-->
                        </div>
                    </transition>

                    <transition name="fade">
                        <md-empty-state
                            v-if="!isEditingMap"
                            md-icon="group"
                            md-label="Map isn't selected"
                            md-description="Select a map - in order to change settings."
                        />
                    </transition>
                </div>

            </div>
        </transition>

        <transition name="fade">
            <md-empty-state
                v-if="showEmptyMaps"
                md-icon="layers"
                md-label="Create your map!"
                md-description="Map description."
            >
                <md-button class="md-dense md-primary md-raised" @click="false">
                    <span style="vertical-align: middle">Create</span>
                </md-button>
            </md-empty-state>
        </transition>

        <map-create-dialog :show.sync="showCreateDialog" @success="onMapCreated"/>
        <map-create-simple-dialog :show.sync="showCreateSimpleDialog" @success="onMapCreated"/>
    </div>
</template>

<script>
    // import ContextMenu from "../ui/ContextMenu/ContextMenu";
    // import ContextMenuItem from "../ui/ContextMenu/ContextMenuItem";
    //
    import api from "../../js/api";
    // import helper from "../../js/utils/helper.js";
    import WdTable from "../ui/Table/WdTable.vue";
    import TableCell from "../ui/Table/TableCell.vue";
    import TableHeaderCell from "../ui/Table/TableHeaderCell.vue";
    import CharacterWithTicker from "./Characters/CharacterWithTicker.vue";
    import MapsMixin from "../mixins/maps.js";
    import exists from "../../js/env/tools/exists.js";
    import MapEditor from "./maps/MapEditor.vue";
    import helper from "../../js/utils/helper.js";
    import MapCreateDialog from "./maps/MapCreateDialog.vue";
    import MapCreateSimpleDialog from "./maps/MapCreateSimpleDialog.vue";

    const TRANSITION_TIMEOUT = 150;

    export default {
        name: "Maps",
        components: {
            // ContextMenu,
            // ContextMenuItem,
            WdTable,
            TableCell,
            TableHeaderCell,
            CharacterWithTicker,
            MapEditor,
            MapCreateDialog,
            MapCreateSimpleDialog
        },
        mixins: [MapsMixin],
        data () {
            return {
                isEditingMap: false,
                isEditingMapLoading: false,
                selectedMapId: null,
                selectedMaps: [],
                activeRows: [],
                showCreateDialog: false,
                showCreateSimpleDialog: false,
            }
        },
        beforeDestroy() {
            exists(this._loadingTimeout) && clearTimeout(this._loadingTimeout);
            this._loadingTimeout = null;
        },
        mounted () {

        },
        computed: {
            loaded () {
                return this.loadedMaps;
            },
            hasMaps () {
                return this.mapsList.length > 0;
            },
            showMaps () {
                return this.loaded && this.hasMaps;
            },
            showEmptyMaps () {
                return this.loaded && !this.hasMaps /*true*/;
            }
        },
        methods: {
            onMapCreated (data) {
                this.mapsList.push(data);
            },
            onRowClicked (event) {
                if (this.selectedMapId === event.data.id)
                    return;

                this.activeRows = [this.mapsList.searchByObjectKey("id", event.data.id)];

                if (this.isEditingMap && !this.isEditingFormLoading) {
                    this.isEditingMap = false;
                    this.isEditingFormLoading = true;

                    this._loadingTimeout = setTimeout(() => this.updateEditingMap(event), TRANSITION_TIMEOUT);
                } else {
                    this.updateEditingMap(event);
                }
            },
            onRemoveMaps () {
                Promise.all(this.selectedMaps.map(x => api.eve.map.remove(x.id)))
                    .then(
                        () => {
                            this.selectedMaps.map(x => this.mapsList.eraseByObjectKey("id", x.id));
                            if(this.selectedMaps.includes(this.selectedMapId)) {
                                this.selectedMapId = null;
                                this.isEditingMap = false;
                                this.isEditingFormLoading = false;
                            }
                        },
                        err => helper.errorHandler(this, err)
                    )
            },
            onMapEdited (data) {
                let obj = this.mapsList.searchByObjectKey("id", this.selectedMapId);
                obj.name = data.name;
                obj.description = data.description;
            },
            updateEditingMap (event) {
                exists(this._loadingTimeout) && clearTimeout(this._loadingTimeout);
                this._loadingTimeout = null;

                this.selectedMapId = event.data.id;
                this.isEditingFormLoading = false;
                this.isEditingMap = true;
            },
            // _loadData: function ( ) {
            //     let prarr = [];
            //
            //     prarr.push(api.eve.group.list());
            //     prarr.push(api.eve.map.list());
            //
            //     Promise.all(prarr)
            //         .then(
            //             arr => {
            //                 this.loaded = true;
            //                 this.groups = arr[0];
            //                 this.maps = arr[1];
            //             },
            //             err => helper.errorHandler(this, err)
            //         );
            // },
            // edit: function (_mapId) {
            //     let mapItem = this.maps.searchByObjectKey("id", _mapId);
            //     // let groupItem = this.groups.searchByObjectKey("id", mapItem.guestGroup);
            //
            //     this.$refs.mapsEditDialogRef.show({
            //         mapId : mapItem.id,
            //         name : mapItem.name,
            //         description : mapItem.description,
            //         groups : mapItem.groups,
            //     }).then(function(_options){
            //         mapItem.name = _options.name;
            //         mapItem.description = _options.description;
            //         mapItem.groups = _options.groups;
            //     }.bind(this), function(){
            //         // do nothing
            //     }.bind(this));
            // },
            // add: function () {
            //     this.$refs.mapsEditDialogRef.show().then(function(_options){
            //         this.maps.push({
            //             id          : _options.id,
            //             name        : _options.name,
            //             owner       : _options.owner,
            //             description : _options.description,
            //             groups      : _options.groups,
            //         });
            //     }.bind(this), function(){
            //         // do nothing
            //     }.bind(this));
            // },
            // addSimple: function () {
            //     this.$refs.mapsEditDialogSimpleRef.show().then(function(_options){
            //         this.maps.push({
            //             id          : _options.id,
            //             name        : _options.name,
            //             owner       : _options.owner,
            //             description : _options.description,
            //             groups      : _options.groups,
            //         });
            //     }.bind(this), function(){
            //         // do nothing
            //     }.bind(this));
            // },
            // onMapRowClick: function (_mapId/*, _event*/) {
            //     this.edit(_mapId);
            // },
            // onContextMenu: function (_mapId, _event) {
            //     _event.stopPropagation();
            //     _event.preventDefault();
            //
            //     this.mapContextMenuCurrentMap = _mapId;
            //     this.mapContextMenuEnable = true;
            //     this.contextOffsetX = _event.x + 10;
            //     this.contextOffsetY = _event.y + 10;
            // },
            // onMapContextMenuEdit: function () {
            //     this.edit(this.mapContextMenuCurrentMap);
            // },
            // onMapContextMenuRemove: function () {
            //     api.eve.map.remove(this.mapContextMenuCurrentMap)
            //         .then(
            //             () => {
            //                 this.maps.eraseByObjectKey("id", this.mapContextMenuCurrentMap);
            //                 this.mapContextMenuCurrentMap = null;
            //             },
            //             error => helper.errorHandler(this, error)
            //         );
            // }
        }
    }
</script>


<style lang="scss">
    @import "./src/css/variables";
    $edit-part-width: 400;
    $threshold: 850;

    .wd-groups {
        display: flex;
        width: 100%;


        .wd-groups__info {
            transition: width 350ms, height 350ms;
            background-color: $bg-secondary;

            .wd-wgi-container {
                display: flex;
                flex-direction: column;

                & > * {
                    height: 50%;
                };
            }
        }

        .wd-groups__table {
            transition: width 350ms, height 350ms;
            width: 100%;
            height: 100%;
        }

        @media screen and (max-width: #{$threshold}px) {
            flex-direction: column;

            .wd-groups__table {
                transition: width 350ms, height 350ms;
                height: 30%;
            }

            .wd-groups__info {
                height: 70%;
            }
        }

        @for $i from 0 through 3 {
            @media screen and (min-width: #{$threshold + 1 + 300 * $i}px) {
                .wd-groups__table {
                    transition: width 350ms, height 350ms;
                    width: calc(100% - #{$edit-part-width + 150 * $i}px);
                }

                .wd-groups__info {
                    width: #{$edit-part-width + 150 * $i}px;
                }
            }
        }
    }

</style>
