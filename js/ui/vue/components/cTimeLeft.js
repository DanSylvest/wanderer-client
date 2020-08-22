(function () {
    var template = `

<div class="nowrap">
    
</div>
        
`;
    var calibratedDate = new Date("Mon, 01 Jan 2024 00:00:00 GMT");
    Vue.component("cTimeLeft", {
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
        template: template,
        mounted: function () {
            this._tid = -1;
            this.update();
            this.startTimer();
        },
        beforeDestroy: function () {
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
                var currentDate = new Date();

                var diff = currentDate - this.date;

                var str = this.calculateTimeDiff(diff);

                this.$el.innerText = str;
            },
            calculateTimeDiff: function (_milliseconds) {
                var relativeDate = new Date(+calibratedDate + _milliseconds);

                var seconds = relativeDate.getUTCSeconds();
                var minutes = relativeDate.getUTCMinutes();
                var hours = relativeDate.getUTCHours();
                var days = relativeDate.getUTCDate() - 1;


                seconds = seconds < 10 ? "0" + seconds : seconds;
                minutes = minutes < 10 ? "0" + minutes : minutes;
                hours = hours < 10 ? "0" + hours : hours;

                return `${days} ${hours}:${minutes}:${seconds}`;
            }
        },
        watch: {
            cDate: function(_val, _oldVal) {
                this.date = _val;
                this.update()
            }
        }
    });
})(window);
