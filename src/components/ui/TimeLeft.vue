<template>
    <div class="nowrap">

    </div>
</template>

<script>
    const calibratedDate = new Date("Mon, 01 Jan 2024 00:00:00 GMT");

    export default {
        name: "TimeLeft",
        props: {
            cDate: {
                type: Date,
                default: new Date()
            }
        },
        data: function () {
            return {
                date: this.cDate
            }
        },
        mounted: function () {
            this._tid = -1;
            this.update();
            this.startTimer();
        },
        beforeUnmount: function () {
            this._tid !== -1 && clearTimeout(this._tid);
            this._tid = -1;
            this.date = null;
        },
        methods: {
            startTimer: function () {
                this._tid = setTimeout(function () {
                    this._tid = -1;
                    this.update();
                    this.startTimer();
                }.bind(this), 1000);
            },
            update: function () {
                let currentDate = new Date();
                let diff = currentDate - this.date;
                this.$el.innerText = this.calculateTimeDiff(diff);
            },
            calculateTimeDiff: function (_milliseconds) {
                let relativeDate = new Date(+calibratedDate + _milliseconds);
                let seconds = relativeDate.getUTCSeconds();
                let minutes = relativeDate.getUTCMinutes();
                let hours = relativeDate.getUTCHours();
                let days = relativeDate.getUTCDate() - 1;

                seconds = seconds < 10 ? "0" + seconds : seconds;
                minutes = minutes < 10 ? "0" + minutes : minutes;
                hours = hours < 10 ? "0" + hours : hours;

                return `${days} ${hours}:${minutes}:${seconds}`;
            }
        },
        watch: {
            cDate: function (_val) {
                this.date = _val;
                this.update()
            }
        }
    }

</script>