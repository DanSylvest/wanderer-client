<template>
    <div>
        <div v-if="enable === true">
            <div v-if="signatures.length > 0" class="wd flex flex-justify-end">
                <md-button class="md-icon-button" @click="showFilterDialog = true">
                    <md-icon>tune</md-icon>
                </md-button>
            </div>
            <md-content v-if="filteredSignatures.length > 0">
                <md-table
                    class="wd-small-table-cell"
                    ref="signaturesTable"
                    v-model="filteredSignatures"
                    md-sort="email"
                    md-sort-order="asc"
                    md-card
                    md-fixed-header
                    md-height="600px"
                    @md-selected="onSelect"
                >
                    <md-table-row
                        ref="tableRows"
                        slot="md-table-row"
                        slot-scope="{ item }"
                        md-auto-select
                        md-selectable="multiple"
                    >
                        <md-table-cell md-label="id" md-sort-by="id" width="40" style="white-space: nowrap">{{ item.id }}</md-table-cell>
                        <md-table-cell md-label="group" md-sort-by="group">{{ item.group }}</md-table-cell>
                        <md-table-cell md-label="name" md-sort-by="name">{{ item.name }}</md-table-cell>
                        <md-table-cell md-label="created" md-sort-by="created" width="120">
                            <time-left :c-date="new Date(item.created)"></time-left>
                        </md-table-cell>
                    </md-table-row>
                </md-table>
                <transition name="c-fade">
                    <md-toolbar v-if="selected.length > 0" md-elevation="0" class="wd-table-toolbar">
                        <div class="md-toolbar-section-start">Signatures selected - {{selected.length}}</div>

                        <div class="md-toolbar-section-end">
                            <md-button class="md-icon-button" @click="onClickDeleteSignatures">
                                <md-icon>delete</md-icon>
                            </md-button>
                        </div>
                    </md-toolbar>
                </transition>

            </md-content>

            <md-empty-state
                v-if="signatures.length === 0"
                md-icon="announcement"
                md-label="No signatures"
                md-description="Just paste (ctrl + v) for update signatures.">
            </md-empty-state>

            <md-empty-state
                v-if="signatures.length !== 0 && filteredSignatures.length === 0"
                md-icon="announcement"
                md-label="All existing signatures were filtered"
                md-description="">
            </md-empty-state>

            <div style="width: 1000px;">
                <md-dialog :md-active.sync="saveSigsDialogActive">
                    <md-dialog-title>Some of signatures was not found in paste list</md-dialog-title>

                    <span style="margin: 0 20px;">Do you want to remove it?</span>

                    <md-dialog-actions>
                        <md-button class="md-primary md-accent" @click="onUpdateNonExists">Remove</md-button>
                        <md-button class="md-primary" @click="onUpdateAllSigs">Update signatures</md-button>
                    </md-dialog-actions>
                </md-dialog>
            </div>

            <input type="text" class="c-hidden-input">
        </div>

        <md-dialog :md-active.sync="showFilterDialog">
            <md-dialog-title>Filter signatures</md-dialog-title>

            <div class="wd-filter-content">
                <template v-for="item in filterTypes">
                    <md-checkbox :key="item.title" v-model="item.value">{{item.title}}</md-checkbox>
                </template>
            </div>

            <md-dialog-actions>
                <md-button class="md-primary" @click="showFilterDialog = false;">Close</md-button>
                <md-button class="md-primary" @click="showFilterDialog = false; _saveFilter()">Save</md-button>
            </md-dialog-actions>
        </md-dialog>
    </div>
</template>

<script>
    import SizeObserver from "../../../../js/env/sizeObserver";
    import TimeLeft from "../../../ui/TimeLeft";
    import api from "../../../../js/api";
    import TabObserver from "../../../../js/env/tabObserver";
    import environment from "../../../../js/core/map/environment.js";
    import exists from "../../../../js/env/tools/exists.js";
    import cookie from "../../../../js/env/cookie.js";

    export default {
        name: "Signatures",
        props: [

        ],
        components: {
            TimeLeft
        },
        data: function () {
            return {
                showFilterDialog: false,
                filterTypes: [],

                saveSigsDialogActive: false,
                signatures: [],
                filteredSignatures: [],
                selected: [],
                enable: true
            }
        },
        mounted: function () {
            this._rtid = -1;
            this._so = new SizeObserver(null, this.refresh.bind(this));
            this._to = new TabObserver();
            this._to.on("out", this._onTabOut.bind(this));
            this._to.on("in", this._onTabIn.bind(this));

            this._hiddenInput = this.$el.querySelector(".c-hidden-input");
            this._pasteHandler = this.onPaste.bind(this);
            this._hiddenInput.addEventListener("paste", this._pasteHandler);

            this._loadFilterData();
        },
        beforeDestroy: function () {
            this._hiddenInput.removeEventListener("paste", this._pasteHandler);

            this._rtid !== -1 && clearTimeout(this._rtid);
            this._rtid = -1;
            this.mapId = null;
            this.systemId = null;
            this._so.destructor();
            this._to.destructor();
        },
        methods: {
            _loadFilterData () {
                let savedFilter = cookie.get("filteredAnomalies");
                if(!savedFilter) {
                    this.filterTypes = environment.signaturesTypes.slice();
                } else {
                    this.filterTypes = JSON.parse(savedFilter);
                }
            },
            _saveFilter () {
                cookie.set("filteredAnomalies", JSON.stringify(this.filterTypes),{expires: 60 * 60 * 24 * 365 * 1000});
                this.filteredSignatures = this._applyFilter(this.signatures);
                this.refresh();
            },
            _applyFilter (signatures) {
                let filtered = signatures;
                this.filterTypes.map(filter => {
                    if(!filter.value) {
                        let title = environment.dScan.kindNames[filter.id];
                        filtered = filtered.filter(x => x.kind !== title);
                    }
                });

                return filtered;
            },
            updateHiddenInput: function () {
                this._hiddenInput.removeEventListener("paste", this._pasteHandler);

                this.$nextTick(function () {
                    this._hiddenInput = this.$el.querySelector(".c-hidden-input");
                    this._hiddenInput.addEventListener("paste", this._pasteHandler);
                }.bind(this));
            },
            refresh: function () {
                this._rtid !== -1 && clearTimeout(this._rtid);
                this._rtid = setTimeout(innerRefresh.bind(this), 10);
            },

            // Custom
            _onTabOut: function () {
                this.enable = false;
            },
            _onTabIn: function () {
                this.enable = true;
                this.updateHiddenInput();
            },
            onSelect (items) {
                this.selected = items
            },
            onClickDeleteSignatures: function (){
                let out = [];
                for (let a = 0; a < this.signatures.length; a++) {
                    let oldSig = this.signatures[a];
                    if(!this.selected.searchByObjectKey("id", oldSig.id)) {
                        out.push(oldSig);
                    }
                }
                api.eve.map.solarSystem.update(this.mapId, this.systemId, {
                    signatures: out
                });
            },

            /**
             * Just save as is signatures
             */
            onUpdateAllSigs: function () {
                api.eve.map.solarSystem.update(this.mapId, this.systemId, {
                    signatures: this.currentWaitSaveData.actualSigs.concat(this.currentWaitSaveData.forRemoveSigs)
                });
                this.saveSigsDialogActive = false;
            },
            /**
             * Remove non exists signatures from updated
             */
            onUpdateNonExists: function () {
                api.eve.map.solarSystem.update(this.mapId, this.systemId, {
                    signatures: this.currentWaitSaveData.actualSigs
                });
                this.saveSigsDialogActive = false;
            },
            load: function (_mapId, _systemId) {
                this.mapId = _mapId;
                this.systemId = _systemId;
                this.focus();
            },
            update: function (_signatures) {
                this.selected = [];
                this.signatures = _signatures;
                this.filteredSignatures = this._applyFilter(_signatures);
            },
            focus: function () {
                this._hiddenInput.focus();
            },
            onPaste: function (_event) {
                let text = _event.clipboardData.getData("text");

                let sigs = signaturesParser(text);

                if(sigs.length === 0)
                    return;

                let result = this._processSignatures(sigs);

                if(result.forRemoveSigs.length > 0) {
                    // we need remove it from updated and show dialog
                    this.saveSigsDialogActive = true;
                    this.currentWaitSaveData = result;
                } else {
                    api.eve.map.solarSystem.update(this.mapId, this.systemId, {
                        signatures: result.actualSigs
                    });
                }
            },
            _processSignatures: function (signatures) {
                // let kinds = environment.dScan.kinds.map(x => x.id);
                let groups = environment.dScan.groups.map(x => x.id);
                // let names = environment.dScan.names.map(x => x.id);

                // also we need filter not interested sigs
                let filteredSignatures = signatures/*.filter(sig => sig.kind !== "Cosmic Anomaly")*/;

                // make object for old sigs
                // as key will be sig id
                let oldSigs = Object.create(null);
                this.signatures.map(sig => oldSigs[sig.id] = sig);

                // also we make object for new sigs
                let newSigs = Object.create(null);
                filteredSignatures.map(sig => newSigs[sig.id] = sig);

                // now we need create actual sigs array
                let actualSigs = [];

                // and create removing sigs array
                let forRemoveSigs = [];

                // we need upgrade old sigs
                for(let oldSigId in oldSigs) {
                    let oldSig = oldSigs[oldSigId];

                    // if old sigs is not contains in newSigs we need mark it as removed
                    // otherwise we check
                    if(!exists(newSigs[oldSigId])) {
                        forRemoveSigs.push(oldSig);
                    } else {
                        // we take new sig and now we need check that sig has been updated
                        let newSig = newSigs[oldSigId];
                        let isNeedUpgrade = getState(groups, newSig) > getState(groups, oldSig);
                        if(isNeedUpgrade) {
                            actualSigs.push(upgradeSig(oldSig, newSig));
                        } else {
                            actualSigs.push(oldSig);
                        }

                        // remove from new sigs, because it contains in oldSigs
                        delete newSigs[oldSigId];
                    }
                }

                // now we need add new sigs
                for(let newSigId in newSigs) {
                    let newSig = newSigs[newSigId];

                    let outSig = Object.create(null);
                    outSig.id = newSig.id;
                    outSig.kind = newSig.kind;
                    outSig.group = newSig.group;
                    outSig.name = newSig.name;
                    outSig.description = "";
                    outSig.lastUpdated = new Date().toUTCString();
                    outSig.created = new Date().toUTCString();

                    actualSigs.push(outSig);
                }

                return {
                    forRemoveSigs: forRemoveSigs,
                    actualSigs: actualSigs,
                }

            }
        }
    }

    let innerRefresh = function () {
        this._rtid = -1;

        fixTable.call(this);
    };

    // this is need for correct table headers
    // and this is work
    let fixTable = function () {
        let damnedTable = this.$refs.signaturesTable;

        if(!damnedTable)
            return;

        damnedTable.setHeaderPadding();
        damnedTable.setWidth();

        // this is incredible bullshit
        let damnedRows = damnedTable.$children[0].$children[damnedTable.$children[0].$children.length - 2];

        let damnedChildren = damnedRows.$children;
        for (let a = 1; a < damnedChildren.length; a++) {
            let child = damnedChildren[a];
            child.setWidth();
        }
    }

    // also we need detect changes, we need understand that sigs has states
    // first state when kind is Cosmic Signature or Cosmic Anomaly and group is empty
    // and we should detect it for ungrade sigs
    const getState = (groups, newSig) => {
        let state = -1;
        if(newSig.group === "") {
            state = 0;
        } else if(groups.in(newSig.group) && newSig.name === "") {
            state = 1;
        } else if(groups.in(newSig.group) && newSig.name !== "" ) {
            state = 2;
        }
        return state;
    }

    const upgradeSig = (oldSig, newSig) => {
        let outSig = Object.create(null);

        outSig.id = oldSig.id;
        outSig.kind = oldSig.kind;
        outSig.group = newSig.group;
        outSig.name = newSig.name;
        outSig.description = "";
        outSig.lastUpdated = new Date().toUTCString();
        outSig.created = oldSig.created;

        return outSig;
    }

    const signaturesParser = function (_value) {
        let outArr = [];
        let rows = _value.split('\n');

        for (let a = 0; a < rows.length; a++) {
            let row = rows[a];

            let sigArrInfo = row.split("	");

            if(sigArrInfo.length !== 6) {
                continue;
            }

            outArr.push({
                id: sigArrInfo[0],
                kind: sigArrInfo[1],
                group: sigArrInfo[2],
                name: sigArrInfo[3]
            });
        }

        return outArr;
    }
</script>

<style lang="scss">
    @import "./src/css/variables";

    .wd-table-toolbar {
        padding: 0 10px;
        min-height: 17px;
        background-color: $fg-negative !important;
        border-radius: 3px;
        margin-top: 5px;
    }

    .wd-small-table-cell .md-table-cell {
        height: 35px;
    }

    .wd-filter-content {
        display: flex;
        flex-direction: column;
        padding: 10px 25px;
    }

</style>