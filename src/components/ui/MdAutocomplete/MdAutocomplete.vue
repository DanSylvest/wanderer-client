<template>
  <md-field class="md-autocomplete" :class="fieldClasses" :md-inline="isBoxLayout">
    <md-menu md-direction="bottom-start" :md-dense="mdDense" md-align-trigger md-full-width v-model:md-active="showMenu">

      <transition name="fade" duration="350">
        <div v-if="mdLoading" class="md-ac-loader" key="loader">
          <md-progress-spinner :md-diameter="24" :md-stroke="2" md-mode="indeterminate" />
        </div>
        <div v-else class="md-ac-loader" key="icon">
          <md-icon class="wd-color-negative">search</md-icon>
        </div>
      </transition>

      <md-input
        v-model="searchTerm"
        v-bind="$attrs"
        :id="mdInputId"
        :name="mdInputName"
        :maxlength="mdInputMaxlength"
        :placeholder="mdInputPlaceholder"
        @focus.stop="openOnFocus"
        @blur="hideOptions"
        @input="onInput"
        @click.stop.prevent="openOnFocus"
      />

      <md-menu-content :class="contentClasses" v-show="hasScopedEmptySlot || hasFilteredItems">
        <div class="md-autocomplete-loading" v-if="isPromisePending">
          <md-progress-spinner :md-diameter="40" :md-stroke="4" md-mode="indeterminate" />
        </div>

        <div class="md-autocomplete-items" v-if="hasFilteredItems">
          <md-menu-item v-for="(item, index) in getOptions()" :key="index" @click="selectItem(item, $event)">
            <slot
              name="md-autocomplete-item" :item="item" :term="searchTerm"
              v-if="$scopedSlots['md-autocomplete-item']"
            />
            <template v-else>{{ item }}</template>
          </md-menu-item>
        </div>

        <md-menu-item v-else-if="hasScopedEmptySlot">
          <div class="md-autocomplete-empty">
            <slot name="md-autocomplete-empty" :term="searchTerm" />
          </div>
        </md-menu-item>
      </md-menu-content>
    </md-menu>

    <slot />
  </md-field>
</template>

<script>
  import fuzzy from 'fuzzysearch';
  import isPromise from 'is-promise';
  import MdPropValidator from 'vue-material/src/core/utils/MdPropValidator';

  export default {
    name: 'MdAutocomplete2',
    props: {
      value: {
        type: null,
        required: true,
      },
      mdDense: Boolean,
      mdLayout: {
        type: String,
        default: 'floating',
        ...MdPropValidator('md-layout', [
          'floating',
          'box',
        ]),
      },
      mdLoading: {
        type: Boolean,
        default: false,
      },
      mdOpenOnFocus: {
        type: Boolean,
        default: true,
      },
      mdFuzzySearch: {
        type: Boolean,
        default: true,
      },
      mdOptions: {
        type: [Array, Promise],
        required: true,
      },
      mdInputIdKey: {
        type: String,
        default: '',
      },
      mdInputName: String,
      mdInputId: String,
      mdInputMaxlength: [String, Number],
      mdInputPlaceholder: [String, Number],
      isNotFilterIfEmptyModel: {
        type: Boolean,
        default: false,
      },
    },
    data () {
      return {
        searchTerm: this.value,
        showMenu: false,
        triggerPopover: false,
        isPromisePending: false,
        filteredAsyncOptions: [],
      };
    },
    computed: {
      isBoxLayout () {
        return this.mdLayout === 'box';
      },
      // eslint-disable-next-line vue/return-in-computed-property
      fieldClasses () {
        if (this.isBoxLayout) {
          return [
            'md-autocomplete-box',
            ...(this.mdLoading ? ['md-loading'] : []),
          ].join(' ');
        }
      },
      // eslint-disable-next-line vue/return-in-computed-property
      contentClasses () {
        if (this.isBoxLayout) {
          return 'md-autocomplete-box-content';
        }
      },
      shouldFilter () {
        return this.mdOptions[0] && this.searchTerm;
      },
      filteredStaticOptions () {
        if (this.isPromise(this.mdOptions)) {
          return false;
        }

        if (this.isNotFilterIfEmptyModel && this.searchTerm === '') {
          return this.mdOptions;
        }

        const firstItem = this.mdOptions[0];

        if (this.shouldFilter) {
          if (typeof firstItem === 'string') {
            return this.filterByString();
          } else if (typeof firstItem === 'object') {
            return this.filterByObject();
          }
        }

        return this.mdOptions;
      },
      hasFilteredItems () {
        return this.filteredStaticOptions.length > 0 || this.filteredAsyncOptions.length > 0;
      },
      hasScopedEmptySlot () {
        return this.$scopedSlots['md-autocomplete-empty'];
      },
    },
    watch: {
      mdOptions: {
        deep: true,
        immediate: true,
        handler () {
          if (this.isPromise(this.mdOptions)) {
            this.isPromisePending = true;
            this.mdOptions.then(options => {
              this.filteredAsyncOptions = options;
              this.isPromisePending = false;
            });
          }
        },
      },

      value (val) {
        if (typeof val !== 'string') {
          // eslint-disable-next-line no-debugger
          debugger;
        }
        this.searchTerm = val;
      },
    },
    methods: {
      getOptions () {
        if (this.isPromise(this.mdOptions)) {
          return this.filteredAsyncOptions;
        }

        return this.filteredStaticOptions;
      },
      isPromise (obj) {
        return isPromise(obj);
      },
      matchText (item) {
        const target = item.toLowerCase();
        const search = this.searchTerm.toLowerCase();

        if (this.mdFuzzySearch) {
          return fuzzy(search, target);
        }

        return target.includes(search);
      },
      filterByString () {
        return this.mdOptions.filter(item => this.matchText(item));
      },
      filterByObject () {
        return this.mdOptions.filter(item => {
          const values = Object.values(item);
          const valuesCount = values.length;

          for (let i = 0; i <= valuesCount; i++) {
            if (typeof values[i] === 'string' && this.matchText(values[i])) {
              return true;
            }
          }
        });
      },
      openOnFocus () {
        if (this.mdOpenOnFocus) {
          this.showOptions();
        }
      },
      onInput (value) {
        this.$emit('input', value);

        if (!this.mdOpenOnFocus) {
          this.showOptions();
        }

        if (this.searchTerm.constructor.toString().match(/function (\w*)/)[1].toLowerCase() !== 'inputevent') {
          this.$emit('md-changed', this.searchTerm);
        }
      },
      showOptions () {
        if (this.showMenu) {
          return false;
        }

        this.showMenu = true;
        this.$nextTick(() => {
          this.triggerPopover = true;
          this.$emit('md-opened');
        });
      },
      hideOptions () {
        this.$nextTick(() => {
          this.triggerPopover = false;
          this.$emit('md-closed');
        });
      },
      selectItem (item, $event) {
        const content = $event.target.textContent.trim();

        if (this.mdInputIdKey && item[this.mdInputIdKey]) {
          this.searchTerm = item[this.mdInputIdKey];
        } else {
          this.searchTerm = content;
        }

        this.$emit('input', this.searchTerm);
        this.$emit('md-selected', item);
        this.hideOptions();
      },
    },
  };
</script>

<style lang="scss">
  @import "~vue-material/src/components/MdAnimation/variables";
  @import "~vue-material/src/components/MdElevation/mixins";
  @import "~vue-material/src/components/MdLayout/mixins";

  .md-autocomplete {
    .md-menu {
      padding-left: 35px;
      width: 100%;
      display: flex;
    }

    //&.md-loading {
    //  .md-ac-loader {
    //    opacity: 1;
    //  }
    //}

    .md-ac-loader {
      transition: opacity 150ms;
      //opacity: 0;

      position: absolute;
      padding: 8px 5px 5px 12px;

      left: 4px;
      top: 5px;
    }
  }

  .md-autocomplete-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 100;
  }

  .md-field.md-inline.md-autocomplete-box {
    @include md-elevation(2);
    padding-top: 2px;
    border-radius: 2px;

    &.md-focused {
      z-index: 120;
    }

    &:before,
    &:after {
      display: none;
    }

    .md-toolbar & {
      min-height: 40px;
      height: 40px;
      margin: 0;
      box-shadow: none;
    }

    .md-menu {
      align-items: center;
    }

    .md-input {
      padding-left: 16px;
    }

    &.md-focused label,
    label,
    .md-input-action {
      top: 50%;
      transform: translateY(-50%);
    }

    .md-input-action {
      right: 8px;
    }

    &.md-focused label,
    label {
      margin-top: 2px;
      left: 16px;
    }
  }

  .md-autocomplete-box-content:after {
    height: 6px;
    position: absolute;
    top: -6px;
    right: 0;
    left: 0;
    z-index: 120;
    border-bottom: 1px solid;
    content: "";
  }
</style>
