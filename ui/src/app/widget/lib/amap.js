
/*
 * Gin Mu
 * 高德地图
 */
/* eslint-disable */
import './amap.scss';
import AMap from 'AMap';

AMap.Bounds.prototype.extendLatLng = function (obj) {
    var ne = this.eb,
        sw = this.mb;
    var ne2,
        sw2;
    if (obj instanceof AMap.Bounds) {
        ne2 = obj.eb;
        sw2 = obj.mb;
        if (!ne2 || !sw2) {
            return this;
        }
    } else if (obj instanceof AMap.LngLat) {
        ne2 = obj;
        sw2 = obj;
    } else {
        return this;
    }

    if (!ne || !sw) {
        this.eb = angular.copy(ne2);
        this.mb = angular.copy(sw2);
        this.southwest = this.mb;
        this.northeast = this.eb;
    } else {
        sw.O = sw.lat = Math.min(sw2.lat, sw.lat);
        sw.M = sw.lng = Math.min(sw2.lng, sw.lng);
        ne.O = ne.lat = Math.max(ne2.lat, ne.lat);
        ne.M = ne.lng = Math.max(ne2.lng, ne.lng);
    }
    return this;
}



export default class TbAMap {

    constructor($element, initCallback, defaultZoomLevel, dontFitMapBounds, minZoomLevel) {

        this.map = new AMap.Map($element[0], {
            animateEnable: false
        });
        this.defaultZoomLevel = defaultZoomLevel;
        this.dontFitMapBounds = dontFitMapBounds;
        this.minZoomLevel = minZoomLevel;
        this.tooltips = [];

        if (initCallback) {
            setTimeout(initCallback, 0);
        }
    }

    destroy() {
        console.log('销毁Amap地图');
        if (this.map) {
            this.map.destroy();
            this.map = null;
        }
    }


    inited() {
        return angular.isDefined(this.map);
    }

    updateMarkerLabel(marker, settings) {
        console.log('更新markerLabel：', marker, settings);
        marker.setContent('<div style="color: ' + settings.labelColor + ';"><b>' + settings.labelText + '</b></div>');
    }

    updateMarkerColor(marker, color) {
        console.log('更新markerColor：', marker, color);

        var pinColor = color.substr(1);
        var icon = new AMap.Icon({
            image: 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|' + pinColor,
            imageSize: new AMap.Size(21, 34)
        });
        marker.setIcon(icon);
    }

    updateMarkerImage(marker, settings, image, maxSize) {
        console.log('更新markerImage', marker, settings);
        console.log('更新markerImage', image, maxSize);
        var testImage = document.createElement('img'); // eslint-disable-line
        testImage.style.visibility = 'hidden';
        testImage.onload = function () {
            var width;
            var height;
            var aspect = testImage.width / testImage.height;
            document.body.removeChild(testImage); //eslint-disable-line
            if (aspect > 1) {
                width = maxSize;
                height = maxSize / aspect;
            } else {
                width = maxSize * aspect;
                height = maxSize;
            }
            var pinImage = new AMap.Icon({
                image: image,
                size: new AMap.Size(width, height),
                imageSize: new AMap.Size(width, height)
            });
            marker.setIcon(pinImage);
            if (settings.showLabel) {

            }
        }
        document.body.appendChild(testImage); //eslint-disable-line
        testImage.src = image;
    }

    createMarker(location, settings, onClickListener, markerArgs) {
        console.log('创建marker:', location, settings, onClickListener, markerArgs);


        var height = 34;
        var pinColor = settings.color.substr(1);

        var icon = new AMap.Icon({
            image: 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|' + pinColor,
            size: [21, 34]
        });

        var marker = new AMap.Marker({
            icon: icon,
            position: location,
            map: this.map
        });

        if (settings.showLabel) {
            marker.setLabel({
                offset: new AMap.Pixel(-10, -height + 10),
                content: '<div style="color: ' + settings.labelColor + ';"><b>' + settings.labelText + '</b></div>'
            });
        }

        if (settings.useMarkerImage) {
            this.updateMarkerImage(marker, settings, settings.markerImage, settings.markerImageSize || 34);
        }

        if (settings.displayTooltip) {
            this.createTooltip(marker, settings.tooltipPattern, settings.tooltipReplaceInfo, settings.autocloseTooltip, markerArgs);
        }

        if (onClickListener) {
            marker.on('click', onClickListener);
        }

        return marker;
    }

    removeMarker(marker) {
        console.log('删除marker:', marker);
        marker.setMap(null);
    }


    createTooltip(marker, pattern, replaceInfo, autoClose, markerArgs) {
        console.log('创建tooltip:', marker, pattern, replaceInfo, autoClose, markerArgs);

        var popup = new AMap.InfoWindow({
            content: ''
        });
        marker.on('click', () => {
            if (autoClose) {
                this.tooltips.forEach((tooltip) => {
                    tooltip.popup.close();
                });
            }
            popup.open(this.map, marker.getPosition());
        });
        this.tooltips.push({
            markerArgs: markerArgs,
            popup: popup,
            pattern: pattern,
            replaceInfo: replaceInfo
        });
    }

    updatePolylineColor(polyline, settings, color) {
        console.log('更新polylinecolor:', polyline, settings, color);
        var options = {
            path: polyline.getPath(),
            strokeColor: color,
            strokeOpacity: settings.strokeOpacity,
            strokeWeight: settings.strokeWeight,
            map: this.map
        };
        polyline.setOptions(options);
    }

    createPolyline(locations, settings) {
        console.log('创建polyline:', locations, settings);
        var polyline = new AMap.Polyline({
            path: locations,
            strokeColor: settings.color,
            strokeOpacity: settings.strokeOpacity,
            strokeWeight: settings.strokeWeight,
            map: this.map
        });

        return polyline;
    }


    removePolyline(polyline) {
        console.log('删除polyline:', polyline);
        polyline.setMap(null);
    }


    fitBounds(bounds) {
        console.log('fitbounds:', bounds);
        if (bounds.eb && bounds.mb) {
            if (this.dontFitMapBounds && this.defaultZoomLevel) {
                this.map.setZoom(this.defaultZoomLevel);
                console.log('地图中心：', bounds.getCenter());
                let latLng = bounds.getCenter();
                this.map.panTo(latLng);
            } else {
                AMap.event.addListenerOnce(this.map, 'zoomend', () => {
                    console.log('地图变化');
                    if (!this.defaultZoomLevel && this.map.getZoom() > this.minZoomLevel) {
                        this.map.setZoom(this.minZoomLevel);
                    }
                });
                this.map.setBounds(bounds);
            }
        }
    }


    createLatLng(lat, lng) {
        return new AMap.LngLat(lng, lat);
    }

    extendBoundsWithMarker(bounds, marker) {
        console.log('extendBoundsWithMarker:', bounds, marker.getPosition());
        bounds.extendLatLng(marker.getPosition());
    }

    getMarkerPosition(marker) {
        console.log('获取marker位置：', marker);
        return marker.getPosition();
    }

    setMarkerPosition(marker, latLng) {
        console.log('设置marker位置：', marker, latLng);
        marker.setPosition(latLng);
    }

    getPolylineLatLngs(polyline) {
        console.log('获取polylinelatlngs:', polyline);
        return polyline.getPath();
    }

    setPolylineLatLngs(polyline, latLngs) {
        console.log('设置polylinelatlngs:', polyline, latLngs);
        polyline.setPath(latLngs);
    }

    createBounds() {
        return new AMap.Bounds(0, 0);
    }

    extendBounds(bounds, polyline) {
        console.log('扩展bounds:', bounds, polyline.getBounds());
        if (polyline && polyline.getPath()) {
            bounds.extendLatLng(polyline.getBounds());
        }
    }

    invalidateSize() {
        AMap.event.trigger(this.map, "resize");
    }

    getTooltips() {
        console.log('获取tooltips');
        return this.tooltips;
    }


}
