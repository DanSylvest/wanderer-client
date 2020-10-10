(function () {
    var componentId = "ui/components/groups/allowedGroups";

    var deps = [
        "ui/components/groups/allowedDialog"
    ];

    define(componentId, deps, function () {

        var template = `

<div>
       
    <md-table class="c-custom-table">
        <md-table-row>
            <md-table-head style="width: 150px">Name</md-table-head>
            <md-table-head style="width: 180px">Owner</md-table-head>
            <md-table-head>Description</md-table-head>
        </md-table-row>
        
        <md-table-row @click="onRowClick(item.id, $event)" class="cursor-pointer" v-for="item in groups" :key="item.id">
            <md-table-cell>{{item.name}}</md-table-cell>
            <md-table-cell>{{item.owner}}</md-table-cell>
            <md-table-cell>{{item.description}}</md-table-cell>
        </md-table-row>
    </md-table>
    
    <c-allowed-dialog ref="allowedDialogRef" ></c-allowed-dialog>
    
</div>
        
`;
        Vue.component("cAllowedGroups", {
            props: [

            ],
            data: function () {
                return {
                    groups: [],
                }
            },
            template: template,
            mounted: function () {

            },
            methods: {
                _loadData: function () {
                    api.eve.group.allowedGroups().then(function(_groups){
                        this.groups = _groups;
                    }.bind(this), function(_err){
                        debugger;
                    }.bind(this))
                },
                load: function () {
                    this._loadData();
                },
                close: function () {

                },
                onRowClick: function (_groupId, _event) {
                    this.$refs.allowedDialogRef.show(_groupId);
                }
            }
        });

    });
})(window);
