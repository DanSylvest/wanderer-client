<template>
  <div class="wd-group-part">
    <md-checkbox v-model="isCreateGroupFromExists">{{ TEXT.groupPart.selectTypeDescription }}</md-checkbox>

    <transition name="fade">
      <div v-if="!isCreateGroupFromExists">
        <md-field md-clearable>
          <label>{{ TEXT.groupPart.name.label }}</label>
          <md-input v-model="name" @input="onEditFormChange" @change="onEditFormChange" />
          <transition name="fade">
          <span class="wd-hint-negative md-helper-text" v-if="!isValidName">
            {{ TEXT.groupPart.name.hint }}
          </span>
          </transition>
        </md-field>

        <md-field md-clearable>
          <label>{{ TEXT.groupPart.description.label }}</label>
          <md-textarea v-model="description" @input="onEditFormChange" @change="onEditFormChange" />
          <span class="wd-hint md-helper-text">{{ TEXT.groupPart.description.hint }}</span>
        </md-field>
      </div>

      <div v-if="isCreateGroupFromExists"></div>
    </transition>
  </div>
</template>

<script>
  import { validateDescription, validateName } from '../../../utils/stringValidator';
  import { TEXT } from './constants';
  import { mapActions } from 'vuex';

  export default {
    name: 'GroupPart',
    props: {
      active: {
        type: Boolean,
        default: false,
      },
    },
    data () {
      return {
        TEXT,

        isCreateGroupFromExists: false,
        name: '',
        description: '',
        isValidName: false,
      };
    },
    watch: {
      active (val) {
        val && this.validateEditForm();
      },
    },
    methods: {
      ...mapActions('mapCreateSimpleDialogStore', [
        'setGroupDataAndValid',
        'setGroupInvalid',
      ]),
      onEditFormChange () {
        this.validateEditForm();
      },
      validateEditForm () {
        this.isValidName = validateName(this.name);

        const currentValid = this.isValidName && validateDescription(this.description);

        currentValid
          ? this.setGroupDataAndValid({ name: this.name, description: this.description })
          : this.setGroupInvalid();
      },
    },
  };

</script>

<style lang="scss">
  @import "src/css/variables";

  .wd-group-part {
    min-height: 400px;
  }

  .md-field.md-theme-default.md-has-textarea:not(.md-autogrow):after {
    border-color: $border-color-primary-3;
  }
</style>