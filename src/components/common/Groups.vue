<template>
    <div>
        <md-tabs @md-changed="onTabChange">
            <md-tab id="tab-own" md-label="Own groups" exact>
                <OwnGroups ref="ownGroupsRef" ></OwnGroups>
            </md-tab>

            <md-tab id="tab-allowed" md-label="Allowed groups">
                <AllowedGroups ref="allowedGroupsRef"></AllowedGroups>
            </md-tab>

        </md-tabs>
    </div>
</template>

<script>
    import query from "../../js/env/query";
    import OwnGroups from "./groups/OwnGroups";
    import AllowedGroups from "./groups/AllowedGroups";

    export default {
        name: "Groups",
        components: {
            OwnGroups, AllowedGroups
        },
        props: [],
        data: function () {
            return {
                groups: [],
            }
        },
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
                let obj = query.searchObject();

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
    }
</script>

