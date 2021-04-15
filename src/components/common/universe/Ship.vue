<template>
    <div v-if="loaded" class="wd-ship-type">
        <span class="wd-ship-type__name">{{info.typeName}}</span>&nbsp;
        <span class="wd-ship-type__group">{{info.groupName}}</span>
    </div>
</template>

<script>
    import cache from "../../../js/cache/cache.js";
    import SpamFilter from "../../../js/env/spamFilter.js";
    import exists from "../../../js/env/tools/exists.js";

    export default {
        name: "CharacterCard",
        components: {},
        props: {
            shipId: {
                type: Number,
                default: null
            }
        },
        data: function () {
            return {
                lShipId: this.shipId,
                loaded: false,
            }
        },
        beforeMount() {
        },
        beforeDestroy () {
            this.unsubscribeData();
        },
        mounted() {
            this._attrUpdatedSF = new SpamFilter(this._watchAttrsUpdated.bind(this), 10);
            this._attrUpdatedSF.call();
        },
        watch: {
            shipId (val) {
                this.lShipId = val;
                this._attrUpdatedSF.call();
            }
        },
        computed: {
            info () {
                return this.$store.state.ships[this.lShipId].info;
            }
        },
        methods: {
            isValidAttrs () {
                return exists(this.lShipId);
            },
            _watchAttrsUpdated () {
                if(this.isValidAttrs()) {
                    this.unsubscribeData();
                    this.subscribeData();
                }
            },
            unsubscribeData() {
                if (exists(this._unsubscriberShipInfo)) {
                    this._unsubscriberShipInfo();
                    delete this._unsubscriberShipInfo;
                }
            },
            subscribeData() {
                this._unsubscriberShipInfo = cache.ships.list.get(this.lShipId).info.subscribe();
                this.loaded = false;
                cache.ships.list.get(this.lShipId).info.readyPromise()
                    .then(() => {
                        this.loaded = true
                    });
            },
        }
    }
</script>

<style lang="scss">
    @import "/src/css/variables";
    @import "~vue-material/dist/theme/engine";
    $character-color-1: md-get-palette-color(orange, 500);

    .wd-ship-type {

        .wd-ship-type__name {
            font-size: 14px;
            color: $fg-primary;
        }

        .wd-ship-type__group {
            font-size: 11px;
            color: $fg-primary-2;
        }
    }

</style>