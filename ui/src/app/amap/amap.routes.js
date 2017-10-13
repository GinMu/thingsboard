import amapTemplate from './amap.tpl.html';

/* eslint-enable import/no-unresolved, import/default */

/*@ngInject*/
export default function AmapRoutes($stateProvider) {
    $stateProvider
        .state('home.amap', {
            url: '/amap',
            params: {'topIndex': 0},
            module: 'private',
            auth: ['CUSTOMER_USER'],
            views: {
                "content@home": {
                    templateUrl: amapTemplate,
                    controller: 'AmapController',
                    controllerAs: 'vm'
                }
            },
            data: {
                pageTitle: 'amap.amaps'
            },
            ncyBreadcrumb: {
                label: '{"icon": "map", "label": "amap.amaps"}'
            }
        })

}