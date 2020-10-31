<template>
    <div
        class="wd-app-menu wd f-height padding-top flex flex-column flex-h-center"
        :class="{'expanding': expandAnimation, 'collapsing': collapseAnimation, 'expanded': expanded}"
    >
        <div class="wd f-width flex flex-justify-center" :class="{'flex-justify-end': expandAnimation || expanded}">
            <md-button v-show="!expanded" class="md-icon-button" @click="onExpand">
                <md-icon>menu</md-icon>
            </md-button>
            <md-button v-show="expanded" class="md-icon-button" @click="onCollapse">
                <md-icon>keyboard_arrow_left</md-icon>
            </md-button>
        </div>

        <div class="wd-app-menu-list wd fs flex flex-column flex-h-center">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    export default {
        name: "AppMenu",
        data: function () {
            return {
                expandAnimation: false,
                collapseAnimation: false,
                expanded: false
            }
        },
        mounted() {

        },
        methods: {
            onExpand: function () {
                this.expandAnimation = true;

                const handleAnimEnd = () => {
                    this.$el.removeEventListener("animationend", handleAnimEnd);
                    this.expandAnimation = false;
                    this.expanded = true;
                }

                this.$el.addEventListener("animationend", handleAnimEnd);
            },
            onCollapse: function () {
                this.collapseAnimation = true;
                this.expanded = false;

                const handleAnimEnd = () => {
                    this.$el.removeEventListener("animationend", handleAnimEnd);
                    this.collapseAnimation = false;
                }

                this.$el.addEventListener("animationend", handleAnimEnd);
            }
        }
    }
</script>

<style scoped lang="scss">
    @import "src/css/variables";

    .wd-app-menu {
        border-right: 1px solid $bg-3 ;
        width: 60px;
        background-color: $bg-secondary;

        .wd-app-menu-list {
            margin-top: 15px;

            & > .wd-app-menu-item:not(:last-child) {
                border-bottom: 1px solid $bg-3;
            }
        }

        &.expanding {
            animation: anim-expanding 200ms ease-in;
        }

        &.collapsing {
            animation: anim-collapsing 200ms ease-in;
        }

        &.expanded {
            width: 160px;
        }

        @keyframes anim-expanding {
            from {
                width: 60px;
            }

            to {
                width: 160px;
            }
        }

        @keyframes anim-collapsing {
            from {
                width: 160px;
            }

            to {
                width: 60px;
            }
        }
    }

</style>