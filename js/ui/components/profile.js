(function () {
    var componentId = "ui/components/profile";

    define(componentId, [], function () {
        var template = `
           <div class="">
                Coming soon...
            </div>
        
        `;

        Vue.component("profile", {
            props: [

            ],
            data: function () {
                return {

                }
            },
            template: template,
            mounted: function () {

            },
            methods: {
                refresh: function () {

                },
            }
        });
    });
})(window);

