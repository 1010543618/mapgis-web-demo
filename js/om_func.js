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
  var om_func = new Object;

  //-------------------------------------------------查询--------------------------------------------
  //简单
  om_func.simple_query = function(type) { 
    //回调函数
    var callback = function(feature){
      om_tool.removeTip();
      var geomObj;
      if (controlType == 1) {
          geomObj = new Zondy.Object.PointForQuery(); //初始化几何点对象 
          geomObj.setByOL(feature.geometry); //接收客户端绘制的几何点对象 
          geomObj.nearDis = 10;
      }else if (controlType == 2) {
          geomObj = new Zondy.Object.PolyLineForQuery(); //初始化几何线对象 
          geomObj.setByOL(feature.geometry); //接收客户端绘制的线对象 
          geomObj.nearDis = 10;
      }
      else if (controlType == 3) {
          geomObj = new Zondy.Object.Circle(); //初始化几何圆对象 
          geomObj.setByOL(feature.geometry); //接收客户端绘制的圆对象 
      }
      else if (controlType == 4) {
          geomObj = new Zondy.Object.Rectangle(); //初始化几何矩形对象 
          geomObj.setByOL(feature.geometry); //接收客户端绘制的矩形对象 
      }
      else if (controlType == 5) {
          geomObj = new Zondy.Object.Polygon(); //初始化几何多边形对象 
          geomObj.setByOL(feature.geometry); //接收客户端绘制的多边形对象 
          geomObj.nearDis = 0.001;
      }
      feature.destroy();
      var queryStruct = new Zondy.Service.QueryFeatureStruct(); //初始化查询结构对象 
      queryStruct.IncludeGeometry = true; //设置查询结构包含几何信息
      var queryParam = new Zondy.Service.QueryParameter({ geometry: geomObj, resultFormat: "json", struct: queryStruct }); //实例化查询参数对象 
      queryParam.recordNumber = 10000; //设置查询要素数目
      //判断是否有要查询的图层
      if (QUERY_LAYERS.length == 0) {
        $.messager.alert('注意','您尚未激活查询图层,请激活查询后再次执行操作！');
      }else{
        // 清空历史
        for (var i = QUERY_LAYERS.length - 1; i >= 0; i--) {
          ZONDY_SERVICE_QDF = new Zondy.Service.QueryDocFeature(queryParam, OM_CONFIG.mapName, QUERY_LAYERS[i], { ip: OM_CONFIG.ip, port: OM_CONFIG.port });
          //查询并且展示数据
          ZONDY_SERVICE_QDF.query(function(query_result){
            var layer_index = this.layerIndex;
            var layer_name = MAP_LAYER["subLayerNames"][layer_index].toString();
            om_tool.addDataToQueryWindow(layer_index,layer_name,query_result);
          });
        }
        $(OM_QUERY_WINDOW).window('open');
      }
    }
    // 1.清除放大缩小状态
     
    // 2.判断查询条件
    if (type == 'point') {//画点
        om_tool.tip("点击地图要素查询");
        controlType = 1;
        if (OL_CONTROL_DF != null) {
            OL_CONTROL_DF.deactivate();
        }
        OL_CONTROL_DF = new OpenLayers.Control.DrawFeature(geomLayer, OpenLayers.Handler.Point);
    }
    else if (type == 'line') {//画线
        om_tool.tip("在地图上绘制线进行查询");
        controlType = 2;
        if (OL_CONTROL_DF != null) {
            OL_CONTROL_DF.deactivate();
        }
        OL_CONTROL_DF = new OpenLayers.Control.DrawFeature(geomLayer, OpenLayers.Handler.Path);
    }
    else if (type == 'circle') {//画圆
        om_tool.tip("在地图上绘制圆进行查询");
        controlType = 3;
        if (OL_CONTROL_DF != null) {
            OL_CONTROL_DF.deactivate();
        }
        OL_CONTROL_DF = new OpenLayers.Control.DrawFeature(geomLayer, OpenLayers.Handler.RegularPolygon);
        OL_CONTROL_DF.handler.setOptions({ sides: 40 });
    }
    else if (type == 'rectangle') {//画矩形
        om_tool.tip("在地图上拉框进行查询");
        controlType = 4;
        if (OL_CONTROL_DF != null) {
            OL_CONTROL_DF.deactivate();
        }
        OL_CONTROL_DF = new OpenLayers.Control.DrawFeature(geomLayer, OpenLayers.Handler.RegularPolygon);
    }
    else if (type == 'polygon') {// 创建画多边形
        om_tool.tip("在地图上绘制多边形进行查询");
        controlType = 5;
        if (OL_CONTROL_DF != null) {
            OL_CONTROL_DF.deactivate();
        }
        OL_CONTROL_DF = new OpenLayers.Control.DrawFeature(geomLayer, OpenLayers.Handler.geomObj);
    }
    // 3.添加查询回调函数，进行查询
    OL_CONTROL_DF.featureAdded = callback; //回调函数 
    OM_OL_MAP.addControl(OL_CONTROL_DF);
    if (OL_CONTROL_DF) { OL_CONTROL_DF.activate(); }
  }
  //行政区
  om_func.name_query = function(){
    alert('开发中');
  }
  //要素
  om_func.element_query = function(){
      var query = function(e){
        om_tool.removeTip();//移除提示
        var lonlat = OM_OL_MAP.getLonLatFromViewPortPx(e.xy);  //如果小数位数太长，可调用lonlat.lon.toFixed(5);
        eventQueryPopupLonlat = lonlat;
        //添加查询，根据查询结果显示属性信息
        var geomObj = new Zondy.Object.PointForQuery(eventQueryPopupLonlat.lon, eventQueryPopupLonlat.lat);
        geomObj.nearDis = 1; //容差半径,根据地图坐标类型设置
        var queryStruct = new Zondy.Service.QueryFeatureStruct();
        queryStruct.IncludeGeometry = true;
        queryStruct.IncludeAttribute = true;
        var eventQueryLayer = "";
        //    if (s3 == "") {
        for (var z = 0; z < MAP_LAYER["subLayerNames"].length; z++) {
            eventQueryLayer += z + ",";    //所有图层索引0,1,2等
        }
        eventQueryLayer = eventQueryLayer.substring(0, eventQueryLayer.lastIndexOf(',')); //出去最后的逗号
        var queryParam = new Zondy.Service.QueryParameter({ geometry: geomObj, resultFormat: "json", struct: queryStruct });
        ZONDY_SERVICE_QDF = new Zondy.Service.QueryDocFeature(queryParam, OM_CONFIG.mapName, eventQueryLayer, { ip: OM_CONFIG.ip, port: OM_CONFIG.port });
        ZONDY_SERVICE_QDF.query(querySuccess); //查询成功后的回调函数
      }
      var querySuccess = function(data) {
        var eventQueryNull = 0; //用于判断是否选中要素
        for (var z = 0; z < MAP_LAYER["subLayerNames"].length; z++) {
            if (data[z].SFEleArray != null) {
                if (data[z].SFEleArray.length == 0) {
                    return false;
                }
                else {
                    eventQueryEditFID = data[z].SFEleArray[0].FID;//装载所点击要素的FID
                    eventQueryEditLayer = z; //装载全局编辑图层索引
                    eventQueryEditData = data[z]; //装载全局编辑字段数据
                    om_tool.removePopup();
                    var pntPos = eventQueryPopupLonlat;
                    var popupContentHTML = "";
                    for (var k = 0; k <= data[z].AttStruct.FldName.length; k++) {
                        if (k == 0) {
                            popupContentHTML += '<div  style=" font-size:14px; font-family:微软雅黑">' + '<div style=" margin-left:220px;margin-top:0px;cursor:pointer;"><img id="eventQueryClose" style="width:30px; height:30px;" src="'+BASE_URL+'views/third/mapgis/img/feedback_close.png" onclick="om_func.element_query_clear()" /></div>'
                             + '<div style="color:#1446012;width:260px; font-weight:bold">&nbsp;图层：' + '<label >' + MAP_LAYER["subLayerNames"][z] + '</label>' + '</div>'
                             + '<div style="height:1px;line-height: 1px;border-bottom: 1px dashed #FF6203;width:260px;margin-top:2px "></div>';
                        }
                        else {
                            popupContentHTML += '<li id="' + "eventPopup" + k + '" style ="margin-left:10px;margin-top:2px;list-style-type:disc;width:240px; border-bottom:1px solid #ccddff ">' + data[z].AttStruct.FldName[k - 1] + ':<a style=" color:#A52A2A; ">' + data[z].SFEleArray[0].AttValue[k - 1] + '</a>' + '</li>';
                        }
                    }
                    var eventQueryEdit = '<div id="eventQueryClick" style="text-align:center;margin-top:10px;">' + '&nbsp;&nbsp;&nbsp;&nbsp;<input type="button" style="background-color:#fff;border-style:none; border:1px solid #9999ff; width:90px;height:25px;" value="编&nbsp;辑" onclick="eventQueryEdit()"/>&nbsp;&nbsp;&nbsp;&nbsp;' + '<input type="button" style="background-color:#fff;border-style:none; border:1px solid #9999ff;width:90px;height:25px;" value="删&nbsp;除" onclick="eventQueryDeleteByFID()"/>' + '</div>';

                    popupContentHTML += eventQueryEdit + '</div>';
                    var pop = new OpenLayers.Popup.NestFramedCloud(null, pntPos, null, popupContentHTML, null, false, null); 
                    OM_OL_MAP.addPopup(pop, true);
                    pop.panIntoView();  //将溢出的popup移动到可视域范围内
                    $("#progressBar").remove();
                    if (queryPopupArr == null) {
                        queryPopupArr = [];
                    }
                    queryPopupArr.push(pop);
                    flashOneFeatrueNoPan(data[z]); //闪烁但是不移动

                    return;
                }
            }
            else {
                eventQueryNull++;
            }
        }
        if (eventQueryNull == MAP_LAYER["subLayerNames"].length) {
            $.messager.alert('警告',"尚未选中要素，请重新选择(放大地图将有利于您准确选择)！");
        }
      }
      //清除放大缩小状态
      OM_OL_MAP.events.register("click", null, query);
      om_tool.tip("左键点击地图要素查询属性");
  }
  om_func.element_query_clear = function(){
    om_tool.removePopup();
    OM_OL_MAP.events.unregister("click", null, om_func.element_query);
  }
  om_func.condition_query = function(){
    var $input_window = $(OM_INPUT_QUERY_CONDITION_WINDOW);
    var $iqc_layer = $input_find('#iqc-layer');
    var $iqc_attr_col = $input_find('#iqc-attr-col');
    var $iqc_operator_btns = $input_find('.iqc-operator');
    var $iqc_text = $input_find('#iqc-text');
    var $iqc_query = $input_find('#iqc-query');
    var $iqc_text_clear = $input_find('#iqc-text-clear');
    var $iqc_exit = $input_find('#iqc-exit');
    var init_input_codition_window = function(){
      // 初始化选择图层
      $iqc_layer.change(function(){
        var layer_index = $iqc_layer.val();
        if (layer_index != -1) {
          var queryStruct = new Zondy.Service.QueryFeatureStruct(); //初始化查询结构对象 
          queryStruct.IncludeGeometry = false; //设置查询结构不包含几何信息 
          var queryParam = new Zondy.Service.QueryParameter({ resultFormat: "json", struct: queryStruct}); //初始化查询参数对象 
          queryParam.recordNumber = 0; //设置查询要素数目
          var queryService = new Zondy.Service.QueryDocFeature(queryParam, OM_CONFIG.mapName, layer_index, { ip: OM_CONFIG.ip, port: OM_CONFIG.port }); //实例化地图文档查询服务对象 
          queryService.query(function(feature){
            // 初始化选择图层属性数据
            $iqc_attr_col.html("<option value='-1'>===请选择===</option>");
            for (var i = 0; i < feature.AttStruct.FldName.length; i++) {
              $iqc_attr_col.append('<option value='+feature.AttStruct.FldName[i]+'>'+feature.AttStruct.FldName[i]+'</option>');
            }
          }); //查询并回调
        }else{
          $iqc_attr_col.html("<option value='-1'>===请选择===</option>");
        }
      });
      ZONDY_MAPDOC.getMapInfo(function(layer){
        for (var i = 0; i < layer["subLayerNames"].length; i++) {
            $iqc_layer.append('<option value='+i+'>'+layer["subLayerNames"][i]+'</option>');
        }
      }, true, true);
      // 初始化选择图层属性change
      $iqc_attr_col.change(function(){
        if ($iqc_attr_col.val() != -1) {
          $iqc_text.val($iqc_attr_col.val());
        }
      });
      // 初始化运算符按钮
      $iqc_operator_btns.click(function(){
        $iqc_text.val($iqc_text.val()+' '+$(this).val());
      });
      // 初始化清空查询按钮
      $iqc_text_clear.click(function(){
        $iqc_text.val('');
      });
      // 初始化退出按钮
      $iqc_exit.click(function(){
        $input_window('close');
      });
    }
    // 1.初始并弹出化获取条件框
    $iqc_layer.html("<option value='-1'>===请选择===</option>");
    $iqc_attr_col.html("<option value='-1'>===请选择===</option>");
    init_input_codition_window();
    $input_window({'onClose':function(){
      $iqc_text.val('');
      $input_find('*').unbind();
    }});
    // 2.进行查询
    $iqc_query.click(function(){
      var layer_index = $iqc_layer.val();
      if (layer_index != -1) {
        var queryStruct = new Zondy.Service.QueryFeatureStruct();
        queryStruct.IncludeGeometry = true;
        var queryParam = new Zondy.Service.QueryParameter({ resultFormat: "json", struct: queryStruct });
        queryParam.where = $iqc_text.val();
        queryParam.recordNumber = 10000;
        var queryService = new Zondy.Service.QueryDocFeature(queryParam, OM_CONFIG.mapName, layer_index, { ip: OM_CONFIG.ip, port: OM_CONFIG.port });
        queryService.query(function(query_result){
          var layer_index = this.layerIndex;
          var layer_name = MAP_LAYER["subLayerNames"][layer_index].toString();
          $(OM_QUERY_WINDOW).window('open');
          om_tool.addDataToQueryWindow(layer_index,layer_name,query_result);
        });
      }else {
        $.messager.alert('警告','请选择条件查询图层！');
      }
    });
  }
  om_func.file_query = function(){
    alert('开发中');
  }
  //-------------------------------------------分析------------------------------------------------
  om_func.profile_analysis = function() {
    // om_tool.tip("在地图划线进行剖面分析");
    // var allLayerList = new Zondy.Service.Catalog.MapDoc({ docName: OM_CONFIG.mapName, mapIndex: 0 });
    // allLayerList.getLayersInfo(function(){
    //   var drawControl = new OpenLayers.Control.DrawFeature(geomLayer, OpenLayers.Handler.Path);
    //   drawControl.featureAdded = functoin(feature){
    //     om_tool.removeTip(); //移除标注
    //     for (var k = 0; k < feature.geometry.components.length - 1; k++) {
    //         x1 = feature.geometry.components[k]["x"];
    //         y1 = feature.geometry.components[k]["y"];
    //         x2 = feature.geometry.components[k + 1]["x"];
    //         y2 = feature.geometry.components[k + 1]["y"];
    //         var geomObj = new Zondy.Object.PolyLineForQuery(); //初始化几何线对象 
    //         geomObj.setByOL(feature.geometry); //接收客户端绘制的线对象 
    //         geomObj.nearDis = 0.001;
    //         var queryStruct = new Zondy.Service.QueryFeatureStruct(); //初始化查询结构对象 
    //         queryStruct.IncludeGeometry = true; //设置查询结构包含几何信息
    //         var queryParam = new Zondy.Service.QueryParameter({ geometry: geomObj, resultFormat: "json", struct: queryStruct }); //实例化查询参数对象 
    //         queryParam.recordNumber = 10000; //设置查询要素数目
    //         queryService = new Zondy.Service.QueryDocFeature(queryParam, OM_CONFIG.mapName, drawLineString, { ip: OM_CONFIG.ip, port: OM_CONFIG.port });
    //         queryService.query(drawLineSuccess);
    //     }
    //     feature.destroy();
    //   };
    //   OM_OL_MAP.addControl(drawControl);
    // });
    alert('开发中');
  }
  om_func.path_analysis = function() {
    var addr = [];
    var flagPointStr = '';
    var startPnt,endPnt = null;
    //分析成功回调函数，显示路径分析结果
    var onSuccessPath = function(data) {
        if (data.results !== null) {
            var obj = $.parseJSON(data.results[0].Value);
            if (obj != null && obj.Paths.length != 0) {
                if (obj.Paths[0].Edges == null) {
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
                var lin = new OpenLayers.Geometry.LineString(points);
                var linFeature = new OpenLayers.Feature.Vector(lin);
                pathLayer_path = new OpenLayers.Layer.Vector("路径图层");
                OM_OL_MAP.addLayer(pathLayer_path);
                pathLayer_path.style = OpenLayers.Util.extend(OpenLayers.Feature.Vector.style['default'], { strokeColor: "red", strokeWidth: 4 });
                pathLayer_path.addFeatures(linFeature); //将线要素添加到图层
                //移动至路径分析的起点
                var center_x = parseFloat(flagPointStr.split(",")[0]);
                var center_y = parseFloat(flagPointStr.split(",")[1]);
                OM_OL_MAP.panTo(new OpenLayers.LonLat(center_x, center_y));
            }
            else {
                $.messager.alert('警告',"路径分析失败！");
            }
        }
        else {
            $.messager.alert('警告',"路径分析失败！");
        }
    }
    var startPathAnaylse = function(){
      if ($start_select.val() === "请选择地址") {
          $.messager.alert("警告","请输入起点地址");
          return;
      }
      if ($end_select.val() === "请选择地址") {
          $.messager.alert("警告","请输入终点地址");
          return;
      }
      if ($start_select.val() === $end_select.val()) {
          $.messager.alert("警告","起始位置相同，请重新输入！");
          return;
      }
      if (startPnt === null) {
          $.messager.alert("警告","请设置正确的起始点位置！");
          return;
      }
      if (endPnt === null) {
          $.messager.alert("警告","请设置正确的起始点位置！");
          return;
      }
      flagPointStr += startPnt.split(",")[0] + "," + startPnt.split(",")[1];
      flagPointStr += ","+endPnt.split(",")[0] + "," + endPnt.split(",")[1];
      var queryParam = new Zondy.Service.NetAnalysis({
          //调用路径分析接口
          netClsUrl: OM_CONFIG.pathAnalysisUrl, //网络类地址
          flagPosStr: flagPointStr, //网标字符串
          nearDis: 100, //设置搜索网标点的半径
          analyTp: 'UserMode', //用户模式
          weight: ',Weight1,Weight1', //节点权名、去向权名、逆向权名字符串
          elementType: 2//线网标
      });
      queryParam.execute(onSuccessPath);
    }
    var callbackPath = function(feature){
      om_tool.removeTip();
      var lonlat = new OpenLayers.LonLat(feature.geometry.x, feature.geometry.y);
      if (netType == 1) {
          if (markerStart != null && markerStart != "") {
              markersPath.removeMarker(markerStart); //先移除起点标注
          }
          if (pathLayer_path != null) {
              map.removeLayer(pathLayer_path); //移除路径结果层
              pathLayer_path = null;
          }
          markerStart = new OpenLayers.Marker(lonlat, new OpenLayers.Icon(BASE_URL+'views/third/mapgis/img/roadAnalysisA.png', new OpenLayers.Size(40, 40)));
          markersPath.addMarker(markerStart);//添加起点标注
          startPnt = feature.geometry.toShortString(); //设置起点坐标
          if (startPnt != null && startPnt != "") {
              drawControl_path.deactivate();//注销绘制控件
          }
      }
      else if (netType == 2) {
          if (markerEnd != null && markerEnd != "") {
              markersPath.removeMarker(markerEnd); //先移除终点标注
          }
          if (pathLayer_path) {
              map.removeLayer(pathLayer_path); //移除路径结果层
              pathLayer_path = null;
          }
          markerEnd = new OpenLayers.Marker(lonlat, new OpenLayers.Icon(BASE_URL+'views/third/mapgis/img/roadAnalysisB.png', new OpenLayers.Size(40, 40)));
          markersPath.addMarker(markerEnd);//添加终点标注
          endPnt = feature.geometry.toShortString(); //设置终点坐标
          if (endPnt != null && endPnt != "") {
              drawControl_path.deactivate(); //注销绘制控件
          }
      }
      feature.destroy(); //不显示点
    }
    var onSuccessSelect = function(data){
      console.log(data);
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
      $(OM_PATH_ANAYLSE_WINDOW).window().window('open');
      $start_select.html(addr_items);
      $end_select.html(addr_items);

      //改变下拉框时，设置标注(起点)
      $start_select.change(function () {
          for (var i = 0; i < addr.length; i++) {
              if ($(this).val() === addr[i].val) {
                  var lonlat = new OpenLayers.LonLat(addr[i].x, addr[i].y);
                  var markerStart = new OpenLayers.Marker(lonlat, new OpenLayers.Icon(BASE_URL+'views/third/mapgis/img/roadAnalysisA.png', new OpenLayers.Size(40, 40)));
                  markersPath.addMarker(markerStart); //添加起点标注
                  startPnt = addr[i].x + "," + addr[i].y; //设置起点坐标
                  break;
              }
          }
      });
      //改变下拉框时，设置标注(终点)
      $end_select.change(function () {
          for (var i = 0; i < addr.length; i++) {
              if ($(this).val() === addr[i].val) {
                  var lonlat = new OpenLayers.LonLat(addr[i].x, addr[i].y);
                  var markerStart = new OpenLayers.Marker(lonlat, new OpenLayers.Icon(BASE_URL+'views/third/mapgis/img/roadAnalysisB.png', new OpenLayers.Size(40, 40)));
                  markersPath.addMarker(markerStart); //添加起点标注
                  endPnt = addr[i].x + "," + addr[i].y; //设置起点坐标
                  break;
              }
          }
      });
      // 改变文本框设置终点标注
      var netLayer_path = new Zondy.Map.Layer("道路网", [OM_CONFIG.pathAnalysisUrl]);
      var drawPoint_path = new OpenLayers.Layer.Vector("始末点");
      OM_OL_MAP.addLayers([netLayer_path, drawPoint_path]);
      var drawControl_path = new OpenLayers.Control.DrawFeature(drawPoint_path, OpenLayers.Handler.Point, { featureAdded: callbackPath });
      OM_OL_MAP.addControl(drawControl_path);
      var markersPath = new OpenLayers.Layer.Markers("Marker Layer", { displayInLayerSwitcher: false }); //初始化标注图层
      OM_OL_MAP.addLayer(markersPath); //将标注图层加载到地图中
    }
    var $start_select = $('#om-path-anaylse-start-select');
    var $end_select = $('#om-path-anaylse-end-select');
    var queryStruct = new Zondy.Service.QueryFeatureStruct(); //初始化查询结构对象
    queryStruct.IncludeGeometry = true; //设置查询结构包含几何信息
    var queryParam = new Zondy.Service.QueryByLayerParameter(OM_CONFIG.pathAnalysisAddr, { resultFormat: "json", struct: queryStruct });
    queryParam.recordNumber = 10000; //设置查询要素数目
    var queryService = new Zondy.Service.QueryLayerFeature(queryParam, { ip: OM_CONFIG.ip, port: OM_CONFIG.prot });
    queryService.query(onSuccessSelect); //执行查询操作，onSuccessSelect 为查询回调函数
    $('#om-startPathAnaylse').click(startPathAnaylse);
  }


  //-------------------------------------------量算------------------------------------------------
  om_func.measure = function(type) {
    
    switch (type) {
      case "length": //距离测量 
          // if (measureArea != null) {
          //     map.removeControl(measureArea);
          //     measureArea = null;
          // }
          //距离测量控件
          var measureLength = new Zondy.Control.Measure(OpenLayers.Handler.Path);
          OM_OL_MAP.addControl(measureLength); //将距离测量控件加载到地图容器 
          measureLength.activate(); //激活距离测量控件 
          break;
      case "area": //面积测量 
          // if (measureLength != null) {
          //     map.removeControl(measureLength);
          //     measureLength = null;
          // }
          //面积测量控件 
          var measureArea = new Zondy.Control.Measure(OpenLayers.Handler.Polygon);
          OM_OL_MAP.addControl(measureArea); //将面积测量控件加载到地图容器 
          measureArea.activate(); //激活面积测量控件 
          break;
    }
  }
  return (window.om_func = om_func);
});
