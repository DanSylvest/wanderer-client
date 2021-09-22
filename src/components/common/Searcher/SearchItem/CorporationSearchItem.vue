<template>
  <div class="wd-search-item">
    <transition name="fade">
      <div v-if="loadedCorporation" class="wd-search-content">
        <img
          class="md-icon"
          :src="getCorporationLogo(lCorporationId)"
          style="margin-right: 10px;"
          alt=""
          loading="lazy"
        />
        <md-highlight-text :md-fuzzy-search="true" :md-term="match">{{ corporationName }}</md-highlight-text>
      </div>
    </transition>

    <div v-show="!loadedCorporation" class="wd-loader">
      <md-progress-spinner class="md-accent" :md-stroke="2" :md-diameter="20"
                           md-mode="indeterminate"></md-progress-spinner>
    </div>
  </div>
</template>

<script>
import './styles.scss';
import CorporationPublicInfoMixin from '../../../mixins/corporation/publicInfo';
import { getCorporationPortraitUrl } from '../../../utils/eveResources';

export default {
  name: 'CorporationSearchItem',
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
    CorporationPublicInfoMixin,
  ],
  methods: {
    getCorporationLogo: id => getCorporationPortraitUrl({ id, size: 32 }),
  },
};
</script>

<style lang="scss" scoped>
</style>