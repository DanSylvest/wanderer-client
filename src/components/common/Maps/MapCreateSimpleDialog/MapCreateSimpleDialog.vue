<template>
  <div class="wd off-user-select">
    <md-dialog
      md-dynamic-height
      :md-active.sync="showEditDialog"
      @md-closed="hide"
    >
      <md-dialog-title>{{ TEXT.dialogTitle }}</md-dialog-title>

      <md-steppers :md-active-step.sync="activeStep" md-linear md-dynamic-height>
        <md-step
          id="first"
          :md-label="TEXT.steps.first.label"
          :md-description="TEXT.steps.first.description"
          :md-error="firstError"
          :md-editable="isFirstActive"
        >
          <map-part class="wd-step-content" :active="isFirstActive" />

          <br />
          <div class="wd flex flex-justify-sb">
            <md-button class="md-raised md-primary" @click="hide">{{ TEXT.dialogClose }}</md-button>
            <md-button class="md-raised md-accent" :disabled="!isFirstValid" @click="nextStep(STEPS.second)">
              Next
            </md-button>
          </div>
        </md-step>

        <md-step
          id="second"
          :md-label="TEXT.steps.second.label"
          :md-description="TEXT.steps.second.description"
          :md-error="secondError"
          :md-editable="isSecondActive"
        >
          <group-part class="wd-step-content" :active="isSecondActive" />

          <br />
          <div class="wd flex flex-justify-sb">
            <md-button class="md-raised md-primary" @click="hide">{{ TEXT.dialogClose }}</md-button>

            <div>
              <md-button class="md-primary" @click="nextStep(STEPS.first)">{{ TEXT.stepBack }}</md-button>
              <md-button class="md-raised md-accent" :disabled="!isSecondValid" @click="nextStep(STEPS.third)">
                {{ TEXT.stepNext }}
              </md-button>
            </div>
          </div>
        </md-step>

        <md-step
          id="third"
          :md-label="TEXT.steps.third.label"
          :md-description="TEXT.steps.third.description"
          :md-editable="isThirdActive"
        >
          <group-settings :active="isThirdActive" />

          <div class="wd flex flex-justify-sb">
            <md-button class="md-raised md-primary" @click="hide">{{ TEXT.dialogClose }}</md-button>

            <div>
              <md-button class="md-primary" @click="nextStep(STEPS.second)">{{ TEXT.stepBack }}</md-button>
              <md-button class="md-raised md-accent" @click="nextStep(STEPS.fourth)">{{ TEXT.stepNext }}</md-button>
            </div>
          </div>
        </md-step>

        <md-step
          id="fourth"
          :md-editable="isFourthActive"
          :md-label="TEXT.steps.fourth.label"
          :md-description="TEXT.steps.fourth.description"
        >
          <final-part :active="isFourthActive" />

          <div class="wd flex flex-justify-sb">
            <md-button class="md-raised md-primary" @click="hide">{{ TEXT.dialogClose }}</md-button>

            <div>
              <md-button class="md-primary" @click="nextStep(STEPS.third)">{{ TEXT.stepBack }}</md-button>
              <md-button class="md-raised md-accent" @click="onComplete">{{ TEXT.finish }}</md-button>
            </div>
          </div>
        </md-step>
      </md-steppers>

    </md-dialog>
  </div>
</template>

<script>
  /**
   * TODO - check stepper ID and activate step
   */

  import api from '../../../../js/api';
  import helper from '../../../../js/utils/helper.js';
  import MapPart from './MapPart';
  import GroupPart from './GroupPart';
  import GroupSettings from './GroupSettings';

  import { STEPS, FIRST_PART_ERROR_MSG, TEXT } from './constants';
  import store from '../../../../js/store';
  import { MapCreateSimpleDialogStore } from './store';
  import { mapActions } from 'vuex';
  import FinalPart from './FinalPart';

  export default {
    name: 'MapCreateSimpleDialog',
    components: {
      FinalPart,
      GroupSettings,
      GroupPart,
      MapPart,
    },
    props: {
      show: {
        type: Boolean,
        default: false,
      },
    },
    data () {
      return {
        TEXT,
        FIRST_PART_ERROR_MSG,
        STEPS,

        showEditDialog: false,
        activeStep: STEPS.first,
      };
    },
    mounted () {
      store.registerModule(['mapCreateSimpleDialogStore'], MapCreateSimpleDialogStore);
    },
    beforeDestroy () {
      store.unregisterModule(['mapCreateDialog']);
    },
    watch: {
      /**
       * @param {boolean} isShow
       */
      async show (isShow) {
        this.showEditDialog = isShow;
        !isShow && this.reset();
      },
    },
    computed: {
      state_ () {
        return this.$store.state['mapCreateSimpleDialogStore'];
      },
      isFirstValid () {
        return this.state_ && this.state_.firstValid;
      },
      isSecondValid () {
        return this.state_ && this.state_.secondValid;
      },
      firstError () {
        return !this.isFirstValid && this.isFirstActive ? FIRST_PART_ERROR_MSG : null;
      },
      secondError () {
        return !this.isSecondValid && this.isSecondActive ? FIRST_PART_ERROR_MSG : null;
      },
      isFirstActive () {
        return this.activeStep === STEPS.first;
      },
      isSecondActive () {
        return this.activeStep === STEPS.second;
      },
      isThirdActive () {
        return this.activeStep === STEPS.third;
      },
      isFourthActive () {
        return this.activeStep === STEPS.fourth;
      },
    },
    methods: {
      ...mapActions('mapCreateSimpleDialogStore', [
        'clearAll',
      ]),

      reset () {
        this.activeStep = STEPS.first;
        this.clearAll();
      },
      nextStep (to) {
        this.activeStep = to;
      },
      hide () {
        this.$emit('update:show', false);
      },
      onComplete () {
        const {
          mapName,
          mapDescription,
          mapNote,
          groupName,
          groupDescription,
          characterId,
          shareCorporation: shareForCorporation,
          shareAlliance: shareForAlliance,
        } = this.state_;

        const data = {
          mapName,
          mapDescription,
          mapNote,
          groupName,
          groupDescription,
          characterId,
          shareForCorporation,
          shareForAlliance,
        };

        api.eve.map.addFast(data)
          .then(
            ({ mapId, name, description, groups, note }) => {
              this.$emit('success', { id: mapId, name, description, groups, note });
              this.hide();
            },
            error => helper.errorHandler(this, error),
          );
      },
    },
  };

</script>

<style lang="scss">
  @import "../../../../css/variables";

  .md-has-textarea.md-field:not(.md-has-value):not(.md-focused) label {
    font-size: 14px;
  }

  .md-field.md-theme-default.md-has-textarea:not(.md-autogrow):after {
    border-color: $border-color-primary-3;
  }

  .wd-step-content {
    width: 600px;
  }

  .md-steppers.md-theme-default .md-stepper-header.md-error .md-icon svg,
  .md-steppers.md-theme-default .md-stepper-header.md-error .md-button-content {
    color: $fg-negative2;
    fill: $fg-negative2;
  }
</style>