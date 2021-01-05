<template>
    <div class="c-login-page wd fs fms flex flex-justify-center overflow-auto">
        <div class="wd fs fms flex flex-column">

            <!--  Header Menu  -->
            <div class="c-header wd flex-justify-center" >
                <div class="c-header-content">
                    <div class="c-menu" style="display: none">
                        <div>Login</div>
                        <div>Guide</div>
                        <div>About</div>
                        <div>Announcements</div>
                    </div>
                </div>
            </div>

            <!--    Content        -->
            <div class="c-content wd flex-justify-center">
                <div class="wd flex c-modules">

                    <!-- Login -->
                    <div class="c-module c-login-module wd flex-column flex-align-center">
                        <div class="wd fs fms md-layout md-alignment-center-center flex-column" style="min-height: 250px;">
                            <div class="c-module-header">
                                <a
                                    class="c-link"
                                    title="What it is?"
                                    style="margin-right: 5px;" target="_blank"
                                    href="http://community.eveonline.com/news/dev-blogs/eve-online-sso-and-what-you-need-to-know"
                                >Authorize</a>
                                <span>with your EVE account</span>
                            </div>
                            <div class="md-elevation-2 c-login-eve-sso-button" @click="onEveSSOLogin">
                                <img src="../../images/EVE_SSO_Login_Buttons_Large_Black.png" alt="background">
                            </div>
                        </div>
                    </div>

                    <div class="c-module wd flex flex-column flex-align-center">
                        <div class="c-module-header">
                            <h3>About wanderer</h3>
                        </div>
                        <div class="c-module-content">
                            <br />
                            <div class="wd text-align-center">
                                <span class="c-text-dec-accent" >Greetings, Pilot!</span>
                                &nbsp;
                                <span>I am happy to meet you here!</span>
                            </div>
                            <p class="wd flex flex-justify-center">This is a first beta test of this mapper, and you have ability to make mapper better!</p>
                            <p class="wd flex flex-justify-center">Here will be small guide wideo, when i make it :)</p>
                            <p class="wd text-align-center">
                                I started it in 2020, and now this mapper tool have enough functional for normal testing.
                                Sometimes i will drop databases, or mapper will be down. You can go to
                                <a class="c-link" target="_blank" href="https://t.me/joinchat/G1FrT_bDz8ozcGGg">Telegram group</a>
                                and ask any questions or report about bug or your ideas.

                                Also this is an
                                <a class="c-link" target="_blank" href="https://github.com/DanSylvest">open source code project</a>
                                and you can found it on <a>GitHub</a>.
                            </p>

                            <br />
                            <br />

                            <h4 class="wd flex flex-justify-center">This project client side created with:</h4>
                            <div class="wd flex flex-justify-center">
                                <ul class="wd-list" style="width: 300px">
                                    <li>Vue - as core</li>
                                    <li>VueMaterial - as ui framework</li>
                                    <li>d3js - as force library</li>
                                </ul>
                            </div>

                            <h4 class="wd flex flex-justify-center">This project server side created with:</h4>
                            <div class="wd flex flex-justify-center">
                                <ul class="wd-list"  style="width: 300px">
                                    <li>NodeJS - as platform</li>
                                    <li>PostgreSQL - as SQL library</li>
                                </ul>
                            </div>

                            <br />
                            <br />

                        </div>
                    </div>

<!--                    <div class="c-module wd flex flex-column flex-align-center">-->
<!--                        <div class="c-module-header">Read the guide</div>-->
<!--                        <div class="c-module-content">-->
<!--                            <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</span>-->
<!--                            <p>1) kek</p>-->
<!--                            <p>2) kek</p>-->
<!--                            <p>3) kek</p>-->
<!--                            <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</span>-->
<!--                        </div>-->
<!--                    </div>-->

<!--                    <div class="c-module wd flex flex-column flex-align-center">-->
<!--                        <div class="c-module-header">Read the announcements</div>-->
<!--                        <div class="c-module-content">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>-->
<!--                    </div>-->

                    <div class="c-module wd flex flex-column flex-align-center" style="min-height: initial !important;">
                        <div class="c-module-header"><h3>License</h3></div>
                        <div class="c-module-content">
                            <div class="wd-license wd flex-align-center flex c-content">
                                <img src="ccpLogo.png" width="130" style="margin-right: 20px">
                                <div class="wd-color-primary-2">
                                    EVE Online and the EVE logo are the registered trademarks of CCP hf. All rights are reserved worldwide.
                                    All other trademarks are the property of their respective owners.
                                    EVE Online, the EVE logo, EVE and all associated logos and designs are the intellectual property of CCP hf.
                                    All artwork, screenshots, characters, vehicles, storylines, world facts or other recognizable features of the
                                    intellectual property relating to these trademarks are likewise the intellectual property of CCP hf.
                                    CCP is in no way responsible for the content on or functioning of this website, nor can it be liable for
                                    any damage arising from the use of this website.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>

        </div>



    </div>
</template>

<script>
    import cookie from "../../js/env/cookie";
    import query from "../../js/env/query";
    import api from "../../js/api";
    import authRequest from "../../js/utils/authRequest";

    export default {
        name: "Login",
        props: [],
        data: function () {
            return {}
        },
        mounted: function () {},
        methods: {
            onEveSSOLogin: function () {
                api.user.getAuthToken("auth").then(function(_token){
                    cookie.set("authToken", _token);

                    authRequest(query.toString({
                        page: "ssoAuth"
                    }));
                }.bind(this));
            }
        }
    }
</script>

<style lang="scss">
    h1,h2,h3,h4,h5,h6, ul {
        margin: 0;
        padding:0;
    }

    h4 {
        margin: 5px 0;
    }

    ul.wd-list {
        & > li {
            margin-left: 65px;
        }
    }

    .wd-license {
        width: 800px;
    }

    .c-login-page::-webkit-scrollbar {
        width: 10px;
    }
    .c-login-page::-webkit-scrollbar:hover {

    }

    .c-login-page::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.0);
    }

    .c-login-page::-webkit-scrollbar-thumb {
        transition: background-color 200ms;
        width: 8px;
        border-radius: 3px;
        background-color: rgba(95, 83, 83, 0.5);
        cursor: pointer;
    }

    .c-login-page::-webkit-scrollbar-thumb:hover {
        background-color: rgba(128, 126, 126, 0.5);
    }
</style>

<style lang="scss">
    $linkColor: #6486d4;
    $linkColorHover: #b0c3ef;
    $headerContentBackground: rgba(22,22,22,0.2);

    $background1: #212121;
    $foreground1: #8e8e8e;
    $foreground2: #aaaaaa;
    $foregroundSecondary1:  rgba(255, 255, 255, 0.61);
    $foregroundSecondary1Hover: rgba(255, 255, 255, 1);

    @media screen and (min-width: 1300px) {
        .c-login-page {
            .c-modules {
                width: 1200px;
            }
        }
    }


    a.c-link {
        transition: color 200ms;
        text-decoration: none;
        color: $linkColor !important;
        cursor: pointer;
    }

    a.c-link:hover {
        text-decoration: none;
        color: $linkColorHover !important;
    }


    .c-text-dec-accent {
        transition: color 200ms;
        color: rgb(246, 212, 144);
        /*cursor: pointer;*/
    }

    .c-login-page {
        width: 100%;
        height: 100%;

        .c-header {
            display: flex;
            min-height: 400px;
            background-position: top center;
            background-size: cover;
            background-repeat: no-repeat;
            border-bottom: 5px solid rgba(139, 125, 125, 0.1);

            background-image: url("./../../images/eveNorm.jpg");
        }

        .c-content {
            box-sizing: border-box;
            padding: 20px;
            display: flex;
            width: 100%;
        }

        .c-header-content {
            width: 100%;
            background-color: $headerContentBackground;
            box-sizing: border-box;
            padding-top: 20px;
            padding-right: 40px;
            padding-left: 40px;
        }

        .c-modules {
            display: flex;
            flex-direction: column;
            box-shadow: 0 0 0 7px rgba(47, 47, 47, 0.5);
            border-radius: 14px;
            background-color: $background1;
            top: -200px;
            box-sizing: border-box;
            position: relative;

            .c-module {
                box-sizing: border-box;
                padding: 20px;
                width: 100%;
                min-height: 300px;

                .c-module-header {
                    user-select: none;
                    margin-bottom: 20px;
                    font-size: 18px;
                    text-align: center;
                    color: $foreground1;
                }

                .c-module-content {
                    /*width: 100%;*/
                    text-align: left;
                    color: $foreground2;
                }
            }

            .c-module:not(:last-child) {
                border-bottom: 1px solid rgba(139, 125, 125, 0.1);
            }
        }

        .c-module.c-login-module {
            min-height: 250px;

            .c-login-eve-sso-button {
                transition: box-shadow 200ms;
                border-radius: 3px;
                cursor: pointer;
                box-shadow: 2px 3px 6px 2px rgba(0, 0, 0, 0.37);
            }

            .c-login-eve-sso-button:hover {
                box-shadow: 1px 2px 3px 0 #0000005c;
            }
        }

        .c-menu {
            display: flex;
            justify-content: flex-end;
            text-transform: uppercase;
            letter-spacing: 3px;
            font-size: calc(80% + 0.1vw);
        }

        .c-menu > div {
            user-select: none;
            cursor: pointer;
            transition: color 100ms;
            color: $foregroundSecondary1;
        }

        .c-menu > div:hover {
            color: $foregroundSecondary1Hover;
        }

        .c-menu > div:not(:last-child) {
            padding-right: 20px;
        }
    }
</style>



