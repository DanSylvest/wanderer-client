<template>
    <div class="c-login-page wd fs fms flex flex-justify-center overflow-auto">
        <div class="wd fs fms flex flex-column">

            <!--  Header Menu  -->
            <div class="c-header wd flex-justify-center">
                <div class="c-header-content">
                    <div class="c-menu">
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
                    <div class="c-module c-login-module wd flex-column flex-h-center">
                        <div class="wd fs fms md-layout md-alignment-center-center flex-column" style="min-height: 250px;">
                            <div class="c-module-header">
                                <a class="c-link" title="What it is?" style="margin-right: 5px;" target="_blank" href="http://community.eveonline.com/news/dev-blogs/eve-online-sso-and-what-you-need-to-know" >Authorize</a>
                                <span>with your EVE account</span>
                            </div>
                            <div class="md-elevation-2 c-login-eve-sso-button" @click="onEveSSOLogin">
                                <img src="../../images/EVE_SSO_Login_Buttons_Large_Black.png" alt="background">
                            </div>
                        </div>
                    </div>

                    <div class="c-module wd flex flex-column flex-h-center">
                        <div class="c-module-header">Read the guide</div>
                        <div class="c-module-content">
                            <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</span>
                            <p>1) kek</p>
                            <p>2) kek</p>
                            <p>3) kek</p>
                            <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</span>
                        </div>
                    </div>

                    <div class="c-module wd flex flex-column flex-h-center">
                        <div class="c-module-header">About wanderer</div>
                        <div class="c-module-content">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>
                    </div>

                    <div class="c-module wd flex flex-column flex-h-center">
                        <div class="c-module-header">Read the announcements</div>
                        <div class="c-module-content">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>
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
    import ssoAuth from "../../js/api/ssoAuth";

    export default {
        name: "Login",
        props: [

        ],
        data: function () {
            return {
                dialogRegisterShow: false,
                dialogRegisterTitle: "",
                dialogRegisterDescription: "",

                dialogLoginShow: false,
                dialogLoginTitle: "",
                dialogLoginDescription: "",

                loginNicknameIcon: "warning",
                loginPasswordIcon: "warning",
                loginPasswordRepeatIcon: "warning",
                regNicknameIcon: "warning",
                regPasswordIcon: "warning",
                regPasswordRepeatIcon: "warning",
                currentTab: "",
                nickname: "",
                password: "",
                regNickname: "",
                regPassword: "",
                regPasswordRepeat: "",
                buttonDisabled: true
            }
        },
        mounted: function () {

        },
        methods: {
            onSubmit: function () {
                if (this.currentTab === "tab-login")
                    this.submitLogin();
                else
                    this.submitRegister();
            },
            submitLogin: function () {
                api.user.login(this.nickname, this.password).then(function(_token) {
                    // this.showLoginDialog("Great with registration, " + this.regNickname, "Now you can enjoy this mapper!");
                    // this.currentTab = "tab-login";
                    // this.clearForm();
                    cookie.set("token", _token);
                    location.reload();
                }.bind(this), function(_errMsg) {
                    this.showLoginDialog("Error!", _errMsg);
                }.bind(this));
            },
            showRegisterDialog: function (_title, _message){
                this.dialogRegisterShow = true;
                this.dialogRegisterTitle = _title;
                this.dialogRegisterDescription = _message;
            },
            showLoginDialog: function (_title, _message){
                this.dialogLoginShow = true;
                this.dialogLoginTitle = _title;
                this.dialogLoginDescription = _message;
            },
            clearForm: function () {
                this.regNickname = "";
                this.regPassword = "";
                this.regPasswordRepeat = "";
                this.nickname = "";
                this.password = "";
            },
            submitRegister: function () {
                api.user.register(0, {mail: this.regNickname, password: this.regPassword}).then(function() {
                    this.showRegisterDialog("Great with registration, " + this.regNickname, "Now you can enjoy this mapper!");
                    this.currentTab = "tab-login";
                    this.clearForm();
                }.bind(this), function(_errMsg) {
                    this.showRegisterDialog("Error!", _errMsg);
                }.bind(this));
            },
            onFormChange: function () {
                if(this.currentTab === "tab-login")
                    this.validateLoginForm();
                else
                    this.validateRegisterForm();
            },
            validateLoginForm: function ( ){
                let isValidNickName = validateNickname(this.nickname);
                let isValidPassword = validatePassword(this.password);

                this.setFieldState("login", "Nickname", isValidNickName);
                this.setFieldState("login", "Password", isValidPassword);

                this.buttonDisabled = !(isValidNickName && isValidPassword);
            },
            validateRegisterForm: function ( ){
                let isValidNickName = validateNickname(this.regNickname);
                let isValidPassword = validatePassword(this.regPassword);
                let isValidPasswordRepeat = validatePassword(this.regPasswordRepeat) && this.regPassword === this.regPasswordRepeat;

                this.setFieldState("reg", "Nickname", isValidNickName);
                this.setFieldState("reg", "Password", isValidPassword);
                this.setFieldState("reg", "PasswordRepeat", isValidPasswordRepeat);

                this.buttonDisabled = !(isValidNickName && isValidPassword && isValidPasswordRepeat);
            },
            onTabChange: function (_tabId) {
                if(_tabId) {
                    this.currentTab = _tabId;
                    this.onFormChange();
                }
            },
            setFieldState: function (_type, _field, _valid) {
                this[_type + _field + "Icon"] = _valid ? "done": "warning";
            },
            onEveSSOLogin: function () {
                ssoAuth(query.toString({
                    page: "ssoAuthResponseForLogin"
                }));
            }
        }
    }

    const validateNickname = function (_nickname) {
        if(!_nickname)
            return false;

        if(_nickname.length <= 3)
            return false;

        return !!_nickname.match(/([A-Za-z_][A-Za-z0-9]+?)@(.+)/);
    };

    const validatePassword = function (_pass) {
        if(!_pass)
            return false;

        if(_pass.length <= 5)
            return false;

        return !!_pass.match(/[A-Z]/m) && !!_pass.match(/[a-z]/m) && !!_pass.match(/[0-9]/m);
    };
</script>

<style>
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
    $linkColor: #3c558e;
    $linkColorHover: #6486d4;
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



