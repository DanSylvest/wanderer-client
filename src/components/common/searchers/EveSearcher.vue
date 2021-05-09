<template>
    <div class="wd-eve-search wd fs">
        <div class="wd flex flex-align-center box-sizing padding-vertical-primary">
            <md-autocomplete
                v-model="currentValue"
                :md-options="searchList"
                md-layout="box"
                @md-selected="currentValue = $event.name; onElementSelected($event)"
                @md-changed="onElementChanged"

                md-dense
                :disabled="!serverStatus"
            >

                <template v-if="serverStatus">
                    <label class="wd-search-placeholder">
                        <md-icon>search</md-icon>
                        <span>Search {{lType}}s</span>
                    </label>
                </template>
                <template v-else>
                    <label class="wd-search-placeholder">
                        <md-icon class="wd-color-negative">wifi_tethering_off</md-icon>
                        <span>TQ has been down and search not work</span>
                    </label>
                </template>

                <template slot="md-autocomplete-item" slot-scope="{ item, term }">
                    <img class="md-icon" :src="searchItemIcon(item)" style="margin-right: 10px;" alt=""/>
                    <md-highlight-text :md-fuzzy-search="false" :md-term="term">{{ item.name }}</md-highlight-text>
                </template>

                <template slot="md-autocomplete-empty" slot-scope="{ term }">
                    Such {{lType}} {{ term }} not exists!
                </template>
            </md-autocomplete>

            <md-button
                class="md-raised md-accent"
                :disabled="buttonDisabled"
                @click="onElementAddButtonClicked"
            >
                <md-icon>add</md-icon>
            </md-button>
        </div>

        <transition name="fade">
            <div v-if="elements.length > 0" class="wd fs">
                <wd-table
                    :rows="elements"
                    @selected="selected = $event"
                    selectable
                    class="wd padding-primary fs"
                >
                    <template v-slot:toolbar>
                        <div class="md-toolbar-section-start wd-capital-letter">{{lType}}s</div>
                    </template>

                    <template v-slot:alternate-toolbar>
                        <div class="md-toolbar-section-start wd-capital-letter">{{lType}}s selected - {{selected.length}}</div>

                        <div class="md-toolbar-section-end">
                            <md-button class="md-icon-button" @click="onClickDelete">
                                <md-icon>delete</md-icon>
                            </md-button>
                        </div>
                    </template>

                    <template v-slot:header >
                        <table-header-cell sortable id="name" alignment="start" class="wd-capital-letter">{{lType}}</table-header-cell>
                    </template>

                    <template v-slot:row="{row}">
                        <table-cell id="name" class="wd fs padding-horizontal-primary" alignment="start">
                            {{row.name}}
                        </table-cell>
                    </template>
                </wd-table>
            </div>
        </transition>

        <md-empty-state
            v-show="elements.length === 0 && lItems.length === 0"
            :md-icon="emptyStateIcon"
            :md-label="emptyStateLabel"
            :md-description="emptyStateDescription"
        />

    </div>
</template>

<script>
    import api from "../../../js/api";
    import EveSearchMixin from "../../mixins/eveSearch.js";
    import helper from "../../../js/utils/helper.js";
    import WdTable from "../../ui/Table/WdTable.vue";
    import TableCell from "../../ui/Table/TableCell.vue";
    import TableHeaderCell from "../../ui/Table/TableHeaderCell.vue";

    export default {
        name: "EveSearcher",
        components: {WdTable, TableCell, TableHeaderCell},
        mixins: [EveSearchMixin],
        props : {
            type: {
                type: String,
                default: "character"
            },
        },
        data: function () {
            return {
                lType: this.type,
                selected: []
            }
        },
        methods: {
            _searchRequest(match) {
                switch (this.lType) {
                    case "character":
                        return api.eve.character.fastSearch({type: "byAll", match: match});
                    case "corporation":
                        return api.eve.corporation.fastSearch({match: match});
                    case "alliance":
                        return api.eve.alliance.fastSearch({match: match});
                }
            },
            searchItemIcon(item) {
                switch (this.lType) {
                    case "character":
                        return 'https://images.evetech.net/characters/' + item.id + '/portrait';
                    case "corporation":
                        return 'https://images.evetech.net/corporations/' + item.id + '/logo';
                    case "alliance":
                        return 'https://images.evetech.net/alliances/' + item.id + '/logo';
                }

            },
            _loadItemsRequest () {
                switch (this.lType) {
                    case "character":
                        return api.eve.character.publicInfo(this.lItems);
                    case "corporation":
                        return api.eve.corporation.info(this.lItems);
                    case "alliance":
                        return api.eve.alliance.info(this.lItems);
                }
            },
            _loadItems() {
                EveSearchMixin.methods._loadItems();

                if (this.lItems.length > 0) {
                    this._loadItemsRequest()
                        .then(
                            x => this._loaded(x),
                            err => helper.errorHandler(this, err)
                        )
                }
            },
            onClickDelete () {
                this.elements = this.elements.filter(el => this.selected.searchByObjectKey("id", el.id) == null);
                this.$emit("changed", this.elements.map(x => x.id));
            }
        },
        computed: {
            emptyStateIcon () {
                return emptyStateIcons[this.lType];
            },
            emptyStateLabel () {
                return `Add ${this.lType}s`
            },
            emptyStateDescription () {
                return `In this group is not added any ${this.lType}. Here you can search ${this.lType} and attach them to group.`
            }
        }
    }

    const emptyStateIcons = {
        character: "group_add",
        corporation: "group_add",
        alliance: "public",
    }
</script>

<style lang="scss">
    @import "./src/css/variables";

    .wd-eve-search {
        display: grid;
        grid-template-rows: auto calc(100% - 68px);

        .wd-search-placeholder {
            display: flex;
            justify-content: flex-start;
            align-items: center;

            & > *:not(:last-child) {
                margin-right: 10px;
            }
        }

        .md-autocomplete.md-field {
            margin: 0;
        }
    }
</style>