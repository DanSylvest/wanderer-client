(function () {
    var componentId = "ui/components/groups/ownGroups";

    var deps = [
        "ui/components/cContextMenu",
        "ui/components/groups/groupEditDialog",
    ];

    define(componentId, deps, function () {
        var template = `

<div>
    <div style="border-bottom: 1px solid #ccc;padding-bottom: 10px;padding-top: 5px;">
        <md-button class="md-dense md-primary md-raised" @click="onShowCreateDialog">
            <md-icon>add</md-icon> 
            <span style="vertical-align: middle">Add group</span>
        </md-button>
    </div>
    
    <md-table>
        <md-table-row>
            <md-table-head style="width: 150px">Name</md-table-head>
            <md-table-head style="width: 180px">Owner</md-table-head>
            <md-table-head>Description</md-table-head>
        </md-table-row>
        
        <md-table-row @contextmenu="onContextMenu(item.id, $event)" @click="onRowClick(item.id, $event)" class="cursor-pointer" v-for="item in groups">
            <md-table-cell>{{item.name}}</md-table-cell>
            <md-table-cell>{{item.owner}}</md-table-cell>
            <md-table-cell>{{item.description}}</md-table-cell>
        </md-table-row>
    </md-table>
    
    <c-group-edit-dialog ref="groupsEditDialogRef" ></c-group-edit-dialog>
    
    <c-context-menu :c-activated.sync="groupContextMenuEnable" :c-offset-x="contextOffsetX" :c-offset-y="contextOffsetY">
        <c-context-menu-item c-title="Edit" c-icon="edit" @click="onGroupContextMenuEdit" />
        <c-context-menu-item c-title="Remove" c-icon="delete" @click="onGroupContextMenuRemove" />
    </c-context-menu>

</div>
        
`;

        Vue.component("cOwnGroups", {
            props: [

            ],
            data: function () {
                return {
                    groups: [],
                    groupContextMenuEnable: false,
                    contextOffsetX: 0,
                    contextOffsetY: 0
                }
            },
            template: template,
            mounted: function () {

            },
            methods: {
                _loadData: function () {
                    api.eve.group.list().then(function(_groups){
                        this.groups = _groups;
                    }.bind(this), function(_err){
                        debugger;
                    }.bind(this))
                },
                close: function () {

                },
                load: function () {
                    this._loadData();
                },
                onRowClick: function (_groupId, _event) {
                    this.edit(_groupId);
                },
                onShowCreateDialog: function () {
                    this.add();
                },
                find: function (_groupId) {
                    return this.groups.searchByObjectKey("id", _groupId);
                },
                add: function ( ){
                    this.$refs.groupsEditDialogRef.show().then(function(_options){
                        this.groups.push({
                            id           : _options.id,
                            name         : _options.name,
                            owner        : _options.owner,
                            description  : _options.description,
                            characters   : _options.characters,
                            corporations : _options.corporations,
                            alliances    : _options.alliances,
                        });
                    }.bind(this), function(){
                        // do nothing
                    }.bind(this));
                },
                edit: function (_groupId) {
                    var item = this.find(_groupId);

                    this.$refs.groupsEditDialogRef.show({
                        id           : item.id,
                        name         : item.name,
                        description  : item.description,
                        characters   : item.characters,
                        corporations : item.corporations,
                        alliances    : item.alliances,
                    }).then(function(_options){
                        item.name = _options.name;
                        item.description = _options.description;
                        item.characters = _options.characters;
                        item.corporations = _options.corporations;
                    }.bind(this), function(){
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
                    api.eve.group.remove(this._currentContextGroup).then(function(){
                        this.groups.eraseByObjectKey("id", this._currentContextGroup);
                        this._currentContextGroup = null;
                    }.bind(this), function(_err){
                        // do nothing
                        // TODO maybe need show small snackbar
                        // debugger;
                        alert(_err);
                    }.bind(this));
                }
            }
        });

    });
})(window);

