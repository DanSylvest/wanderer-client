<template>
  <div class="wd-search-item">
    <transition name="fade">
      <div v-if="loadedAlliance" class="wd-search-content">
        <img
          class="md-icon"
          :src="getAllianceLogo(lAllianceId)"
          style="margin-right: 10px;"
          alt=""
          loading="lazy"
        />
        <md-highlight-text :md-fuzzy-search="true" :md-term="match">{{ allianceName }}</md-highlight-text>
      </div>
    </transition>

    <div v-show="!loadedAlliance" class="wd-loader">
      <md-progress-spinner class="md-accent" :md-stroke="2" :md-diameter="20" md-mode="indeterminate" />
    </div>
  </div>
</template>

<script>
import './styles.scss';
import { getAlliancePortraitUrl } from '../../../utils/eveResources';
import AlliancePublicInfoMixin from '../../../mixins/alliance/publicInfo';

export default {
  name: 'AllianceSearchItem',
  props: {
    match: {
      type: String,
      default: '',
    },
  },
  data () {
    return {
      beforeMatch_: '',
      match_: '',
      afterMatch_: '',
    };
  },
  mixins: [
    AlliancePublicInfoMixin,
  ],
  methods: {
    getAllianceLogo: id => getAlliancePortraitUrl({ id, size: 32 }),
  },
};
</script>

<style lang="scss" scoped>

</style>