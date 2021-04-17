<template>
    <div class="solar-system-local">
        <local-character :map-id="lMapId" :character-id="item" v-for="item in characters" :key="item"/>
    </div>
</template>

<script>
    import LocalCharacter from "./LocalCharacter.vue";
    import SolarSystemMixin from "../../../mixins/solarSystem.js";


    export default {
        name: "Local",
        components: {LocalCharacter},
        mixins: [SolarSystemMixin],
        mounted: function () {

        },
        beforeDestroy() {

        },
        computed : {
            characters () {
                return this.$store.state.maps[this.lMapId].solarSystems[this.lSolarSystemId].onlineCharacters;
            }
        },
        methods: {

        }
    }
</script>

<style lang="scss">
    @import "/src/css/variables";
    @import "~vue-material/dist/theme/engine";

</style>