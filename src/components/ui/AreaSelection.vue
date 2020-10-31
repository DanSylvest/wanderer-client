<template>
    <div class="c-area-selection absolute top left hidden">

    </div>
</template>

<script>
    import ActionObserver from "../../js/env/actionObserver";
    import Vector2 from "../../js/env/vector2";

    export default {
        name: "AreaSelection",
        props: {

        },
        data: function () {
            return {
            }
        },
        mounted: function () {
            this.parent = this.$el.parentElement;
            this._createActionObserver();
        },
        beforeDestroy: function () {

        },
        methods: {
            _createActionObserver: function () {
                this.ao = new ActionObserver({
                    offOnOut: false,
                    container: this.parent,
                    mdCondition: function (_event) {
                        return _event.originalEvent.ctrlKey;
                    }.bind(this)
                });

                let startPosition = new Vector2();
                let delta = new Vector2();
                this.ao.on("dragStart", function (_event) {
                    this.$emit("selection-started");
                    startPosition = new Vector2(_event.mouse.x, _event.mouse.y);
                    this.$el.classList.remove("hidden");
                    this.$el.style.left = _event.mouse.x + "px";
                    this.$el.style.top = _event.mouse.y + "px";
                    this.$el.style.width = 0 + "px";
                    this.$el.style.height = 0 + "px";
                }.bind(this));

                this.ao.on("dragging", function (_event) {
                    let currentPosition = new Vector2(_event.mouse.x, _event.mouse.y);
                    delta = currentPosition["-"](startPosition);

                    if(delta.x < 0) {
                        this.$el.style.left = currentPosition.x + "px";
                        this.$el.style.width = (delta.x * -1) + "px";
                    } else {
                        this.$el.style.width = delta.x + "px";
                    }

                    if(delta.y < 0) {
                        this.$el.style.top = currentPosition.y + "px";
                        this.$el.style.height = (delta.y * -1) + "px";
                    } else {
                        this.$el.style.height = delta.y + "px";
                    }
                }.bind(this));

                this.ao.on("dragEnd", function (/*_event*/) {
                    this.$el.classList.add("hidden");

                    let leftTop = startPosition.copy();
                    let rightBottom = startPosition["+"](delta);
                    if(delta.x < 0) {
                        leftTop.x = startPosition.x + delta.x;
                        rightBottom.x = startPosition.x;
                    }

                    if(delta.y < 0) {
                        leftTop.y = startPosition.y + delta.y;
                        rightBottom.y = startPosition.y;
                    }

                    this.$emit("selection-completed", {
                        leftTop: leftTop,
                        rightBottom: rightBottom
                    });
                }.bind(this));
            },
        },
        watch: {

        }
    }
</script>