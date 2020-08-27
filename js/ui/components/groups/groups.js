(function () {
    var componentId = "ui/components/groups/groups";

    var deps = [
        "env/query",

        "ui/components/groups/allowedGroups",
        "ui/components/groups/ownGroups",
    ];

    define(componentId, deps, function () {
        var query = require("env/query");

        var template = `

<div>
       
    <md-tabs @md-changed="onTabChange">
        <md-tab id="tab-own" md-label="Own groups" exact>
            <c-own-groups ref="ownGroupsRef" ></c-own-groups>
        </md-tab>
        
        <md-tab id="tab-allowed" md-label="Allowed groups">
            <c-allowed-groups ref="allowedGroupsRef"></c-allowed-groups>
        </md-tab>
       
    </md-tabs>
           
</div>
        
`;

        Vue.component("groups", {
            props: [

            ],
            data: function () {
                return {
                    groups: [],
                }
            },
            template: template,
            mounted: function () {
                this._loadData();
            },
            methods: {
                _loadData: function () {
                    setTimeout(function(){
                        this.$refs.ownGroupsRef.$on("rowClicked", this.onRowClick);
                        this.onTabChange("tab-own");
                    }.bind(this), 100)
                },
                close: function () {

                },
                refresh: function () {

                },
                getTabRoute: function (_type) {
                    var obj = query.searchObject();

                    obj.subItem = _type;

                    return query.toString(obj);
                },
                onTabChange: function (_type) {
                    switch (_type) {
                        case "tab-own":
                            this.$refs.ownGroupsRef.load();
                            break;
                        case "tab-allowed":
                            this.$refs.allowedGroupsRef.load();
                            break;
                    }
                }
            }
        });

    });
})(window);

