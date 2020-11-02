<template>
    <div class="wd-allowed-groups">
        <md-table class="wd-allowed-groups-table" v-if="groups.length > 0 && loaded">
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

        <md-empty-state
                v-if="groups.length === 0 && loaded"
                md-icon="power_off"
                md-label="Not any allowed groups"
                md-description="Unfortunately no one of your characters have not been added to any groups."
        >
        </md-empty-state>

<!--        <div class="wd-allowed-list">-->
<!--            <div class="wd-allowed-item wd flex">-->
<!--                <div></div>-->
<!--                <div></div>-->
<!--            </div>-->
<!--        </div>-->

        <AllowedDialog ref="allowedDialogRef" ></AllowedDialog>
    </div>
</template>

<script>
    import api from "../../../js/api";
    import AllowedDialog from "./AllowedDialog";

    export default {
        name: "AllowedGroups",
        props: [],
        components: {
            AllowedDialog
        },
        data: function () {
            return {
                loaded: false,
                groups: [],
            }
        },
        mounted: function () {

        },
        methods: {
            _loadData: function () {
                api.eve.group.allowedGroups().then(function(_groups){
                    this.groups = _groups;
                    this.loaded = true;
                    // eslint-disable-next-line no-unused-vars
                }.bind(this), function(_err){
                    // eslint-disable-next-line no-debugger
                    debugger
                }.bind(this))
            },
            load: function () {
                this._loadData();
            },
            close: function () {

            },
            onRowClick: function (_groupId/*, _event*/) {
                this.$refs.allowedDialogRef.show(_groupId);
            }
        }
    }
</script>

<style lang="scss">
    @import "./src/css/variables";

    .wd-allowed-groups{

        & > .wd-allowed-groups-table {
            &.md-card.md-table,
            &.md-table.md-theme-default .md-table-content,
            &.md-table.md-theme-default .md-table-alternate-header {
                background-color: $bg-secondary;
            }
        }
    }
</style>
