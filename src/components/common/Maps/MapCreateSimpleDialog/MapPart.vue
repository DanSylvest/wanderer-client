<template>
  <div class="wd-map-part">
    <md-field md-clearable>
      <label>{{ TEXT.mapPart.name.label }}</label>
      <md-input v-model="name" @input="onEditFormChange" @change="onEditFormChange" />
      <transition name="fade">
        <span class="wd-hint-negative md-helper-text" v-if="!isValidName">
          {{ TEXT.mapPart.name.hint }}
        </span>
      </transition>
    </md-field>

    <md-field md-clearable>
      <label>{{ TEXT.mapPart.description.label }}</label>
      <md-textarea v-model="description" @input="onEditFormChange" @change="onEditFormChange" />
      <span class="wd-hint md-helper-text">{{ TEXT.mapPart.description.hint }}</span>
    </md-field>

    <md-field md-clearable>
      <label>{{ TEXT.mapPart.note.label }}</label>
      <md-textarea v-model="note" @input="onEditFormChange" @change="onEditFormChange" />
      <span class="wd-hint md-helper-text">{{ TEXT.mapPart.note.hint }}</span>
    </md-field>
  </div>
</template>

<script>
  import { validateDescription, validateName } from '../../../utils/stringValidator';
  import { TEXT } from './constants';
  import { mapActions } from 'vuex';

  export default {
    name: 'MapPart',
    data () {
      return {
        TEXT,

        name: '',
        description: '',
        note: '',
        isValidName: false,
      };
    },
    methods: {
      ...mapActions('mapCreateSimpleDialogStore', [
        'setMapDataAndValid',
        'setMapInvalid',
      ]),
      onEditFormChange () {
        this.validateEditForm();
      },
      validateEditForm () {
        this.isValidName = validateName(this.name);

        const currentValid = this.isValidName
          && validateDescription(this.description)
          && validateDescription(this.note);

        currentValid
          ? this.setMapDataAndValid({ name: this.name, description: this.description, note: this.note })
          : this.setMapInvalid();
      },
    },
  };

</script>

<style lang="scss" scoped>

</style>