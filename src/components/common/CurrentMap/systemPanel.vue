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
                :c-offset-y="75"
                c-horizontal-alignment="right"
                @c-closed="onPopupClosed"
        >
            <md-tabs v-if="enabled" @md-changed="onTabChange" class="fh" md-dynamic-height>
                <md-tab id="tab-overview" md-label="Overview"  exact>
                    <overview v-if="enabled" ref="systemInfo"></overview>
                </md-tab>

                <md-tab id="tab-signatures" md-label="Signatures">
                    <signatures v-if="enabled" ref="signatures"></signatures>
                </md-tab>

                <md-tab id="tab-online" md-label="Online">
                    Coming soon...
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
            }
        },
        mounted: function () {
            this.currentSystemData = Object.create(null);
            this._rtid = -1;
            this.mapId = null;
            this.systemId = null;
            this._so = new SizeObserver(this.refresh.bind(this));
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
            // API
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
                        this.$refs.systemInfo.update(this.currentSystemData);
                        break;
                    case "tab-signatures":
                        this.$refs.signatures.update(this.currentSystemData.signatures);
                        break;
                }

                setTimeout(function () {
                    this.refresh();
                }.bind(this), 100);
            },

            onTabChange: function (_tabName) {
                if(_tabName === undefined)
                    return;

                this.currentTab = _tabName;

                switch (_tabName) {
                    case "tab-overview":
                        this.$refs.systemInfo.update(this.currentSystemData);
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

            }
        }
    }

    const innerRefresh = function () {
        this._rtid = -1;

        let bounds = document.body.getBoundingClientRect();
        this.panelWidth = bounds.width * 0.4 < 500 ? 500 : bounds.width * 0.45;
        this.panelHeight = bounds.height - 85;

        switch(this.currentTab) {
            case "tab-signatures":
                this.$refs.signatures.refresh();
                break;
        }
    };
</script>