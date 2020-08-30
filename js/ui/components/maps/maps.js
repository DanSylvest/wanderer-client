(function () {
    var componentId = "ui/components/maps/maps";

    var deps = [
        "ui/components/cContextMenu",
        "ui/components/maps/mapsEditDialog"
    ];

    define(componentId, deps, function () {

        var template = `

<div>    
    <div style="border-bottom: 1px solid #ccc;padding-bottom: 10px;padding-top: 5px;">
        <md-button class="md-dense md-primary md-raised" @click="add">
            <md-icon>add</md-icon> 
            <span style="vertical-align: middle">Add map</span>
        </md-button>
    </div>
    
    <div class="" >
        <md-table class="c-custom-table">
            <md-table-row>
                <md-table-head style="width: 30px" class="tac">Public</md-table-head>
                <md-table-head style="width: 150px">Name</md-table-head>
                <md-table-head style="width: 180px">Owner</md-table-head>
                <md-table-head>Description</md-table-head>
            </md-table-row>
            
            <md-table-row @contextmenu="onContextMenu(map.id, $event)" @click="onMapRowClick(map.id, $event)" class="cursor-pointer" v-for="map in maps">            
                <md-table-cell>
                    <md-icon>{{!Boolean.fromString(map.private) ? "lock_open" : "lock"}}</md-icon>
                </md-table-cell>
                <md-table-cell>{{map.name}}</md-table-cell>
                <md-table-cell>{{map.owner}}</md-table-cell>
                <md-table-cell>{{map.description}}</md-table-cell>
            </md-table-row>
        </md-table>
    </div>
       
    <c-maps-edit-dialog ref="mapsEditDialogRef"></c-maps-edit-dialog>
       
    <c-context-menu :c-activated.sync="mapContextMenuEnable" :c-offset-x="contextOffsetX" :c-offset-y="contextOffsetY">
        <c-context-menu-item c-title="Edit" c-icon="edit" @click="onMapContextMenuEdit" />
        <c-context-menu-item c-title="Remove" c-icon="delete" @click="onMapContextMenuRemove" />
    </c-context-menu>

</div>

`;

        Vue.component("maps", {
            props: [

            ],
            data: function () {
                return {
                    maps: [],
                    groups: [],

                    mapContextMenuEnable: false,
                    contextOffsetX: 0,
                    contextOffsetY: 0,
                }
            },
            template: template,
            mounted: function () {
                this._loadData();
            },
            methods: {
                close: function () {

                },
                refresh: function () {

                },
                _loadData: function ( ) {
                    var prarr = [];

                    prarr.push(api.eve.group.list());
                    prarr.push(api.eve.map.list());

                    Promise.all(prarr).then(function(_arr){
                        // debugger
                        this.groups = _arr[0];
                        this.maps = _arr[1];
                    }.bind(this), function(_err){
                        debugger; // todo
                    }.bind(this));
                },
                edit: function (_mapId) {
                    var mapItem = this.maps.searchByObjectKey("id", _mapId);
                    // var groupItem = this.groups.searchByObjectKey("id", mapItem.guestGroup);

                    this.$refs.mapsEditDialogRef.show({
                        mapId : mapItem.id,
                        name : mapItem.name,
                        isPrivate : Boolean.fromString(mapItem.private),
                        description : mapItem.description,
                        groups : mapItem.groups,
                    }).then(function(_options){
                        mapItem.name = _options.name;
                        mapItem.description = _options.description;
                        mapItem.private = _options.isPrivate;
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
                            private     : _options.isPrivate,
                            groups      : _options.groups,
                        });
                    }.bind(this), function(){
                        // do nothing
                    }.bind(this));
                },
                onMapRowClick: function (_mapId, _event) {
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
                    api.eve.map.remove(this.mapContextMenuCurrentMap).then(function(){
                        this.maps.eraseByObjectKey("id", this.mapContextMenuCurrentMap);
                        this.mapContextMenuCurrentMap = null;
                    }.bind(this), function(_err){
                        // do nothing
                        // TODO maybe need show small snackbar
                        debugger;
                    }.bind(this));
                }
            }
        });

    });
})(window);

