<template>
    <div
        class="wd-app-menu-item wd flex flex-column flex-align-center off-user-select"
    >
        <md-ripple>
            <div
                class="wd-app-menu-item-content wd flex flex-column flex-align-center box-sizing"
                :class="{
                    'expanding': $parent.expandAnimation,
                    'collapsing': $parent.collapseAnimation,
                    'expanded': $parent.expanded
                }"
            >
                <md-icon class="wd-app-menu-icon" :class="{'md-accent': localActive}" >{{localIcon}}</md-icon>
                <div
                    v-show="$parent.expanded"
                    class="wd wd-app-menu-title font-size-small text-align-center"
                >{{localTitle}}</div>
            </div>
        </md-ripple>
    </div>
</template>

<script>
    export default {
        name: "AppMenuItem",
        props: {
            title: {
                type: String,
                default: ""
            },
            icon: {
                type: String,
                default: ""
            },
            active: {
                type: Boolean,
                default: false
            }
        },
        data: function () {
            return {
                localTitle: this.title,
                localIcon: this.icon,
                localActive: this.active,
                enableTitle: false
            }
        },
        mounted() {
            let bounds = this.$el.getBoundingClientRect();
            this.enableTitle = !(bounds.width <= 150);

            this.__clickHandler = this.$emit.bind(this, "click");
            this.$el.addEventListener("click", this.__clickHandler);
        },
        beforeDestroy() {
            this.$el.removeEventListener("click", this.__clickHandler);
            delete this.__clickHandler;
        },
        watch: {
            active: function (_newVal) {
                this.localActive = _newVal;
            }
        }
    }
</script>

<style scoped lang="scss">
    @import "src/css/variables";

    .wd-app-menu-item {
        width: 100%;

        cursor: pointer;
        transition: background-color 450ms;

        &:hover {
            background-color: $bg-3-minor;
        }

        .wd-app-menu-item-content {
            padding-top: 15px;
            padding-bottom: 14px;

            &.active {

            }

            &.expanding {
                animation: anim-expanding 200ms ease-in-out;
            }

            &.collapsing {
                animation: anim-collapsing 200ms ease-in-out;
            }

            &.expanded {
                padding: 5px 10px;

                .wd-app-menu-icon {
                    margin-top: 5px;
                }
            }

            .wd-app-menu-icon {
                margin-top: 4px;
            }

            .wd-app-menu-title {
                color: $fg-primary;
                margin-top: 2px;

                text-transform: uppercase;
                letter-spacing: 3px;
            }

            @keyframes anim-expanding {
                from {
                    /*padding: 15px 14px;*/

                }

                to {
                    /*padding: 5px 10px;*/
                }
            }

            @keyframes anim-collapsing {
                from {
                    /*padding: 5px 10px;*/
                }

                to {
                    /*padding: 15px 14px;*/
                }
            }
        }
    }
</style>