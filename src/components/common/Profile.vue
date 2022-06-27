<template>
  <div class="wd padding-primary wd">
    <div class="wd flex flex-column">
      <md-button class="md-primary md-raised" style="width: 200px" @click="onRemove">Remove account</md-button>
      <span class="wd-hint-negative">* note this is DANGEROUS operation. If you remove your account - you lose all maps, groups and all attached characters</span>
    </div>
  </div>
</template>

<script>
  import api from '../../js/api';
  import cookie from '../../js/env/cookie';
  import helper from '../../js/utils/helper';

  export default {
    name: 'Profile',
    components: {},
    props: [],
    data: function () {
      return {};
    },
    mounted () {

    },
    methods: {
      onRemove () {
        api.user.removeUser().then(
          () => {
            cookie.remove('authToken');
            window.location = window.location.origin + window.location.pathname;
          },
          error => helper.errorHandler(this, error),
        );
      },
    },
  };
</script>
