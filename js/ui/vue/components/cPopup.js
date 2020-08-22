(function () {
    var template = `

<div>
    <div class="c-popup-body md-elevation-10 absolute flex flex-vertical flex-justify" >
        <div class="c-popup-head" style="height: 26px;">
            <div class="c-popup-title" style="float: left;">{{cTitle}}</div>
            <div class="c-button" style="float: right;" @click="onCloseClick" >
                <md-icon>close</md-icon>
            </div>
        </div>
        <div class="c-popup-content fh">
            <slot></slot>
        </div>
    </div>
</div>
        
`;

    Vue.component("c-popup", {
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
            }
        },
        template: template,
        mounted: function () {
            this._tid = -1;

            this.popupBody = this.$el.querySelector(".c-popup-body");
            this.$el.removeChild(this.popupBody);

            this.activated && this.show();
            this._recalculate();

            this._handleEvents = function (type, event) {
                this.$emit(type, event);
            };

            this._mousedownHandler = this._handleEvents.bind(this, "mousedown");
            this._mouseupHandler = this._handleEvents.bind(this, "mouseup");

            this.popupBody.addEventListener("mousedown", this._mousedownHandler);
            this.popupBody.addEventListener("mouseup", this._mouseupHandler);
        },
        beforeDestroy: function () {
            this._tid !== -1 && clearTimeout(this._tid);
            this._tid = -1;

            if(this.popupBody.parentElement !== null)
                this.getPopupsContainer().removeChild(this.popupBody);

            this.popupBody.removeEventListener("mousedown", this._mousedownHandler);
            this.popupBody.removeEventListener("mouseup", this._mouseupHandler);

            this._mousedownHandler = null;
            this._mouseupHandler = null;
        },
        methods: {
            getPopupsContainer: function () {
                var arr = document.getElementsByClassName("c-popups-container");

                if(arr.length === 0) {
                    var element = document.createElement("div");
                    document.body.appendChild(element);

                    element.setAttribute("class", "c-popups-container absolute top left");
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
                if(this.popupBody.parentElement === null)
                    this.getPopupsContainer().appendChild(this.popupBody);

                this.popupBody.classList.add("c-popup-animate");

                var handler = function () {
                    this.popupBody.classList.remove("c-popup-animate");
                    this.popupBody.removeEventListener('animationend', handler);
                }.bind(this);

                this.popupBody.addEventListener('animationend', handler);
            },
            hide: function () {
                if(this.popupBody.parentElement !== null)
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
            cActivated: function(_val, _oldVal) {
                this.activated = _val;
                this.update();
            },
            cWidth: function(_val, _oldVal) {
               this.width = _val;
                this.update();
            },
            cHeight: function(_val, _oldVal) {
                this.height = _val;
                this.update();
            }
        }
    });
})(window);
