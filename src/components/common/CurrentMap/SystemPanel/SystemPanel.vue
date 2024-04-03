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
      :c-offset-y="55"
      c-horizontal-alignment="right"
      @c-closed="onPopupClosed"
      @mounted="onPopupMounted"
      userClass="wd-system-panel wd-layout-secondary"
    >
      <md-tabs ref="tabs" @md-changed="onTabChange" class="fh wd-tabs">
        <md-tab id="tab-overview" md-label="Overview">
          <overview
            :map-id="lMapId"
            :solar-system-id="lSolarSystemId"
            :is-compact="isCompact"
            :exists-on-map="true"
            ref="systemInfo"
            @cupdated="onOverviewUpdated"
            @highlight-route="onHighlightRoute"
            @hubs-updated="onHubsUpdated"
          />
        </md-tab>

        <md-tab id="tab-signatures" md-label="Signatures">
          <signatures
            :map-id="lMapId"
            :solar-system-id="lSolarSystemId"
            ref="signatures"
          />
        </md-tab>

        <md-tab id="tab-online" md-label="Online">
          <md-empty-state
            md-icon="miscellaneous_services"
            md-label="In progress..."
            md-description="This tab in developing. Soon it will be available."
          />
        </md-tab>
      </md-tabs>
    </popup>

  </div>
</template>

<script>
  import SizeObserver from '../../../../js/env/sizeObserver';
  import Popup from '../../../ui/Popup';
  import Overview from './Overview/Overview';
  import SpamFilter from '../../../../js/env/spamFilter.js';
  import Signatures from './Signatures';

  export default {
    name: 'SystemPanel',
    props: {
      solarSystemId: {
        type: String,
        default: null,
      },
      mapId: {
        type: String,
        default: null,
      },
      show: {
        type: Boolean,
        default: false,
      },
    },
    components: {
      Popup,
      Overview,
      Signatures,
    },
    data: function () {
      return {
        loaded: false,
        lSolarSystemId: this.solarSystemId,
        lMapId: this.mapId,
        showPopup: this.show,

        panelWidth: 600,
        panelHeight: 800,
        currentTab: 'tab-overview',
        sizeDetectorClass: '',
        isCompact: false,
      };
    },
    mounted: function () {
      this._attrUpdatedSF = new SpamFilter(this._watchAttrsUpdated.bind(this), 10);
      this._attrUpdatedSF.call();

      this._rtid = -1;
      this._so = new SizeObserver(null, this.refresh.bind(this));
    },
    beforeDestroy: function () {
      this._attrUpdatedSF.stop();
      this.showPopup = false;
      this._rtid !== -1 && clearTimeout(this._rtid);
      this._rtid = -1;
      this._so.destructor();
      this._so = null;
      window.focus();
    },
    watch: {
      solarSystemId (val) {
        this.lSolarSystemId = val;
        this._attrUpdatedSF.call();
      },
      mapId (val) {
        this.lMapId = val;
        this._attrUpdatedSF.call();
      },
      show (val) {
        this.showPopup = val;
      },
    },
    computed: {
      panelTitle () {
        return `Solar system`;
      },
    },
    methods: {
      _watchAttrsUpdated () {
        this.refresh();
        this.focus();
      },
      onHighlightRoute (route) {
        this.$emit('highlight-route', route);
      },
      onHubsUpdated (hubs) {
        this.$emit('hubs-updated', hubs);
      },
      onOverviewUpdated: function () {
        this.$nextTick(function () {
          this.$refs.tabs.setIndicatorStyles();
        }.bind(this));
      },
      refresh: function () {
        if (!this.showPopup) {
          return;
        }

        this._rtid !== -1 && clearTimeout(this._rtid);
        this._rtid = setTimeout(innerRefresh.bind(this), 10);
      },

      // Custom
      onPopupClosed: function () {
        this.$emit('update:show', false);
        this.$emit('closed');
      },
      onPopupMounted: function () {


      },
      onTabChange: function (_tabName) {
        if (_tabName === undefined) {
          return;
        }

        this.currentTab = _tabName;

        switch (_tabName) {
          case 'tab-overview':
            break;
          case 'tab-signatures':
            this.$refs.signatures.focus();
            break;

        }
        this.refresh();
      },
      focus: function () {
        this.$nextTick(function () {
          switch (this.currentTab) {
            case 'tab-signatures':
              this.$refs.signatures.focus();
              break;
            default:
              window.focus();
          }
        }.bind(this));

      },
    },
  };

  const innerRefresh = function () {
    this._rtid = -1;

    let bounds = document.body.getBoundingClientRect();
    this.panelWidth = bounds.width * 0.3 < 400 ? 400 : 550;
    this.panelHeight = bounds.height - 100;
    this.$emit('changedPanelState', { panelWidth: this.panelWidth });
    this.isCompact = bounds.width <= 1400;
  };
</script>

<style lang="scss">
  @import "../../../../css/variables";

  .wd-tabs {
    & > .md-content.md-tabs-content {
      height: 100% !important;

      & > .md-tabs-container {
        height: 100%;
        position: relative;

        & > .md-tab {
          height: 100%;
        }
      }
    }
  }

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
      padding: 0;
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