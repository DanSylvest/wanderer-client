<template>
    <div class="wd-allowed-dialog wd fs">
        <div class="wd-allowed-dialog__content padding-primary wd fs">
            <wd-table
                v-if="loadedGroupAC"
                :rows="allowedCharacters"
                @row-clicked="onRowClicked"
                @selected="onSelected"
                selectable
            >
                <template v-slot:toolbar>
                    <div class="md-toolbar-section-start">
                        Characters tracking list
                    </div>
                </template>

                <template v-slot:alternate-toolbar>
                    <div class="md-toolbar-section-start">
                        <md-switch v-model="trackingForSelected" @change="onTrackingForSelected">Set tracking for selected</md-switch>
                    </div>
                </template>

                <template v-slot:header >
                    <table-header-cell id="avatar" />
                    <table-header-cell sortable id="name" width-policy="1fr" alignment="start">Character</table-header-cell>
                    <table-header-cell sortable id="status">Track status</table-header-cell>
                </template>

                <template v-slot:row="{row}">
                    <table-cell id="avatar" class="wd padding-vertical-small">
                        <img class="small-image" :src="'https://images.evetech.net/characters/' + row.id + '/portrait'" style="margin-right: 10px;" alt=""/>
                    </table-cell>
                    <table-cell id="name" class="wd fs padding-horizontal-primary" alignment="start">
                        <character-with-ticker :character-id="row.id" />
                    </table-cell>
                    <table-cell id="status" class="wd padding-horizontal-primary">
                        <md-switch v-model="row.track" class="md-primary wd-small-switch" @change="isDirty = true"></md-switch>
                    </table-cell>
                </template>
            </wd-table>
        </div>

        <div class="wd md-content padding-primary">
            <div class="md-toolbar-section-end">
                <md-button :disabled="!enableSaveButton" class="md-primary md-raised" @click="onEditSubmit">Save</md-button>
            </div>
        </div>
    </div>
</template>

<script>
    import api from "../../../js/api";
    import helper from "../../../js/utils/helper.js";
    import GroupAllowedCharactersMixin from "../../mixins/groupAllowedCharacters.js";
    import WdTable from "../../ui/Table/WdTable.vue";
    import TableCell from "../../ui/Table/TableCell.vue";
    import TableHeaderCell from "../../ui/Table/TableHeaderCell.vue";
    import CharacterWithTicker from "../Characters/CharacterWithTicker.vue";

    export default {
        name: "AllowedDialog",
        mixins: [GroupAllowedCharactersMixin],
        components: {WdTable, TableCell, TableHeaderCell, CharacterWithTicker},
        props: {},
        data: function () {
            return {
                isDirty: false,
                isBusy: false,
                trackingForSelected: false,
                selectedRows: []
            }
        },
        computed: {
            enableSaveButton () {
                return this.isDirty && !this.isBusy;
            }
        },
        methods: {
            onRowClicked(event) {
                this.isDirty = true;
                event.data.track = !event.data.track;
            },
            onEditSubmit () {
                this.isBusy = true;

                api.eve.group.updateAllowedCharacters(this.lGroupId, this.allowedCharacters)
                    .then(
                        () => {
                            this.isBusy = false;
                            this.isDirty = false;
                        },
                        err => helper.errorHandler(this, err)
                    )
            },
            onSelected (selected) {
                this.selected = selected;
            },
            onTrackingForSelected () {
                this.isDirty = true;

                this.selected.map(x => {
                    let obj = this.allowedCharacters.searchByObjectKey("id", x.id);
                    obj.track = this.trackingForSelected
                })
            },
            onLoadedGroupAC (data) {
                this.loadedGroupAC = true;
                this.allowedCharacters = data;
            },
        }
    }
</script>

<style lang="scss">
    @import "./src/css/variables";

    .wd-allowed-dialog {
        display: grid;
        grid-template-rows: calc(100% - 70px) 1fr;

        .md-dialog-container {
            height: 80%;
        }

        .wd-allowed-dialog__content {
            /*padding: 0 20px;*/
        }

        .small-image {
            width: 40px;
            height: 40px;
            min-width: 40px;
            min-height: 40px;
            max-width: 40px;
            max-height: 40px;

            border-radius: 50%;
            border-width: 2px;
            border-style:  solid;
            border-color: $border-color-primary-5-2;
            background-color: $bg-transparent;
            margin-left: 10px;
            margin-right: 10px;
        }

        .md-switch {
            margin-right: 0 !important;
        }
    }
</style>

