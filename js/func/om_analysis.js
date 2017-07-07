define([
  'jquery',
  'jquery.browser',
  'openlayers',
  'om-openlayers',
  'openlayers.magnifyingglass',
  'zdclient',
  'zdclient.zdcontrol',
  'om_tool'
  ], function(){
  var om_analysis = {};
  om_analysis.path_analysis = function() {
    //分析成功回调函数，显示路径分析结果
    var startPathAnaylse = function(){
      var flagPointStr = '';
      if (OL_L_MARKERS.markers.length < 2) {
        $.messager.alert('警告',"至少选择两个点进行分析！");
        return;
      }
      var startPnt = OL_L_MARKERS.markers[OL_L_MARKERS.markers.length - 2];
      var endPnt = OL_L_MARKERS.markers[OL_L_MARKERS.markers.length - 1];
      flagPointStr += startPnt.lonlat.lon + "," + startPnt.lonlat.lat + ",";
      flagPointStr += endPnt.lonlat.lon + "," + endPnt.lonlat.lat;
      var queryParam = new Zondy.Service.NetAnalysis({
          //调用路径分析接口
          netClsUrl: OM_CONFIG.pathAnalysisUrl, //网络类地址
          flagPosStr: flagPointStr, //网标字符串
          nearDis: 100, //设置搜索网标点的半径
          analyTp: 'UserMode', //用户模式
          weight: ',Weight1,Weight1', //节点权名、去向权名、逆向权名字符串
          elementType: 2//线网标
      });
      queryParam.execute(function(data) {
        if (data.results === null || data.results[0].Value === '') {
          $.messager.alert('警告',"路径分析失败！请检查起点终点位置。");
          return;
        }
        // 查询回调函数
        var obj = $.parseJSON(data.results[0].Value);
        if (obj == null && (obj.Paths.length == 0 || obj.Paths[0].Edges == null)) {
          $.messager.alert('警告',"路径分析失败！");
          return;
        }
        var points = new Array();
        for (var i = 0; i < obj.Paths[0].Edges.length; i++) {
            for (var j = 0; j < obj.Paths[0].Edges[i].Dots.length; j++) {
                var point = new OpenLayers.Geometry.Point(obj.Paths[0].Edges[i].Dots[j].x, obj.Paths[0].Edges[i].Dots[j].y);
                points.push(point);
            }
        }
        if (typeof OL_L_Vector === 'undefined' || OL_L_Vector.name === null) {
          window.OL_L_Vector = new OpenLayers.Layer.Vector({
            style: OpenLayers.Util.extend(OpenLayers.Feature.Vector.style['default'], { strokeColor: "red", strokeWidth: 4 })
          });
        }
        OL_L_Vector.addFeatures(
          (function(){return new OpenLayers.Feature.Vector(
            (function(){return new OpenLayers.Geometry.LineString(points)})()
          )})()
        );
        OM_OL_MAP.addLayer(OL_L_Vector);
        //移动至路径分析的起点
        var center_x = parseFloat(flagPointStr.split(",")[0]);
        var center_y = parseFloat(flagPointStr.split(",")[1]);
        OM_OL_MAP.panTo(new OpenLayers.LonLat(center_x, center_y));
      });
    }
    var $start_select = $('#om-path-anaylse-start-select');
    var $end_select = $('#om-path-anaylse-end-select');
    // 查询LayerFeature
    var queryService = new Zondy.Service.QueryLayerFeature(
      (function(){
        return new Zondy.Service.QueryByLayerParameter(
          OM_CONFIG.pathAnalysisAddr, 
          { 
            resultFormat: "json",
            struct: (function(){
              return new Zondy.Service.QueryFeatureStruct({IncludeGeometry: true})
            })(),
            recordNumber: 10000
          });
      })(),
      { ip: OM_CONFIG.ip, port: OM_CONFIG.prot });
    // 查询LayerFeature成功，初始化路径分析对话框
    queryService.query(function(data){
      var addr = [];
      //查询回调函数
      // console.log(data);
      window.NET_LAYER = new Zondy.Map.Layer("道路网", [OM_CONFIG.pathAnalysisUrl]);
      window.OL_L_MARKERS = new OpenLayers.Layer.Markers("Marker Layer", { displayInLayerSwitcher: false });
      OM_OL_MAP.addLayers([NET_LAYER, OL_L_MARKERS]);
      var addr_items = '<option>请选择地址</option>';
      addr[0] = {};
      addr[0].val = "请选择地址";
      addr[0].x = "";
      addr[0].y = "";
      for (var i = 0; i < data.TotalCount; i++) {
        addr_items += '<option>' + data.SFEleArray[i]["AttValue"][1] + '</option>';
        addr[i+1] = {};
        addr[i+1].val = data.SFEleArray[i]["AttValue"][1];
        addr[i+1].x = data.SFEleArray[i]["bound"]["xmin"];
        addr[i+1].y = data.SFEleArray[i]["bound"]["ymin"];
      }
      //弹出路径分析对话框
      $('#om-path-anaylse-window').window().window('open');
      $start_select.html(addr_items);
      $end_select.html(addr_items);

      //改变下拉框时，设置标注(起点)
      $start_select.change(function () {
          for (var i = 0; i < addr.length; i++) {
              if ($(this).val() === addr[i].val) {
                  var lonlat = new OpenLayers.LonLat(addr[i].x, addr[i].y);
                  var marker = new OpenLayers.Marker(lonlat, new OpenLayers.Icon(BASE_URL+'node_modules/mapgis/img/roadAnalysisA.png', new OpenLayers.Size(40, 40)));
                  OL_L_MARKERS.addMarker(marker); //添加起点标注
                  break;
              }
          }
      });

      //改变下拉框时，设置标注(终点)
      $end_select.change(function () {
          for (var i = 0; i < addr.length; i++) {
              if ($(this).val() === addr[i].val) {
                  var lonlat = new OpenLayers.LonLat(addr[i].x, addr[i].y);
                  var marker = new OpenLayers.Marker(lonlat, new OpenLayers.Icon(BASE_URL+'node_modules/mapgis/img/roadAnalysisB.png', new OpenLayers.Size(40, 40)));
                  OL_L_MARKERS.addMarker(marker); //添加起点标注
                  break;
              }
          }
      });
    });

    $('#om-startPathAnaylse').click(startPathAnaylse);
  }
  //设置起始点位置
  om_analysis.set_path_analysisA = function() {
    om_tool.tip("点击地图设置起始点位置");
    window.DRAW_POINT = new OpenLayers.Layer.Vector("始末点");
    OM_OL_MAP.addLayers([DRAW_POINT]);
    window.OL_C_DRAWFEATURE = new OpenLayers.Control.DrawFeature(
    DRAW_POINT,
    OpenLayers.Handler.Point,
    {
      featureAdded: function(feature){
        om_tool.removeTip();
        var lonlat = new OpenLayers.LonLat(feature.geometry.x, feature.geometry.y);
        OL_L_MARKERS.addMarker(new OpenLayers.Marker(lonlat, new OpenLayers.Icon(BASE_URL+'node_modules/mapgis/img/roadAnalysisA.png', new OpenLayers.Size(40, 40))));
        OL_C_DRAWFEATURE.deactivate();//注销绘制控件
        feature.destroy(); //不显示点
      }
    });
    OM_OL_MAP.addControl(OL_C_DRAWFEATURE);
    OL_C_DRAWFEATURE.activate();
  }
  //设置终点位置
  om_analysis.set_path_analysisB = function() {
      om_tool.tip("点击地图设置终止点位置");
      window.DRAW_POINT = new OpenLayers.Layer.Vector("始末点");
      OM_OL_MAP.addLayers([DRAW_POINT]);
      window.OL_C_DRAWFEATURE = new OpenLayers.Control.DrawFeature(
      DRAW_POINT,
      OpenLayers.Handler.Point,
      {
        featureAdded: function(feature){
          om_tool.removeTip();
          var lonlat = new OpenLayers.LonLat(feature.geometry.x, feature.geometry.y);
          OL_L_MARKERS.addMarker(
            new OpenLayers.Marker(
              lonlat, new OpenLayers.Icon(
                BASE_URL+'node_modules/mapgis/img/roadAnalysisB.png', new OpenLayers.Size(40, 40)
              )
            )
          );
          OL_C_DRAWFEATURE.deactivate();//注销绘制控件
          feature.destroy(); //不显示点
        }
      });
      OM_OL_MAP.addControl(OL_C_DRAWFEATURE);
      OL_C_DRAWFEATURE.activate();
  }
  om_analysis.clear_path_analysis = function(){
      OL_L_Vector.removeAllFeatures();
      while(OL_L_MARKERS.markers.length){
        OL_L_MARKERS.removeMarker(OL_L_MARKERS.markers[0]);
      }
  }
  om_analysis.measure_length = function() {
    window.ZD_C_MEASURE = new Zondy.Control.Measure(OpenLayers.Handler.Path);
    OM_OL_MAP.addControl(ZD_C_MEASURE); //将距离测量控件加载到地图容器 
    ZD_C_MEASURE.activate(); //激活距离测量控件 
  }
  om_analysis.measure_area = function() {
    window.ZD_C_MEASURE = new Zondy.Control.Measure(OpenLayers.Handler.Polygon);
    OM_OL_MAP.addControl(ZD_C_MEASURE); //将距离测量控件加载到地图容器 
    ZD_C_MEASURE.activate(); //激活距离测量控件 
  }

  return (window.om_analysis = om_analysis);
});