<template>
    <div class="wd fs md-layout md-alignment-center-center">
        <div class="Loader" data-text="Wanderer">
            <span class="Loader__Circle"></span>
            <span class="Loader__Circle"></span>
            <span class="Loader__Circle"></span>
            <span class="Loader__Circle"></span>
        </div>
    </div>
</template>

<script>
    export default {
        name: "MainLoader"
    }
</script>

<style scoped lang="postcss">

    .Loader {
        padding-top: 10px;
        width: 150px;
        height: 150px;
    }

    :root { /* Fill data-text */
    }
















    /* █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ */



    .Loader {
        position: relative;
        width: 150px;
        width: 150px;
        min-width: 110px;
        overflow: visible;
        margin: 20px;
        border-radius: 50%;
        box-shadow: inset 0 0 8px rgba(255, 255, 255, .4), 0 0 25px rgba(255, 255, 255, .8)
    }



    .Loader::after {
        content: attr(data-text);
        color: #CECECE;
        color: #CECECE;
        position: absolute;
        left: 50%;
        top: 50%;
        -webkit-transform: translate(-50%,-50%);
        transform: translate(-50%,-50%);
        font-size: calc(70% + 0.1vw);
        text-transform: uppercase;
        letter-spacing: 5px;
    }



    .Loader { /* Keep ratio on resize */
    }



    .Loader::before {
        content: '';
        float: left;
        padding-top: 100%;
    }



    .Loader__Circle {
        display: block;
        position: absolute;
        border-radius: 50%;
        top: 0px;
        right: 0px;
        bottom: 0px;
        left: 0px;
        opacity: 0.8;
        mix-blend-mode: screen;
        filter: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg"><filter id="filter"><feComponentTransfer color-interpolation-filters="sRGB"><feFuncR type="linear" slope="1.2" /><feFuncG type="linear" slope="1.2" /><feFuncB type="linear" slope="1.2" /></feComponentTransfer></filter></svg>#filter');
        -webkit-filter: brightness(120%);
        filter: brightness(120%);
        -webkit-animation-name: SpinAround;
        animation-name: SpinAround;
        -webkit-animation-iteration-count: infinite;
        animation-iteration-count: infinite;
        -webkit-animation-duration: 2s;
        animation-duration: 2s;
        -webkit-animation-fill-mode: both;
        animation-fill-mode: both;
        -webkit-animation-timing-function: linear;
        animation-timing-function: linear
    }



    .Loader__Circle:nth-of-type(1) {
        box-shadow:
                inset 1px 0 0 1px #2979FF,
                4px 0 0 4px #2979FF;
        box-shadow:
                inset 1px 0 0 1px #2979FF,
                4px 0 0 4px #2979FF;
        box-shadow:
                inset 1px 0 0 1px #2979FF,
                4px 0 0 3px #2979FF;
        box-shadow:
                inset 1px 0 0 1px #2979FF,
                4px 0 0 3px #2979FF;
        box-shadow:
                inset 1px 0 0 1px #2979FF,
                3px 0 0 4px #2979FF;
        box-shadow:
                inset 1px 0 0 1px #2979FF,
                3px 0 0 4px #2979FF;
        box-shadow:
                inset 1px 0 0 1px #2979FF,
                3px 0 0 3px #2979FF;
        box-shadow:
                inset 1px 0 0 1px #2979FF,
                3px 0 0 3px #2979FF;
        box-shadow:
                inset 1px 0 0 1px #2979FF,
                4px 0 0 4px #2979FF;
        box-shadow:
                inset 1px 0 0 1px #2979FF,
                4px 0 0 4px #2979FF;
        box-shadow:
                inset 1px 0 0 1px #2979FF,
                4px 0 0 3px #2979FF;
        box-shadow:
                inset 1px 0 0 1px #2979FF,
                4px 0 0 3px #2979FF;
        box-shadow:
                inset 1px 0 0 1px #2979FF,
                3px 0 0 4px #2979FF;
        box-shadow:
                inset 1px 0 0 1px #2979FF,
                3px 0 0 4px #2979FF;
        box-shadow:
                inset 1px 0 0 1px #2979FF,
                3px 0 0 3px #2979FF;
        box-shadow:
                inset 1px 0 0 1px #2979FF,
                3px 0 0 3px #2979FF;
        animation-direction: reverse;
        -webkit-transform-origin: 49.6% 49.8%;
        transform-origin: 49.6% 49.8%;
    }



    .Loader__Circle:nth-of-type(2) {
        box-shadow:
                inset 1px 0 0 1px #FF1744,
                4px 0px 0 4px #FF1744;
        box-shadow:
                inset 1px 0 0 1px #FF1744,
                4px 0px 0 4px #FF1744;
        box-shadow:
                inset 1px 0 0 1px #FF1744,
                4px 0px 0 3px #FF1744;
        box-shadow:
                inset 1px 0 0 1px #FF1744,
                4px 0px 0 3px #FF1744;
        box-shadow:
                inset 1px 0 0 1px #FF1744,
                3px 0px 0 4px #FF1744;
        box-shadow:
                inset 1px 0 0 1px #FF1744,
                3px 0px 0 4px #FF1744;
        box-shadow:
                inset 1px 0 0 1px #FF1744,
                3px 0px 0 3px #FF1744;
        box-shadow:
                inset 1px 0 0 1px #FF1744,
                3px 0px 0 3px #FF1744;
        box-shadow:
                inset 1px 0 0 1px #FF1744,
                4px 0px 0 4px #FF1744;
        box-shadow:
                inset 1px 0 0 1px #FF1744,
                4px 0px 0 4px #FF1744;
        box-shadow:
                inset 1px 0 0 1px #FF1744,
                4px 0px 0 3px #FF1744;
        box-shadow:
                inset 1px 0 0 1px #FF1744,
                4px 0px 0 3px #FF1744;
        box-shadow:
                inset 1px 0 0 1px #FF1744,
                3px 0px 0 4px #FF1744;
        box-shadow:
                inset 1px 0 0 1px #FF1744,
                3px 0px 0 4px #FF1744;
        box-shadow:
                inset 1px 0 0 1px #FF1744,
                3px 0px 0 3px #FF1744;
        box-shadow:
                inset 1px 0 0 1px #FF1744,
                3px 0px 0 3px #FF1744;
        -webkit-transform-origin: 49.5% 49.8%;
        transform-origin: 49.5% 49.8%;
    }



    .Loader__Circle:nth-of-type(3) {
        box-shadow:
                inset 1px 0 0 1px #FFFF8D,
                0 4px 0 4px #FFFF8D;
        box-shadow:
                inset 1px 0 0 1px #FFFF8D,
                0 4px 0 4px #FFFF8D;
        box-shadow:
                inset 1px 0 0 1px #FFFF8D,
                0 4px 0 3px #FFFF8D;
        box-shadow:
                inset 1px 0 0 1px #FFFF8D,
                0 4px 0 3px #FFFF8D;
        box-shadow:
                inset 1px 0 0 1px #FFFF8D,
                0 3px 0 4px #FFFF8D;
        box-shadow:
                inset 1px 0 0 1px #FFFF8D,
                0 3px 0 4px #FFFF8D;
        box-shadow:
                inset 1px 0 0 1px #FFFF8D,
                0 3px 0 3px #FFFF8D;
        box-shadow:
                inset 1px 0 0 1px #FFFF8D,
                0 3px 0 3px #FFFF8D;
        box-shadow:
                inset 1px 0 0 1px #FFFF8D,
                0 4px 0 4px #FFFF8D;
        box-shadow:
                inset 1px 0 0 1px #FFFF8D,
                0 4px 0 4px #FFFF8D;
        box-shadow:
                inset 1px 0 0 1px #FFFF8D,
                0 4px 0 3px #FFFF8D;
        box-shadow:
                inset 1px 0 0 1px #FFFF8D,
                0 4px 0 3px #FFFF8D;
        box-shadow:
                inset 1px 0 0 1px #FFFF8D,
                0 3px 0 4px #FFFF8D;
        box-shadow:
                inset 1px 0 0 1px #FFFF8D,
                0 3px 0 4px #FFFF8D;
        box-shadow:
                inset 1px 0 0 1px #FFFF8D,
                0 3px 0 3px #FFFF8D;
        box-shadow:
                inset 1px 0 0 1px #FFFF8D,
                0 3px 0 3px #FFFF8D;
        -webkit-transform-origin: 49.8% 49.8%;
        transform-origin: 49.8% 49.8%;
    }



    .Loader__Circle:nth-of-type(4) {
        box-shadow:
                inset 1px 0 0 1px #B2FF59,
                0 4px 0 4px #B2FF59;
        box-shadow:
                inset 1px 0 0 1px #B2FF59,
                0 4px 0 4px #B2FF59;
        box-shadow:
                inset 1px 0 0 1px #B2FF59,
                0 4px 0 3px #B2FF59;
        box-shadow:
                inset 1px 0 0 1px #B2FF59,
                0 4px 0 3px #B2FF59;
        box-shadow:
                inset 1px 0 0 1px #B2FF59,
                0 3px 0 4px #B2FF59;
        box-shadow:
                inset 1px 0 0 1px #B2FF59,
                0 3px 0 4px #B2FF59;
        box-shadow:
                inset 1px 0 0 1px #B2FF59,
                0 3px 0 3px #B2FF59;
        box-shadow:
                inset 1px 0 0 1px #B2FF59,
                0 3px 0 3px #B2FF59;
        box-shadow:
                inset 1px 0 0 1px #B2FF59,
                0 4px 0 4px #B2FF59;
        box-shadow:
                inset 1px 0 0 1px #B2FF59,
                0 4px 0 4px #B2FF59;
        box-shadow:
                inset 1px 0 0 1px #B2FF59,
                0 4px 0 3px #B2FF59;
        box-shadow:
                inset 1px 0 0 1px #B2FF59,
                0 4px 0 3px #B2FF59;
        box-shadow:
                inset 1px 0 0 1px #B2FF59,
                0 3px 0 4px #B2FF59;
        box-shadow:
                inset 1px 0 0 1px #B2FF59,
                0 3px 0 4px #B2FF59;
        box-shadow:
                inset 1px 0 0 1px #B2FF59,
                0 3px 0 3px #B2FF59;
        box-shadow:
                inset 1px 0 0 1px #B2FF59,
                0 3px 0 3px #B2FF59;
        -webkit-transform-origin: 49.7% 49.7%;
        transform-origin: 49.7% 49.7%;
    }



    @-webkit-keyframes SpinAround {
        0% {
            -webkit-transform: rotate(0);
            transform: rotate(0);
        }

        100% {
            -webkit-transform: rotate(-360deg);
            transform: rotate(-360deg);
        }
    }



    @keyframes SpinAround {
        0% {
            -webkit-transform: rotate(0);
            transform: rotate(0);
        }

        100% {
            -webkit-transform: rotate(-360deg);
            transform: rotate(-360deg);
        }
    }
</style>