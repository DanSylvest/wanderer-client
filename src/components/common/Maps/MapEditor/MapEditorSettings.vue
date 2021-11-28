<template>
  <div class="wd-map-part">
    <md-field md-clearable>
      <label>{{ TEXT.mapPart.name.label }}</label>
      <md-input v-model="name_" @input="onChanged" @change="onChanged" />
      <transition name="fade">
        <span class="wd-hint-negative md-helper-text" v-if="!isValidName">
          {{ TEXT.mapPart.name.hint }}
        </span>
      </transition>
    </md-field>

    <md-field md-clearable>
      <label>{{ TEXT.mapPart.description.label }}</label>
      <md-textarea v-model="description_" @input="onChanged" @change="onChanged" />
      <span class="wd-hint md-helper-text">{{ TEXT.mapPart.description.hint }}</span>
    </md-field>

    <md-field md-clearable>
      <label>{{ TEXT.mapPart.note.label }}</label>
      <md-textarea v-model="note_" @input="onChanged" @change="onChanged" />
      <span class="wd-hint md-helper-text">{{ TEXT.mapPart.note.hint }}</span>
    </md-field>
  </div>
</template>

<script>
  import { validateDescription, validateName } from '../../../utils/stringValidator';
  import { TEXT } from '../MapCreateSimpleDialog/constants';

  export default {
    name: 'MapEditorSettings',
    props: {
      name: {
        default: '',
        type: String,
      },
      description: {
        default: '',
        type: String,
      },
      note: {
        default: '',
        type: String,
      },
    },
    data () {
      return {
        TEXT,

        name_: this.name,
        description_: this.description,
        note_: this.note,

        isValidName: false,
      };
    },
    mounted () {
      this.validateEditForm(true);
    },
    watch: {
      name (val) {
        this.name_ = val;
      },
      description (val) {
        this.description_ = val;
      },
      note (val) {
        this.note_ = val;
      },
    },
    methods: {
      onChanged () {
        this.validateEditForm();
      },
      validateEditForm (noReport) {
        this.isValidName = validateName(this.name);

        const currentValid = this.isValidName
          && validateDescription(this.description)
          && validateDescription(this.note);

        if (noReport) {
          return;
        }

        if (currentValid) {
          this.$emit('validWithData', { name: this.name_, description: this.description_, note: this.note_ });
        } else {
          this.$emit('invalid');
        }
      },
    },
  };
</script>

<style scoped>

</style>