<template>
    <div class="wd-alliances-search">
        <div class="wd relative flex flex-align-center box-sizing padding-vertical-primary">
            <md-autocomplete
                v-model="currentValue"
                :md-options="searchList"
                md-layout="box"
                @md-selected="currentValue = $event.name; onElementSelected($event)"
                @md-changed="onElementChanged"
                @md-opened="onACOpened"
                md-dense
                :disabled="!this.$store.state.eveServerStatus.online"
            >

                <template v-if="this.$store.state.eveServerStatus.online">
                    <label class="wd-search-placeholder">
                        <md-icon>search</md-icon>
                        <span>Search alliances</span>
                    </label>
                </template>
                <template v-else>
                    <label class="wd-search-placeholder">
                        <md-icon class="wd-color-negative">wifi_tethering_off</md-icon>
                        <span>TQ has been down and search not work</span>
                    </label>
                </template>


                <template slot="md-autocomplete-item" slot-scope="{ item, term }">
                    <template v-if="item.err">
                        <md-highlight-text :md-fuzzy-search="false" :md-term="term">{{ item.message }}</md-highlight-text>
                    </template>
                    <template v-else>
                        <img class="md-icon" :src="'https://images.evetech.net/alliances/' + item.id + '/logo'" style="margin-right: 10px;"/>
                        <md-highlight-text :md-fuzzy-search="false" :md-term="term">{{ item.name }}</md-highlight-text>
                    </template>
                </template>

                <template slot="md-autocomplete-empty" slot-scope="{ term }">
                    Such alliance {{ term }} not exist!
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

        <md-table v-show="elements.length > 0" class="wd-alliances-search-table" style="height: 400px" md-card @md-selected="onRowsSelected" v-model="elements">
            <md-table-toolbar>
                <h1 class="md-title">Alliances is allowed to see the map</h1>
            </md-table-toolbar>

            <md-table-toolbar slot="md-table-alternate-header" slot-scope="{ count }">
                <div class="md-toolbar-section-start">Alliances selected - {{count}}</div>

                <div class="md-toolbar-section-end">
                    <md-button class="md-icon-button" @click="onDeleteRows">
                        <md-icon>delete</md-icon>
                    </md-button>
                </div>
            </md-table-toolbar>

            <md-table-row slot-scope="{ item }" class="wd cursor-pointer" md-auto-select md-selectable="multiple" slot="md-table-row">
                <md-table-cell md-label="Name">{{item.name}}</md-table-cell>
            </md-table-row>
        </md-table>

        <md-empty-state
            v-show="elements.length === 0"
            md-icon="public"
            md-label="Add alliances"
            md-description="In this group is not added any alliances. Here you can search alliances and attach them to group."
        />
    </div>
</template>

<script>
    import api from "../../../js/api";
    import SpamFilter from "../../../js/env/spamFilter";
    import CustomPromise from "../../../js/env/promise";
    import cache from "../../../js/cache/cache.js";
    import helper from "../../../js/utils/helper.js";

    export default {
        name: "AlliancesSearcher",
        props: [],
        data: function () {
            return {
                currentValue: "",
                elements: [],
                buttonDisabled: true,
                searchList: []
            }
        },
        beforeDestroy() {
            this.unsubscribeOnline && this.unsubscribeOnline();
            this.unsubscribeOnline = null;
        },
        beforeMount() {
            this.unsubscribeOnline = cache.serverStatus.subscribe();
        },
        mounted: function () {
            this._passChange = false;
            this._spamFilter = new SpamFilter(this._makeSearch.bind(this), 500);
        },
        methods: {
            onACOpened: function (_event){
                this.onElementChanged(_event);

                setTimeout(function () {
                    window.dispatchEvent(new Event('resize'));
                }.bind(this), 10)
            },
            onElementSelected: function (_event) {
                this._passChange = true;
                this.formDefaultGroupItem = _event;
                this.buttonDisabled = false;
            },
            onElementChanged: function (/*_event*/) {
                if(this._passChange){
                    this._passChange = false;
                    return;
                }

                if(this.currentValue.length > 2) {
                    let pr = new CustomPromise();
                    this.searchList = pr.native
                    this._spamFilter.call(this.currentValue, pr);
                } else {
                    this.searchList = [];
                }
            },
            onElementAddButtonClicked: function (/*_event*/) {
                if(!this.elements.searchByObjectKey("id", this.formDefaultGroupItem.id)) {
                    this.elements.push(this.formDefaultGroupItem);
                    this.buttonDisabled = true;
                    this.currentValue = "";
                }
            },
            onRowsSelected: function (_selectedGroups) {
                this.elementsSelected = _selectedGroups;
            },
            onDeleteRows: function (/*_selectedGroups*/) {
                for (let a = 0; a < this.elementsSelected.length; a++) {
                    this.elements.eraseByObjectKey("id", this.elementsSelected[a].id);
                }
                this.elementsSelected = [];
            },
            _makeSearch: function (_match, _pr) {
                api.eve.alliance.fastSearch({match: _match})
                    .then(
                        _result => _pr.resolve(_result),
                        err => helper.errorHandler(this, err)
                    )
            },
            getElements: function () {
                return this.elements;
            },
            setElements: function (_elements) {
                this.elements = _elements;
            }
        }
    }
</script>

<style lang="scss">
    @import "./src/css/variables";

    .wd-alliances-search {
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

        .wd-alliances-search-table {
            height: 400px;

            &.md-card.md-table,
            &.md-table.md-theme-default .md-table-content,
            &.md-table.md-theme-default .md-table-alternate-header {
                background-color: $bg-secondary;
            }
        }
    }
</style>