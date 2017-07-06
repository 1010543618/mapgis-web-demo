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
  (function(){
    // 初始化查询
    $(function(){
      $("#om-query-tabs").tabs();
      $("#om-query-window").window();
    });
  })();
  var om_query = {};
  //简单
  om_query.simple_query_point = function() {
    geomObj = new Zondy.Object.PointForQuery(); //初始化几何点对象 
    geomObj.nearDis = 10;
    simple_query("点击地图要素查询", OpenLayers.Handler.Point, geomObj);
  }
  om_query.simple_query_line = function() {
    geomObj = new Zondy.Object.PolyLineForQuery(); //初始化几何线对象 
    geomObj.nearDis = 10;
    simple_query("在地图上绘制线进行查询", OpenLayers.Handler.Path, geomObj)
  }
  om_query.simple_query_circle = function() {
    geomObj = new Zondy.Object.Circle(); //初始化几何圆对象 
    simple_query("在地图上绘制圆进行查询", OpenLayers.Handler.RegularPolygon, geomObj)
  }
  om_query.simple_query_rectangle = function() {
    geomObj = new Zondy.Object.Rectangle(); //初始化几何矩形对象 
    simple_query("在地图上拉框进行查询", OpenLayers.Handler.RegularPolygon, geomObj)
  }
  om_query.simple_query_polygon = function() {
    geomObj = new Zondy.Object.Polygon(); //初始化几何多边形对象 
    geomObj.nearDis = 0.001;
    simple_query("在地图上绘制多边形进行查询", OpenLayers.Handler.Polygon, geomObj)
  }
  function simple_query(tip, handler, geomObj){
    om_tool.tip(tip);
    //创建绘图层
    OL_LAYER_V = new OpenLayers.Layer.Vector();
    window.OM_OL_MAP.addLayer(OL_LAYER_V);
    OL_CONTROL_DF = new OpenLayers.Control.DrawFeature(OL_LAYER_V, handler);
    if (geomObj.getGeometryType() === 'Circle') {
      // 圆查询要加这个
      OL_CONTROL_DF.handler.setOptions({ sides: 40 });
    }
    // 添加查询回调函数，进行查询
    // 清空历史
    om_tool.euCloseAllTabs("#om-query-tabs");
    OL_CONTROL_DF.featureAdded = function(feature){
      OL_CONTROL_DF.deactivate();
      om_tool.removeTip();
      geomObj.setByOL(feature.geometry); //接收客户端绘制的线对象 
      OM_OL_MAP.addControl(OL_CONTROL_DF);
      feature.destroy();
      var queryStruct = new Zondy.Service.QueryFeatureStruct(); //初始化查询结构对象 
      queryStruct.IncludeGeometry = true; //设置查询结构包含几何信息
      var queryParam = new Zondy.Service.QueryParameter({ geometry: geomObj, resultFormat: "json", struct: queryStruct }); //实例化查询参数对象 
      queryParam.recordNumber = 10000; //设置查询要素数目
      //判断是否有要查询的图层
      if (window.MAP_LAYERS['query_layers'].length == 0) {
        $.messager.alert('注意','您尚未激活查询图层,请激活查询后再次执行操作！');
      }else{
        for (var i = window.MAP_LAYERS['query_layers'].length - 1; i >= 0; i--) {
          ZONDY_SERVICE_QDF = new Zondy.Service.QueryDocFeature(queryParam, OM_CONFIG.mapName, window.MAP_LAYERS['query_layers'][i], { ip: OM_CONFIG.ip, port: OM_CONFIG.port });
          //查询并且展示数据
          ZONDY_SERVICE_QDF.query(function(query_result){
            var layer_index = this.layerIndex;
            var layer_name = MAP_LAYERS["subLayerNames"][layer_index].toString();
            addDataToQueryWindow(layer_index,layer_name,query_result);
          });
        }
        // 加载完打开window
        $("#om-query-window").window('open');
      }
    };
    OM_OL_MAP.addControl(OL_CONTROL_DF);
    OL_CONTROL_DF.activate();
  }
  function addDataToQueryWindow(layer_index,layer_name,query_result){
    var table_title_array = [];
    var table_data_array = [];
    $("#om-query-tabs").tabs('add',{
        title:layer_name,
        content:'<table id="dg'+layer_index+'" style="height: 330px;"></table>',
        closable:true,
    });
    if (null == query_result.SFEleArray) {
      for (var i = 0; i < query_result.AttStruct.FldName.length; i++) {
        table_title_array.push({field:query_result.AttStruct.FldName[i],title:query_result.AttStruct.FldName[i]});
      }
      $("#dg"+layer_index).datagrid({ 
        rownumbers:true,
        fitColumns:true,
        pagination:true,
        data:[], 
        columns:[table_title_array]
      });
    }else{
      for (var i = 0; i < query_result.AttStruct.FldName.length; i++) {
        table_title_array.push({field:query_result.AttStruct.FldName[i],title:query_result.AttStruct.FldName[i]});
      }
      //表格数据
      for (var i = 0; i < query_result.SFEleArray.length; i++) {
        var table_data_obj = new Object;
        for (var j = 0; j < query_result.AttStruct.FldName.length; j++) {
          table_data_obj[query_result.AttStruct.FldName[j]] = query_result.SFEleArray[i]['AttValue'][j];
        }
        table_data_array.push(table_data_obj);
      }
      $("#dg"+layer_index).datagrid({ 
        rownumbers:true,
        fitColumns:true,
        pagination:true,
        data:table_data_array.slice(0,10), 
        columns:[table_title_array]
      });
    }
    // 创建表格分页
    var pager = $("#dg"+layer_index).datagrid("getPager");
    pager.pagination({
      total:table_data_array.length, 
      onSelectPage:function (pageNo, pageSize) { 
        var start = (pageNo - 1) * pageSize; 
        var end = start + pageSize; 
        $("#dg"+layer_index).datagrid("loadData", table_data_array.slice(start, end)); 
        pager.pagination('refresh', { 
          total:table_data_array.length,
          pageNumber:pageNo 
        }); 
      } 
    });
  };

  //   else if (type == 'line') {//画线
  //       om_tool.tip("");
  //       controlType = 2;
  //       if (OL_CONTROL_DF != null) {
  //           OL_CONTROL_DF.deactivate();
  //       }
  //       OL_CONTROL_DF = new OpenLayers.Control.DrawFeature(geomLayer, OpenLayers.Handler.Path);
  //   }
  //   else if (type == 'circle') {//画圆
  //       om_tool.tip("在地图上绘制圆进行查询");
  //       controlType = 3;
  //       if (OL_CONTROL_DF != null) {
  //           OL_CONTROL_DF.deactivate();
  //       }
  //       OL_CONTROL_DF = new OpenLayers.Control.DrawFeature(geomLayer, OpenLayers.Handler.RegularPolygon);
  //       OL_CONTROL_DF.handler.setOptions({ sides: 40 });
  //   }
  //   else if (type == 'rectangle') {//画矩形
  //       om_tool.tip("在地图上拉框进行查询");
  //       controlType = 4;
  //       if (OL_CONTROL_DF != null) {
  //           OL_CONTROL_DF.deactivate();
  //       }
  //       OL_CONTROL_DF = new OpenLayers.Control.DrawFeature(geomLayer, OpenLayers.Handler.RegularPolygon);
  //   }
  //   else if (type == 'polygon') {// 创建画多边形
  //       om_tool.tip("在地图上绘制多边形进行查询");
  //       controlType = 5;
  //       if (OL_CONTROL_DF != null) {
  //           OL_CONTROL_DF.deactivate();
  //       }
  //       OL_CONTROL_DF = new OpenLayers.Control.DrawFeature(geomLayer, OpenLayers.Handler.Polygon);
  //   }
    
  //   //回调函数
  //   function callback(feature){
      
  //     var geomObj;
  //     if (controlType == 1) {
          
  //     }else if (controlType == 2) {
  //         geomObj = new Zondy.Object.PolyLineForQuery(); //初始化几何线对象 
  //         geomObj.setByOL(feature.geometry); //接收客户端绘制的线对象 
  //         geomObj.nearDis = 10;
  //     }
  //     else if (controlType == 3) {
  //         geomObj = new Zondy.Object.Circle(); //初始化几何圆对象 
  //         geomObj.setByOL(feature.geometry); //接收客户端绘制的圆对象 
  //     }
  //     else if (controlType == 4) {
  //         geomObj = new Zondy.Object.Rectangle(); //初始化几何矩形对象 
  //         geomObj.setByOL(feature.geometry); //接收客户端绘制的矩形对象 
  //     }
  //     else if (controlType == 5) {
  //         geomObj = new Zondy.Object.Polygon(); //初始化几何多边形对象 
  //         geomObj.setByOL(feature.geometry); //接收客户端绘制的多边形对象 
  //         geomObj.nearDis = 0.001;
  //     }
  //     feature.destroy();
  //     var queryStruct = new Zondy.Service.QueryFeatureStruct(); //初始化查询结构对象 
  //     queryStruct.IncludeGeometry = true; //设置查询结构包含几何信息
  //     var queryParam = new Zondy.Service.QueryParameter({ geometry: geomObj, resultFormat: "json", struct: queryStruct }); //实例化查询参数对象 
  //     queryParam.recordNumber = 10000; //设置查询要素数目
  //     //判断是否有要查询的图层
  //     if (QUERY_LAYERS.length == 0) {
  //       $.messager.alert('注意','您尚未激活查询图层,请激活查询后再次执行操作！');
  //     }else{
  //       // 清空历史
  //       for (var i = QUERY_LAYERS.length - 1; i >= 0; i--) {
  //         ZONDY_SERVICE_QDF = new Zondy.Service.QueryDocFeature(queryParam, OM_CONFIG.mapName, QUERY_LAYERS[i], { ip: OM_CONFIG.ip, port: OM_CONFIG.port });
  //         //查询并且展示数据
  //         ZONDY_SERVICE_QDF.query(function(query_result){
  //           var layer_index = this.layerIndex;
  //           var layer_name = MAP_LAYER["subLayerNames"][layer_index].toString();
  //           om_tool.addDataToQueryWindow(layer_index,layer_name,query_result);
  //         });
  //       }
  //       $(OM_QUERY_WINDOW).window('open');
  //     }
  //   }
  //   if (OL_CONTROL_DF) { OL_CONTROL_DF.activate(); }
  // }
  return (window.om_query = om_query);
});