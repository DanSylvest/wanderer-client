<template>
    <div>
        <popup
            @mousedown="focus" @mouseup="focus"
            ref="infoPanel"
            :c-activated.sync="showPopup"
            :c-width="panelWidth"
            :c-height="panelHeight"
            :c-title="panelTitle"
            :c-offset-x="10"
            :c-offset-y="45"
            c-horizontal-alignment="right"
            @c-closed="onPopupClosed"
            @mounted="onPopupMounted"
            userClass="wd-system-panel wd-layout-secondary"
        >
            <md-tabs ref="tabs" v-if="enabled" @md-changed="onTabChange" class="fh" >
                <md-tab id="tab-overview" md-label="Overview"  exact>
                    <overview
                        :map-id="mapId"
                        :is-compact="isCompact"
                        v-if="enabled"
                        ref="systemInfo"
                        @cupdated="onOverviewUpdated"
                        @changed="onOverviewChanged"
                        @highlight-route="onHighlightRoute"
                        @hubs-updated="onHubsUpdated"
                    ></overview>
                </md-tab>

                <md-tab id="tab-signatures" md-label="Signatures">
                    <signatures v-if="enabled" ref="signatures"></signatures>
                </md-tab>

                <md-tab id="tab-online" md-label="Online">
                    <md-empty-state
                        md-icon="miscellaneous_services"
                        md-label="In progress..."
                        md-description="This tab in developing. Soon it will be available.">
                    </md-empty-state>
                </md-tab>
            </md-tabs>
        </popup>

    </div>
</template>

<script>
    import extend from "../../../js/env/tools/extend";
    import printf from "../../../js/env/tools/printf";
    import SizeObserver from "../../../js/env/sizeObserver";
    import Popup from "../../ui/Popup";
    import Overview from "./systemPanel/Overview";
    import Signatures from "./systemPanel/Signatures";
    import api from "../../../js/api.js";
    import helper from "../../../js/utils/helper.js";

    export default {
        name: "SystemPanel",
        props: [

        ],
        components: {
            Popup,
            Overview,
            Signatures
        },
        data: function () {
            return {
                enabled: false,
                showPopup: false,
                panelWidth: 200,
                panelHeight: 200,
                panelTitle: "Default info title",
                currentTab: "tab-overview",
                sizeDetectorClass: "",
                isCompact: false
            }
        },
        mounted: function () {
            this.currentSystemData = Object.create(null);
            this._rtid = -1;
            this.mapId = null;
            this.systemId = null;
            this._so = new SizeObserver(null, this.refresh.bind(this));
        },
        beforeDestroy: function () {
            this.showPopup = false;
            this._rtid !== -1 && clearTimeout(this._rtid);
            this._rtid = -1;
            this.mapId = null;
            this.systemId = null;
            this._so.destructor();
            this._so = null;
            this.enabled = false;
            this.currentSystemData = Object.create(null);
            this.panelTitle = "";
            window.focus();
        },
        methods: {
            onHighlightRoute(route) {
                this.$emit("highlight-route", route);
            },
            onHubsUpdated(hubs) {
                this.$emit("hubs-updated", hubs);
            },
            onOverviewUpdated: function () {
                this.$nextTick(function () {
                    this.$refs.tabs.setIndicatorStyles();
                }.bind(this));
            },
            onOverviewChanged (data) {
                let isValid = false;
                for (let key in data) {
                    switch (key) {
                        case "description":
                            isValid = true;
                            break;
                        default:
                            throw `Exception: "Trying to update unavailable attribute (${key})."`;
                    }
                }

                if(isValid) {
                    api.eve.map.solarSystem.update(this.mapId, this.systemId, data)
                        .then(
                            helper.dummy,
                            err => helper.errorHandler(this, err)
                        );
                }
            },

            refresh: function () {
                if(!this.showPopup)
                    return;

                this._rtid !== -1 && clearTimeout(this._rtid);
                this._rtid = setTimeout(innerRefresh.bind(this), 10);
            },

            // Custom
            onPopupClosed: function () {
                this.enabled = false;

                this.$emit("closed");
            },
            onPopupMounted: function () {


            },
            show: function (_mapId, _systemId) {
                this.enabled = true;

                this.mapId = _mapId;
                this.systemId = _systemId;

                if(this.$refs.signatures) {
                    this.$refs.signatures.load(this.mapId, this.systemId);
                }

                this.focus();
            },
            hide: function () {
                this.showPopup && (this.showPopup = false);
                this._rtid !== -1 && clearTimeout(this._rtid);
                this._rtid = -1;
                this.enabled = false;
                window.focus();
            },
            reload: function (_data) {
                this.currentSystemData = _data;
                this.__update();
            },
            update: function (_data) {
                this.currentSystemData = extend(this.currentSystemData, _data);
                this.__update();
            },
            __update: function () {
                this.showPopup = true;
                this.panelTitle = printf("%s - (%s)", this.currentSystemData.name, this.systemId);

                switch (this.currentTab) {
                    case "tab-overview":
                        this.$refs.systemInfo.update(this.mapId, this.currentSystemData);
                        break;
                    case "tab-signatures":
                        this.$refs.signatures.update(this.currentSystemData.signatures);
                        break;
                }
            },

            onTabChange: function (_tabName) {
                if(_tabName === undefined)
                    return;

                this.currentTab = _tabName;

                switch (_tabName) {
                    case "tab-overview":
                        this.$refs.systemInfo.update(this.mapId, this.currentSystemData);
                        break;
                    case "tab-signatures":
                        this.$refs.signatures.load(this.mapId, this.systemId);
                        this.$refs.signatures.update(this.currentSystemData.signatures);
                        break;

                }
                this.refresh();
            },
            focus: function () {
                this.$nextTick(function () {
                    switch (this.currentTab) {
                        case "tab-signatures":
                            this.$refs.signatures.focus();
                            break;
                        default:
                            window.focus();
                    }
                }.bind(this));

            },
            systemRemoved (data) {
                this.$refs.systemInfo && this.$refs.systemInfo.systemRemoved(data);
            },
            systemAdded (data) {
                this.$refs.systemInfo && this.$refs.systemInfo.systemAdded(data);
            },
            linkRemoved (data) {
                this.$refs.systemInfo && this.$refs.systemInfo.linkRemoved(data);
            },
            linkUpdated (data) {
                this.$refs.systemInfo && this.$refs.systemInfo.linkUpdated(data);
            },
            linkAdded (data) {
                this.$refs.systemInfo && this.$refs.systemInfo.linkAdded(data);
            },
            addHub (solarSystemId) {
                this.$refs.systemInfo && this.$refs.systemInfo.addHub(solarSystemId);
            },
            removeHub (solarSystemId) {
                this.$refs.systemInfo && this.$refs.systemInfo.removeHub(solarSystemId);
            },
        }
    }

    const innerRefresh = function () {
        this._rtid = -1;

        let bounds = document.body.getBoundingClientRect();
        this.panelWidth = bounds.width * 0.4 < 400 ? 400 : bounds.width * 0.45;
        this.panelHeight = bounds.height - 55;

        this.isCompact = bounds.width <= 1400;

        switch(this.currentTab) {
            case "tab-overview":
                this.$refs.systemInfo.refresh();
                break;
            case "tab-signatures":
                this.$refs.signatures.refresh();
                break;
        }
    };
</script>

<style lang="scss">
    @import "/src/css/variables";

    .wd-system-panel {
        .md-tabs-container > div {
            /*padding-left: 5px;*/
            /*padding-right: 5px;*/
        }

        .md-tabs-container > div,
        .md-tabs-container,
        &.wd-popup {
            background-color: $bg-secondary;
        }

        .wd-popup__content,
        &.wd-popup {
            padding:0;
        }
    }

    .wd-grid {
        display: grid;
        grid-column-gap: 5px;
        grid-row-gap: 5px;

        & > .wd-grid__element {
            width: 100%;
            height: 50px;
            background-color: #808080;

            display: flex;
            justify-content: center;
            align-items: center;
        }

        & > .wd-grid__element:nth-child(1) {
            grid-column-start: 1;
            grid-column-end: 2;
        }

        & > .wd-grid__element:nth-child(2) {
            grid-column-start: 2;
            grid-column-end: 3;
        }

        & > .wd-grid__element {
            grid-column-start: 1;
            grid-column-end: 3;
        }

    }

    .wd-kek {
        display: flex;
        flex-wrap: wrap;

        & > .wd-kek__element {
            width: 100%;
            height: 50px;
            background-color: #808080;

            display: flex;
            justify-content: center;
            align-items: center;
        }

        & > .wd-kek__element {
            flex-grow: 2;
            box-sizing: border-box;
        }

        & > .wd-kek__element:not(:last-child) {
            margin-bottom: 5px;
        }

        & > .wd-kek__element:nth-child(1) {
            flex-grow: 1;
            width: calc(50% - 3px);
            margin-right: 6px;
        }

        & > .wd-kek__element:nth-child(2) {
            flex-grow: 1;
            width: calc(50% - 3px);
        }

        .order-1 {
            order: 1;
        }

        .order-2 {
            order: 2;
        }

        .order-3 {
            order: 3;
        }
    }
</style>