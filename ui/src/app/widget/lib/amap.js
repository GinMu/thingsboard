
/*
 * GinMu(https://github.com/GinMu)
 * AutoNavi Map for Chinese developer.
 * If you wanna use AutoNavi Map javascript sdk,
 * You should add `<script type="text/javascript" src="https://webapi.amap.com/maps?v=${version}&key=${key}"></script>` to index.html
 * and add `externals: {'AMap': 'AMap'}` to webpack config file firstly.
 * Also you can use oclazyload to load it.
 */


import './amap.scss';
import AMap from 'AMap'; //eslint-disable-line

AMap.Bounds.prototype.extendLatLng = function (obj) {
    var eb = this.eb,
        mb = this.mb;
    var eb2,
        mb2;
    if (obj instanceof AMap.Bounds) {
        eb2 = obj.eb;
        mb2 = obj.mb;
        if (!eb2 || !mb2) {
            return this;
        }
    } else if (obj instanceof AMap.LngLat) {
        eb2 = obj;
        mb2 = obj;
    } else {
        return this;
    }

    if (!eb || !mb) {
        this.eb = angular.copy(eb2);
        this.mb = angular.copy(mb2);
        this.southwest = this.mb;
        this.northeast = this.eb;
    } else {
        mb.O = mb.lat = Math.min(mb2.lat, mb.lat);
        mb.M = mb.lng = Math.min(mb2.lng, mb.lng);
        eb.O = eb.lat = Math.max(eb2.lat, eb.lat);
        eb.M = eb.lng = Math.max(eb2.lng, eb.lng);
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
            setTimeout(initCallback, 0); //eslint-disable-line
        }
    }

    destroy() {
        if (this.map) {
            this.map.destroy();
            this.map = null;
        }
    }

    inited() {
        return angular.isDefined(this.map);
    }

    updateMarkerLabel(marker, settings) {
        marker.setContent('<div style="color: ' + settings.labelColor + ';"><b>' + settings.labelText + '</b></div>');
    }

    updateMarkerColor(marker, color) {
        var pinColor = color.substr(1);
        var icon = new AMap.Icon({
            image: 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|' + pinColor,
            imageSize: new AMap.Size(21, 34)
        });
        marker.setIcon(icon);
    }

    updateMarkerImage(marker, settings, image, maxSize) {
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
            // if (settings.showLabel) {

            // }
        }
        document.body.appendChild(testImage); //eslint-disable-line
        testImage.src = image;
    }

    createMarker(location, settings, onClickListener, markerArgs) {
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
                offset: new AMap.Pixel(0, -height + 10),
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
        marker.setMap(null);
    }

    createTooltip(marker, pattern, replaceInfo, autoClose, markerArgs) {
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
        polyline.setMap(null);
    }

    fitBounds(bounds) {
        if (bounds.eb && bounds.mb) {
            if (this.dontFitMapBounds && this.defaultZoomLevel) {
                this.map.setZoom(this.defaultZoomLevel);
                let latLng = bounds.getCenter();
                this.map.panTo(latLng);
            } else {
                AMap.event.addListenerOnce(this.map, 'zoomend', () => {
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
        bounds.extendLatLng(marker.getPosition());
    }

    getMarkerPosition(marker) {
        return marker.getPosition();
    }

    setMarkerPosition(marker, latLng) {
        marker.setPosition(latLng);
    }

    getPolylineLatLngs(polyline) {
        return polyline.getPath();
    }

    setPolylineLatLngs(polyline, latLngs) {
        polyline.setPath(latLngs);
    }

    createBounds() {
        return new AMap.Bounds(0, 0);
    }

    extendBounds(bounds, polyline) {
        if (polyline && polyline.getPath()) {
            bounds.extendLatLng(polyline.getBounds());
        }
    }

    invalidateSize() {
        AMap.event.trigger(this.map, "resize");
    }

    getTooltips() {
        return this.tooltips;
    }
}
