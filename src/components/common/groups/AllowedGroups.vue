<template>
    <div class="wd-allowed-groups">
        <md-table class="wd-allowed-groups-table" v-if="groups.length > 0 && loaded" v-model="groups" md-fixed-header>
            <md-table-row
                @click="onRowClick(item.id, $event)"
                class="cursor-pointer"
                slot="md-table-row"
                slot-scope="{ item }"
            >
                <md-table-cell md-sort-by="name" md-label="Name">{{item.name}}</md-table-cell>
                <md-table-cell md-sort-by="owner"  md-label="Owner">{{item.owner}}</md-table-cell>
                <md-table-cell md-sort-by="description"  md-label="Description">{{item.description}}</md-table-cell>
            </md-table-row>
        </md-table>

        <md-empty-state
            v-if="groups.length === 0 && loaded"
            md-icon="power_off"
            md-label="Not any allowed groups"
            md-description="Unfortunately no one of your characters have not been added to any groups."
        />

        <AllowedDialog ref="allowedDialogRef" ></AllowedDialog>
    </div>
</template>

<script>
    import api from "../../../js/api";
    import AllowedDialog from "./AllowedDialog";
    import helper from "../../../js/utils/helper.js";

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
            this._isMounted = true;
            this.$nextTick().then(this._loadData);
        },
        beforeDestroy() {
            this._isMounted = false;
        },
        methods: {
            _loadData: function () {
                if(!this._isMounted)
                    return;

                api.eve.group.allowedGroups()
                    .then(
                        data => {
                            this.groups = data;
                            this.loaded = true;
                        },
                        err => helper.errorHandler(this, err)
                    );
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
            height: calc(100vh - 60px);

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
                background-color: $bg-secondary
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
</style>
