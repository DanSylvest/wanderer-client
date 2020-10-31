<template>
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
                groups: [],
            }
        },
        mounted: function () {

        },
        methods: {
            _loadData: function () {
                api.eve.group.allowedGroups().then(function(_groups){
                    this.groups = _groups;
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
