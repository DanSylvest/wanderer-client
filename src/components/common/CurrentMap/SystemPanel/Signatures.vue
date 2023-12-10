<template>
  <div class="wd fs wd-signatures">
    <div v-if="enable && loadedSolarSystem" class="wd fs">
      <div v-if="signatures.length > 0" class="wd fs">
        <wd-table :rows="filteredSignatures" selectable @selected="onSelect">
          <template v-slot:toolbar>
            <div class="md-toolbar-section-end">
              <md-button class="md-icon-button" @click="showFilterDialog = true">
                <md-icon>tune</md-icon>
              </md-button>
            </div>
          </template>

          <template v-slot:header>
            <table-header-cell sortable id="id" widthPolicy="80px">id</table-header-cell>
            <table-header-cell sortable id="group">group</table-header-cell>
            <table-header-cell sortable id="name">name</table-header-cell>
            <table-header-cell sortable id="created">created</table-header-cell>
          </template>

          <template v-slot:row="{row}">
            <table-cell id="id">{{ row.id }}</table-cell>
            <table-cell id="group">{{ row.group }}</table-cell>
            <table-cell id="name">{{ row.name }}</table-cell>
            <table-cell id="created">
              <time-left :c-date="new Date(row.created)"></time-left>
            </table-cell>
          </template>

          <template v-slot:alternate-toolbar>
            <div class="md-toolbar-section-start">Signatures selected - {{ selected.length }}</div>

            <div class="md-toolbar-section-end">
              <md-button class="md-icon-button" @click="onClickDeleteSignatures">
                <md-icon>delete</md-icon>
              </md-button>
            </div>
          </template>

          <template v-slot:empty-state>
            <md-empty-state
              md-icon="announcement"
              md-label="All existing signatures were filtered"
              md-description=""
            >
            </md-empty-state>
          </template>
        </wd-table>
      </div>

      <md-empty-state
        v-if="signatures.length === 0"
        md-icon="announcement"
        md-label="No signatures"
        md-description="Just paste (ctrl + v) for update signatures."
      >
      </md-empty-state>

      <div style="width: 1000px;">
        <md-dialog v-model:md-active="saveSigsDialogActive">
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

    <md-dialog v-model:md-active="showFilterDialog">
      <md-dialog-title>Filter signatures</md-dialog-title>

      <div class="wd-filter-content">
        <template v-for="item in filterTypes" :key="item.title">
          <md-checkbox v-model="item.value">{{ item.title }}</md-checkbox>
        </template>
      </div>

      <md-dialog-actions>
        <md-button class="md-primary" @click="showFilterDialog = false;">OK</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
  import SizeObserver from '../../../../js/env/sizeObserver';
  import TimeLeft from '../../../ui/TimeLeft';
  import api from '../../../../js/api';
  import TabObserver from '../../../../js/env/tabObserver';
  import environment from '../../../../js/core/map/environment.js';
  import exists from '../../../../js/env/tools/exists.js';
  import cookie from '../../../../js/env/cookie.js';
  import helper from '../../../../js/utils/helper.js';
  import cache from '../../../../js/cache/cache.js';
  import WdTable from '../../../ui/Table/WdTable.vue';
  import TableHeaderCell from '../../../ui/Table/TableHeaderCell.vue';
  import TableCell from '../../../ui/Table/TableCell.vue';
  import SolarSystemMixin from '../../../mixins/solarSystem.js';

  export default {
    name: 'Signatures',
    mixins: [SolarSystemMixin],
    components: { TimeLeft, WdTable, TableHeaderCell, TableCell },
    data: function () {
      return {
        showFilterDialog: false,
        filterTypes: [],
        saveSigsDialogActive: false,
        selected: [],
        enable: true,
      };
    },
    mounted: function () {
      this._pasteHandler = this.onPaste.bind(this);

      this._tidHI = -1;

      this._rtid = -1;
      this._so = new SizeObserver(null, this.refresh.bind(this));
      this._to = new TabObserver();
      this._to.on('out', this._onTabOut.bind(this));
      this._to.on('in', this._onTabIn.bind(this));

      this._loadFilterData();
    },
    beforeUnmount: function () {

      this._rtid !== -1 && clearTimeout(this._rtid);
      this._rtid = -1;
      this._so.destructor();
      this._to.destructor();
    },
    computed: {
      filteredSignatures () {
        cookie.set('filteredAnomalies', JSON.stringify(this.filterTypes), { expires: 60 * 60 * 24 * 365 * 1000 });

        let filtered = this.signatures.slice(0);
        this.filterTypes.map(filter => {
          if (!filter.value) {
            let title = environment.dScan.kindNames[filter.id];
            filtered = filtered.filter(x => x.kind !== title);
          }
        });

        return filtered;
      },
    },
    methods: {
      watchAttrsUpdatedSolarSystem () {
        this.destroyHiddenInput();

        SolarSystemMixin.methods.watchAttrsUpdatedSolarSystem.call(this);
      },
      onLoadedSolarSystem () {
        SolarSystemMixin.methods.onLoadedSolarSystem.call(this);

        this._hiddenInputLoop();
      },
      _getStaticSolarSystemProvider () {
        return cache.solarSystems.list.get(this.lSolarSystemId);
      },
      _getMapSolarSystemProvider () {
        return cache.maps.list.get(this.lMapId).solarSystems.list.get(this.lSolarSystemId);
      },
      createHiddenInput () {
        this._hiddenInput = this.$el.querySelector('.c-hidden-input');
        this._hiddenInput.addEventListener('paste', this._pasteHandler);
      },
      destroyHiddenInput () {
        this._tidHI !== -1 && clearTimeout(this._tidHI);
        this._tidHI = -1;

        this._hiddenInput && this._hiddenInput.removeEventListener('paste', this._pasteHandler);
        delete this._hiddenInput;
      },
      // },
      updateHiddenInput: function () {
        if (this._hiddenInput) {
          this.destroyHiddenInput();
          this.$nextTick(() => this.createHiddenInput());
        }
      },
      hasHiddenInput () {
        return !!this.$el.querySelector('.c-hidden-input');
      },
      _hiddenInputLoop () {
        this._tidHI = -1;

        if (this.hasHiddenInput()) {
          this.createHiddenInput();
          this.focus();
        } else {
          this._tidHI = setTimeout(this.onLoadedSolarSystem.bind(this), 10);
        }
      },
      _loadFilterData () {
        let savedFilter = cookie.get('filteredAnomalies');
        if (!savedFilter) {
          this.filterTypes = environment.signaturesTypes.slice();
        } else {
          this.filterTypes = JSON.parse(savedFilter);
        }
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
        this.selected = items;
      },
      onClickDeleteSignatures: function () {
        let out = [];
        for (let a = 0; a < this.signatures.length; a++) {
          let oldSig = this.signatures[a];
          if (!this.selected.searchByObjectKey('id', oldSig.id)) {
            out.push(oldSig);
          }
        }
        api.eve.map.solarSystem.update(this.lMapId, this.lSolarSystemId, { signatures: out })
          .then(
            helper.dummy,
            err => helper.errorHandler(this, err),
          );
      },

      /**
       * Just save as is signatures
       */
      onUpdateAllSigs: function () {
        this.saveSigsDialogActive = false;

        let data = {
          signatures: this.currentWaitSaveData.actualSigs.concat(this.currentWaitSaveData.forRemoveSigs),
        };

        api.eve.map.solarSystem.update(this.lMapId, this.lSolarSystemId, data)
          .then(
            helper.dummy,
            err => helper.errorHandler(this, err),
          );
      },
      /**
       * Remove non exists signatures from updated
       */
      onUpdateNonExists: function () {
        this.saveSigsDialogActive = false;

        api.eve.map.solarSystem.update(this.lMapId, this.lSolarSystemId, { signatures: this.currentWaitSaveData.actualSigs })
          .then(
            helper.dummy,
            err => helper.errorHandler(this, err),
          );
      },
      focus: function () {
        this._hiddenInput.focus();
      },
      onPaste: function (_event) {
        let text = _event.clipboardData.getData('text');

        let sigs = signaturesParser(text);

        if (sigs.length === 0) {
          return;
        }

        let result = this._processSignatures(sigs);

        if (result.forRemoveSigs.length > 0) {
          // we need remove it from updated and show dialog
          this.saveSigsDialogActive = true;
          this.currentWaitSaveData = result;
        } else {
          api.eve.map.solarSystem.update(this.lMapId, this.lSolarSystemId, { signatures: result.actualSigs })
            .then(
              helper.dummy,
              err => helper.errorHandler(this, err),
            );
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
        for (let oldSigId in oldSigs) {
          let oldSig = oldSigs[oldSigId];

          // if old sigs is not contains in newSigs we need mark it as removed
          // otherwise we check
          if (!exists(newSigs[oldSigId])) {
            forRemoveSigs.push(oldSig);
          } else {
            // we take new sig and now we need check that sig has been updated
            let newSig = newSigs[oldSigId];
            let isNeedUpgrade = getState(groups, newSig) > getState(groups, oldSig);
            if (isNeedUpgrade) {
              actualSigs.push(upgradeSig(oldSig, newSig));
            } else {
              actualSigs.push(oldSig);
            }

            // remove from new sigs, because it contains in oldSigs
            delete newSigs[oldSigId];
          }
        }

        // now we need add new sigs
        for (let newSigId in newSigs) {
          let newSig = newSigs[newSigId];

          let outSig = Object.create(null);
          outSig.id = newSig.id;
          outSig.kind = newSig.kind;
          outSig.group = newSig.group;
          outSig.name = newSig.name;
          outSig.description = '';
          outSig.lastUpdated = new Date().toUTCString();
          outSig.created = new Date().toUTCString();

          actualSigs.push(outSig);
        }

        return {
          forRemoveSigs: forRemoveSigs,
          actualSigs: actualSigs,
        };

      },
    },
  };

  let innerRefresh = function () {
    this._rtid = -1;

    fixTable.call(this);
  };

  // this is need for correct table headers
  // and this is work
  let fixTable = function () {
    let damnedTable = this.$refs.signaturesTable;

    if (!damnedTable) {
      return;
    }

    damnedTable.setHeaderPadding();
    damnedTable.setWidth();

    // this is incredible bullshit
    let damnedRows = damnedTable.$children[0].$children[damnedTable.$children[0].$children.length - 2];

    let damnedChildren = damnedRows.$children;
    for (let a = 1; a < damnedChildren.length; a++) {
      let child = damnedChildren[a];
      child.setWidth();
    }
  };

  // also we need detect changes, we need understand that sigs has states
  // first state when kind is Cosmic Signature or Cosmic Anomaly and group is empty
  // and we should detect it for ungrade sigs
  const getState = (groups, newSig) => {
    let state = -1;
    if (newSig.group === '') {
      state = 0;
    } else if (groups.in(newSig.group) && newSig.name === '') {
      state = 1;
    } else if (groups.in(newSig.group) && newSig.name !== '') {
      state = 2;
    }
    return state;
  };

  const upgradeSig = (oldSig, newSig) => {
    let outSig = Object.create(null);

    outSig.id = oldSig.id;
    outSig.kind = oldSig.kind;
    outSig.group = newSig.group;
    outSig.name = newSig.name;
    outSig.description = '';
    outSig.lastUpdated = new Date().toUTCString();
    outSig.created = oldSig.created;

    return outSig;
  };

  const signaturesParser = function (_value) {
    let outArr = [];
    let rows = _value.split('\n');

    for (let a = 0; a < rows.length; a++) {
      let row = rows[a];

      let sigArrInfo = row.split('	');

      if (sigArrInfo.length !== 6) {
        continue;
      }

      outArr.push({
        id: sigArrInfo[0],
        kind: sigArrInfo[1],
        group: sigArrInfo[2],
        name: sigArrInfo[3],
      });
    }

    return outArr;
  };
</script>

<style lang="scss">
  @import "./src/css/variables";

  .wd-signatures {
    height: calc(100% - 60px) !important;
  }

  .wd-filter-content {
    display: flex;
    flex-direction: column;
    padding: 10px 25px;
  }

</style>