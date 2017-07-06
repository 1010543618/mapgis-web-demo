  define([
  'jquery',
  'jquery.browser',
  'OpenLayers',
  'openlayers.magnifyingglass',
  'openlayers.NestFramedCloud',
  'zdclient',
  'zdclient.zdcontrol',
  'om_tool'
  ], function(){
    var om_base = {};
    //放大
    om_base.zoom_in =  function() {
        window.OL_C_ZOOMBOX = new OpenLayers.Control.ZoomBox({ map: OM_OL_MAP });
        OL_C_ZOOMBOX.draw();
        OL_C_ZOOMBOX.activate();
        var cursor_style = 'url('+BASE_URL+'node_modules/mapgis/img/zoomIn.cur),url('+BASE_URL+'node_modules/mapgis/img/zoomIn.cur),auto'; 
        $('#om_map').css("cursor", cursor_style);
    }
    //缩小
    om_base.zoom_out = function() {
        window.OL_C_ZOOMBOX = new OpenLayers.Control.ZoomBox({ map: OM_OL_MAP, out: true });
        OL_C_ZOOMBOX.draw();
        OL_C_ZOOMBOX.activate();
        var cursor_style = 'url('+BASE_URL+'node_modules/mapgis/img/zoomOut.cur),url('+BASE_URL+'node_modules/mapgis/img/zoomOut.cur),auto'; 
        $('#om_map').css("cursor", cursor_style);
    }
    //平移
    om_base.move = function() {
        // 这个不用销毁
        var translation = new OpenLayers.Control.DragPan(OpenLayers.Util.extend({ map: OM_OL_MAP }, null));
        translation.draw();
        translation.activate();
        $('#om_map').css("cursor", "default");
    }
    //地图刷新
    om_base.update = function() {
        om_tool.refresh();
    }
    //地图复位
    om_base.reset = function() {
        OM_OL_MAP.moveTo(new OpenLayers.LonLat(430307, 4351021), 1, {});  //复位到初始级别
    }
    //全图显示
    om_base.zoom_extends = function() {
        OM_OL_MAP.zoomToMaxExtent(); //地图复位到最大范围
    }
    return (window.om_base = om_base);
});