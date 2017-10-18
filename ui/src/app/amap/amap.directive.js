/*
 * Gin Mu
 * 高德地图angular指令
 */
/* eslint-disable import/no-unresolved, import/default */



import TbAMap from '../widget/lib/amap';

/*@ngInject*/
export default function AmapDirective() {
    return {
        restrict: "E",
        template: '<div style="height: 500px;"></div>',
        replace: true,
        link: function (scope, element, attrs) { //eslint-disable-line
            var ctx = {
                $scope: scope.$new()
            }
            var map = new TbAMap(element[0], ctx);
            map.init();
        }
    };
}
