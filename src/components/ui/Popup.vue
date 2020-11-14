<template>
    <div :class="'wd-popup md-elevation-10 wd absolute flex flex-column padding-primary-minor ' + localClass" >
        <div class="wd-popup__head wd flex flex-justify-sb flex-align-center padding-primary-minor">
            <div class="wd-popup-title" >{{cTitle}}</div>
            <div class="wd-popup-button" @click="onCloseClick" >
                <md-icon>close</md-icon>
            </div>
        </div>
        <div class="wd-popup__content wd f-height">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Popup",
        props: {
            cActivated: {
                type: Boolean,
                default: false
            },
            cTitle: {
                type: String,
                default: ""
            },
            cHorizontalAlignment: {
                type: String,
                default: "left"
            },
            cOffsetX: {
                type: Number,
                default: 0
            },
            cOffsetY: {
                type: Number,
                default: 0
            },
            cWidth: {
                type: Number,
                default: 10,
            },
            cHeight: {
                type: Number,
                default: 10,
            },
            userClass: {
                type: String,
                default: ""
            },
        },
        data: function () {
            return {
                activated: this.cActivated,
                width: this.cWidth,
                height: this.cHeight,
                offsetX: this.cOffsetX,
                offsetY: this.cOffsetY,
                horizontalAlignment: this.cHorizontalAlignment,
                title: this.cTitle,
                localClass: this.userClass,
            }
        },
        mounted: function () {
            this._tid = -1;

            // this.popupBody = this.$el.querySelector(".wd-popup");
            // this.$el.removeChild(this.popupBody);

            this.popupBody = this.$el;
            let parent = this.$el.parentElement;
            parent.removeChild(this.popupBody);

            this.activated && this.show();
            this._recalculate();

            this._handleEvents = function (type, event) {
                this.$emit(type, event);
            };

            this._mousedownHandler = this._handleEvents.bind(this, "mousedown");
            this._mouseupHandler = this._handleEvents.bind(this, "mouseup");

            this.popupBody.addEventListener("mousedown", this._mousedownHandler);
            this.popupBody.addEventListener("mouseup", this._mouseupHandler);

            this.$emit("mounted");
        },
        beforeDestroy: function () {
            this._tid !== -1 && clearTimeout(this._tid);
            this._tid = -1;

            if (this.popupBody.parentElement !== null)
                this.getPopupsContainer().removeChild(this.popupBody);

            this.popupBody.removeEventListener("mousedown", this._mousedownHandler);
            this.popupBody.removeEventListener("mouseup", this._mouseupHandler);

            this._mousedownHandler = null;
            this._mouseupHandler = null;
        },
        methods: {
            getPopupsContainer: function () {
                let arr = document.getElementsByClassName("c-popups-container");
                let element;

                if (arr.length === 0) {
                    element = document.createElement("div");
                    document.body.appendChild(element);

                    element.setAttribute("class", "wd c-popups-container absolute top left");
                    element.style.width = "100%";
                    element.style.height = "0px";
                } else {
                    element = arr[0];
                }

                return element;
            },
            onCloseClick: function () {
                this.$emit('update:c-activated', false);
                this.$emit('c-closed');
            },
            show: function () {
                if (this.popupBody.parentElement === null)
                    this.getPopupsContainer().appendChild(this.popupBody);

                this.popupBody.classList.add("wd-popup-animate");

                let handler = function () {
                    this.popupBody.classList.remove("wd-popup-animate");
                    this.popupBody.removeEventListener('animationend', handler);
                }.bind(this);

                this.popupBody.addEventListener('animationend', handler);
            },
            hide: function () {
                if (this.popupBody.parentElement !== null)
                    this.getPopupsContainer().removeChild(this.popupBody);
            },
            update: function () {
                this._tid !== -1 && clearTimeout(this._tid);
                this._tid = setTimeout(function () {
                    this._tid = -1;
                    this.activated ? this.show() : this.hide();
                    this._recalculate()
                }.bind(this));
            },
            _recalculate: function () {
                this.popupBody.style.width = this.width + "px";
                this.popupBody.style.height = this.height + "px";

                if (this.horizontalAlignment === "left") {
                    this.popupBody.style.right = undefined;
                    this.popupBody.style.left = this.offsetX + "px";
                } else {
                    this.popupBody.style.left = undefined;
                    this.popupBody.style.right = this.offsetX + "px";
                }

                this.popupBody.style.top = this.offsetY + "px";
            }
        },
        watch: {
            cActivated: function (_val) {
                this.activated = _val;
                this.update();
            },
            cWidth: function (_val) {
                this.width = _val;
                this.update();
            },
            cHeight: function (_val) {
                this.height = _val;
                this.update();
            }
        }
    }
</script>

<style>
</style>