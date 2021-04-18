<template>
    <div class="md-elevation-2 wd-tooltip" >
        <div class="wd-tooltip__content">
            <template v-if="showContent">
                <slot></slot>
            </template>
        </div>
    </div>
</template>

<script>
    import SpamFilter from "../../js/env/spamFilter.js";

    const getContextContainer = function () {
        let arr = document.getElementsByClassName("c-contexts-container");
        let element;
        if (arr.length === 0) {
            element = document.createElement("div");
            document.body.appendChild(element);

            element.setAttribute("class", "c-contexts-container wd absolute top left");
            element.style.width = "100%";
            element.style.height = "0px";
        } else {
            element = arr[0];
        }

        return element;
    }

    const OFFSET = 5;
    const OFFSET_EDGES = 10;

    export default {
        name: "Tooltip",
        props: {
            customPosition: {
                type: Boolean,
                default: true
            },
            placement: {
                type: String,
                default: "bottom"
            },
            activated: {
                type: Boolean,
                default: false
            },
            offsetX: {
                type: Number,
                default: 0
            },
            offsetY: {
                type: Number,
                default: 0
            }
        },
        components: {

        },
        data: function () {
            return {
                lCustomPosition: this.customPosition,
                lPlacement: this.placement,
                lActivated: this.activated,
                lOffsetX: this.offsetX,
                lOffsetY: this.offsetY,
                showContent: false
            }
        },
        mounted: function () {
            // this._tid = -1;
            this.isEnable = true;

            this.contextBody = this.$el;
            this.parent = this.$el.parentElement;
            this.parent.removeChild(this.contextBody);

            this._mouseOverHandler = this._onMouseOver.bind(this);
            this._mouseOutHandler = this._onMouseOut.bind(this);

            if(!this.customPosition) {
                this.parent.addEventListener("mouseover", this._mouseOverHandler);
                this.parent.addEventListener("mouseout", this._mouseOutHandler);
            }
            this._delayedActualizeSF = new SpamFilter(this._delayedActualize.bind(this), 50);
            this._delayedUpdateAttrSF = new SpamFilter(this._delayedUpdateAttr.bind(this), 50);
            this._delayedStateUpdateSF = new SpamFilter(this._delayedStateUpdate.bind(this), 50);

            // this.handlers = {
            //     onShowAnimationEnd: this._onShowAnimationEnd.bind(this),
            //     onHideAnimationEnd: this._onHideAnimationEnd.bind(this),
            // }

            this.state = ST_INITIAL;
        },
        beforeDestroy: function () {
            if (this.contextBody.parentElement !== null)
                getContextContainer().removeChild(this.contextBody);

            if(!this.customPosition) {
                this.parent.removeEventListener("mouseover", this._mouseOverHandler);
                this.parent.removeEventListener("mouseout", this._mouseOutHandler);
            }
        },
        /**
         * Так последовательность действий...
         *
         * Что бы тултип не катался по окну туда-сюда,
         * Надо вначале выставить оффсеты, а потом уже перемещать его.
         *
         * Поэтому, когда мы навели мышкой на парента, мы добавляем тултип в дом
         *  НО, не отображаем его.
         *  Вначале мы получаем его координаты, и сетим их
         *  Как только засетили, переводим в состояние отображения.
         *
         *  Кроме того есть нерешенная проблема - как расчитывать ширину и высоту?
         *
         *  Можно положить блок в блок, и по умолчанию размеры равны нулевым,
         *  Но размеры вложенного блока не равны нулевым - они автоматом расчитываются.
         *  Поэтому, мы можем расчитать его размеры после изменения внутреннего дома.
         *  И соответственно задать, что бы они плавно изменялись....
         *
         */
        methods: {
            _onMouseOver () {
                // this.showContent = true;
                // this.show();
                this.state = ST_ASK_SHOW;
                this.updateState();
            },
            _onMouseOut () {
                this.state = ST_ASK_HIDE;
                this.updateState();
                // this.hide();
                // this.showContent = false;
            },

            _delayedStateUpdate () {
                this.updateState();
            },

            updateState (/*newState*/) {
                // switch (this.state) {
                //     case ST_INITIAL:
                //         switch (newState) {
                //             case ST_ASK_SHOW:
                //                 this.state = newState;
                //                 break;
                //         }
                //         break;
                // }

                switch (this.state) {
                    case ST_ASK_SHOW:
                        document.body.appendChild(this.contextBody);
                        this.state = ST_SET_POSITION;
                        this._delayedStateUpdateSF.call();
                        break;
                    case ST_SET_POSITION:
                        this.showContent = true;
                        // this._setDefaultPosition();
                        this._delayedActualize();
                        this._addDOMObserver();
                        // this.state = ST_ACTUALIZE_SIZE;
                        // this._delayedStateUpdateSF.call();
                        break;
                    case ST_ACTUALIZE_SIZE:
                        // this._addDOMObserver();
                        this._delayedActualizeSF.call();
                        this.state = ST_SHOW;
                        break;
                }
            },

            show () {
                // document.body.appendChild(this.contextBody);
                // this._addDOMObserver();
                // this._delayedActualizeSF.call();
            },

            hide () {
                // this._removeDOMObserver();
                // document.body.removeChild(this.contextBody);
            },

            _setDefaultPosition () {
                if(this.lCustomPosition) {
                    this.contextBody.style.left = this.lOffsetX + "px";
                    this.contextBody.style.top = this.lOffsetY + "px";
                } else {
                    let parentBounds = this.parent.getBoundingClientRect();

                    let x = parentBounds.left + parentBounds.width / 2;
                    let y = parentBounds.top + parentBounds.height / 2;

                    this.contextBody.style.left = x + "px";
                    this.contextBody.style.top = y + "px";
                }
            },

            _delayedActualize () {
                this.actualizeOffsets();
                this.actualizeSize();
                this._recalculate();
            },

            _delayedUpdateAttr () {
                if(this.lActivated && !this.showContent) {
                    this.show();
                } else if(!this.lActivated && this.showContent) {
                    this.hide();
                }

                if(this.lActivated)
                    this._delayedActualizeSF.call();
            },

            actualizeOffsets (bool) {
                if(this.lCustomPosition)
                    this._actualOffsets(bool);
                else
                    this._parentActualOffset();
            },

            actualizeSize () {
                let bounds = this.contextBody.querySelector('.wd-tooltip__content').getBoundingClientRect();
                this.contextBody.style.width = bounds.width + "px";
                this.contextBody.style.height = bounds.height + "px";
            },

            _addDOMObserver () {
                this.observer = new MutationObserver((mutationsList) => {
                    // Use traditional 'for loops' for IE 11
                    for(const mutation of mutationsList) {
                        if(mutation.target !== this.contextBody) {
                            this._delayedActualizeSF.call();
                        }
                    }
                });
                this.observer.observe(this.contextBody, { attributes: true, childList: true, subtree: true });
            },
            _removeDOMObserver () {
                this.observer && this.observer.disconnect();
            },
            _actualOffsets: function (_notCalc) {
                if(!_notCalc) {
                    document.body.appendChild(this.contextBody);
                    this.contextBody.classList.add("left-top-force");
                }

                let ctxBodyBoundsAfter = this.contextBody.getBoundingClientRect();
                let bodyBounds = document.body.getBoundingClientRect();

                if(!_notCalc) {
                    this.contextBody.classList.remove("left-top-force");
                    document.body.removeChild(this.contextBody);
                }

                if(this.lOffsetX + ctxBodyBoundsAfter.width > bodyBounds.width) {
                    this.lOffsetX = bodyBounds.width - ctxBodyBoundsAfter.width;
                }

                if(this.lOffsetY + ctxBodyBoundsAfter.height > bodyBounds.height) {
                    this.lOffsetY = bodyBounds.height - ctxBodyBoundsAfter.height;
                }
            },

            _parentActualOffset () {
                let bodyBounds = document.body.getBoundingClientRect();
                let parentBounds = this.parent.getBoundingClientRect();
                let ctxBodyBoundsAfter = this.contextBody.getBoundingClientRect();

                let currentPlacement = this.lPlacement;
                let exitwhen = false;
                let tries = 0;

                while (!exitwhen && tries < 2) {
                    switch (currentPlacement) {
                        case "bottom":
                            this.lOffsetY = parentBounds.y + parentBounds.height + OFFSET;
                            this.lOffsetX = (parentBounds.x + parentBounds.width / 2) - (ctxBodyBoundsAfter.width / 2);

                            if (this.lOffsetX + ctxBodyBoundsAfter.width > bodyBounds.x + bodyBounds.width)
                                this.lOffsetX = bodyBounds.x + bodyBounds.width - (ctxBodyBoundsAfter.width + OFFSET_EDGES);

                            if(this.lOffsetX < bodyBounds.x) {
                                this.lOffsetX = OFFSET_EDGES;
                            }

                            if(this.lOffsetY + ctxBodyBoundsAfter.height > bodyBounds.y + bodyBounds.height) {
                                currentPlacement = "top";
                                tries++;
                                break;
                            }

                            exitwhen = true;
                            break;
                        case "top":
                            this.lOffsetY = parentBounds.y - ctxBodyBoundsAfter.height - OFFSET;
                            this.lOffsetX = (parentBounds.x + parentBounds.width / 2) - (ctxBodyBoundsAfter.width / 2);

                            if (this.lOffsetX + ctxBodyBoundsAfter.width > bodyBounds.x + bodyBounds.width)
                                this.lOffsetX = bodyBounds.x + bodyBounds.width - (ctxBodyBoundsAfter.width + OFFSET_EDGES);

                            if(this.lOffsetX < bodyBounds.x) {
                                this.lOffsetX = OFFSET_EDGES;
                            }

                            if(this.lOffsetY < bodyBounds.y) {
                                currentPlacement = "bottom";
                                tries++;
                                break;
                            }

                            exitwhen = true;
                            break;
                    }
                }

            },
            _recalculate: function () {
                this.contextBody.style.left = this.lOffsetX + "px";
                this.contextBody.style.top = this.lOffsetY + "px";
            }
        },
        watch: {
            activated: function (_val) {
                this.lActivated = _val;
                this._delayedUpdateAttrSF.call();
            },
            offsetX: function (_val) {
                this.lOffsetX = _val;
                this._delayedUpdateAttrSF.call();
            },
            offsetY: function (_val) {
                this.lOffsetY = _val;
                this._delayedUpdateAttrSF.call();
            }
        }
    }

    let counter = 0;
    const ST_INITIAL = counter++;
    const ST_ASK_SHOW = counter++;
    const ST_SET_POSITION = counter++;
    const ST_ACTUALIZE_SIZE = counter++;
    const ST_SHOW = counter++;
    const ST_ASK_HIDE = counter++;
</script>


<style lang="scss">
    @import "src/css/variables";

    .wd-tooltip {
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        pointer-events: none;

        border: 1px solid $border-color-primary-4;
        background: $bg-3;
        overflow: hidden;
        border-radius: 3px;
        box-sizing: border-box;

        left: 0;
        top: 0;
        width: 0;
        height: 0;
        z-index: 1;
        transition: all 200ms;

        .wd-tooltip__content {
            width: auto;
            height: auto;
        }
    }
</style>