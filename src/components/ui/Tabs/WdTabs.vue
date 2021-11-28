<template>
  <div class="wd-ui-tabs wd fs">
    <div class="wd-ui-tabs__nav-bar">
      <template v-for="item in tabs">
        <div
          :key="item.id"
          class="wd-ui-tab__label"
          @click="onLabelClick(item.id)"
          :class="{'wd-active': item.active}">
          <md-ripple class="wd-ui-tab__label-content">{{ item.label }}</md-ripple>
        </div>
      </template>
    </div>
    <div class="wd-ui-tabs__content wd fs">
      <div class="wd fs">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
import CustomPromise from '../../../js/env/promise.js';

export default {
  name: 'WdTabs',
  data () {
    return {
      tabs: [],
      lastSelectedTab: null,
      show: false,
    };
  },
  mounted () {
    removeTabsFromDom.call(this);

    this.tabs = getTabs.call(this).map(x => {
      return {
        id: x.$el.getAttribute('id'),
        label: x.label,
        active: false,
      };
    });

    if (this.tabs.length > 0)
      this.setActive(this.tabs.first().id);
  },
  methods: {
    onLabelClick (id) {
      this.setActive(id);
    },
    setActive (id) {
      if (id === this.lastSelectedTab)
        return;

      if (!this._hidingTab)
        this._hidingTab = this.lastSelectedTab;

      this.lastSelectedTab = id;

      let _pr = new CustomPromise();
      let pr = _pr.native;
      if (this._hidingTab) {
        let prevTab = getTabById.call(this, this._hidingTab);
        pr = prevTab.hide()
          .then(
            () => {
              prevTab.$el.classList.add('wd-hidden');
              this.tabs.searchByObjectKey('id', this._hidingTab).active = false;
              delete this._hidingTab;
            },
          );
      } else {
        _pr.resolve();
      }

      pr.then(
        () => {
          getTabById.call(this, id).$el.classList.remove('wd-hidden');
          this.tabs.searchByObjectKey('id', id).active = true;
          let curTab = getTabById.call(this, id);
          curTab.show();
          this.$emit('tab-changed', id);
        },
      );
    },

  },
};

// const getLabels = function () {
//     // getTabs.call(this).map(x => x.)
// }

// const deselectAll = function () {
//     this.tabs.map(x => x.active = false);
// }

const getTabs = function () {
  return this.$children.filter(x => x.$el.classList.contains('wd-ui-tab'));
};

const getTabById = function (id) {
  let tabs = getTabs.call(this);

  for (var a = 0; a < tabs.length; a++) {
    let tab = tabs[a];
    if (tab.$el.getAttribute('id') === id) {
      return tab;
    }
  }
};

const removeTabsFromDom = function () {
  let tabs = getTabs.call(this);
  tabs.map(x => x.$el.classList.add('wd-hidden'));
};
</script>

<style scoped lang="scss">
@import "src/css/variables";

.wd-ui-tabs {
  display: grid;
  grid-template-rows: 42px calc(100% - 42px);

  .wd-ui-tabs__nav-bar {
    display: flex;
    align-items: center;
  }

  .wd-ui-tab__label {

    &.wd-active .wd-ui-tab__label-content {
      transition: background-color 250ms, color 200ms;
      color: $fg-fourth;
      background-color: $primary-color;

      &:hover {
        background-color: $primary-color-2;
      }
    }

    .wd-ui-tab__label-content {
      transition: background-color 250ms;
      background-color: $bg-secondary;
      padding: 7px 10px;
      user-select: none;
      border-radius: 3px;
      cursor: pointer;
      border: 1px solid $border-color-primary-5-2;
      box-sizing: border-box;
      height: initial;

      &:hover {
        background-color: $bg-3;
      }
    }

    &:not(:last-child) {
      margin-right: 5px;
    }
  }

  .wd-ui-tabs__content {

  }
}
</style>