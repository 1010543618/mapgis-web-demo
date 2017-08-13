define(['jquery'], function($){
  var om_tool = new Object;
  //刷新地图
  om_tool.refresh = function() {
      window.OM_OL_MAP.baseLayer.clearGrid();
      window.OM_OL_MAP.baseLayer.redraw();
  }
  //提示
  om_tool.tip = function(info) {
      if ($("#toolTip").length > 0) {
          $("#toolTip").remove();
      }
      $(document.body).append('<div id="toolTip" style="display:none; position:absolute;background-color:#cde6c7;padding:2px 5px 2px 5px; border:1px solid red;font-size:12px;color:black; z-index:10000">' + info + '</div>');
      $(document.body).mousemove(function (e) {
          $("#toolTip").css({ "left": e.pageX + 8, "top": e.pageY - 18, "display": "block" });
      });
  }
  //清除提示
  om_tool.removeTip = function() {
    if ($("#toolTip").length > 0) {
        $("#toolTip").remove();
    }
  }
  //关闭全部tabs
  om_tool.euCloseAllTabs = function(tabs_selecter){
    //删除tab后tabs.length的长度会变
    var titles = new Array();  
    var tabs = $(tabs_selecter).tabs('tabs');
    for(var i=0;i<tabs.length;i++){
        titles.push(tabs[i].panel('options').title);
    }
    for (var i = 0; i < titles.length; i++) {
      $(tabs_selecter).tabs('close', titles[i]); 
    }
  }
  om_tool.gatAllVisibleLayerIndex = function(){
    var arr = [];
    for (var i = 0; i < MAP_LAYERS.subLayerNames.length; i++) {
        if ($.inArray(i, MAP_LAYERS.hide_layers) === -1) arr.push(i);
    }
    return arr;
  }

  om_tool.reset = function() {
    om_tool.removeTip();//移除提示
    // 地图事件
    OM_OL_MAP.events.unregister("click", null, window.OL_EVENTS.query);
    

    if (typeof ZD_M_LAYER != 'undefined') {
      ZD_M_LAYER.destroy();
    }
    if (typeof ZD_M_LAYER != 'undefined') {
      NET_LAYER.destroy();
    }
    // 向量图层
    if (typeof OL_L_Vector != 'undefined') {
      OL_L_Vector.destroy();
    }
    if (typeof OL_L_VECTOR_SELECTED != 'undefined') {
      OL_L_VECTOR_SELECTED.destroy();
    }
    // 标注图层
    if (typeof OL_L_MARKERS != 'undefined') {
        OL_L_MARKERS.destroy();
    }
    // 绘制控件
    if (typeof OL_C_DRAWFEATURE != 'undefined') {
        OL_C_DRAWFEATURE.destroy();
    }
    // 测量控件
    if (typeof ZD_C_MEASURE != 'undefined') {
        ZD_C_MEASURE.destroy();
    }
    // 缩放控件
    if (typeof OL_C_ZOOMBOX != 'undefined') {
        OL_C_ZOOMBOX.destroy();
        $('#om_map').css('cursor', 'default');
    }
    // 绘图控件
    if (typeof OL_C_DRAWFEATURE != 'undefined') {
      OL_C_DRAWFEATURE.destroy();
    }
  }
  




  //清除地图事件监听
  om_tool.removeOLMapEvent = function(event, func) {
    if ($("#toolTip").length > 0) {
        $("#toolTip").remove();
    }
  }
  om_tool.removePopup = function() {
    om_tool.removeTip(); //移除提示
    if (flashLayer != null) {
      flashLayer.removeAllFeatures();    //清空闪烁图层要素
    }
    if (queryPopupArr) {
      var len = queryPopupArr.length;
      for (var i = 0; i < len; i++) {
          if (queryPopupArr[i]) {
              OM_OL_MAP.removePopup(queryPopupArr[i]);
          }
      }
      queryPopupArr = null;
    }
  }

  // jquery扩展
  $.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
  };
  return (window.om_tool = om_tool);
});


function do_nothing(){}

//开始闪烁 
function startFlash() {
    if (timer != null) {
        clearInterval(timer); //清除计时器 
    }
    timer = setInterval(function() {
        if (flashLayer_query != null) {
            if (flashLayer_query.visibility) {
                flashLayer_query.setVisibility(false); //隐藏闪烁要素图层 
            }
            else {
                flashLayer_query.setVisibility(true); //显示闪烁要素图层 
            }
        }
    }, 500); //设置切换图层可见性的计时器 
}

//闪烁但是不移动
// om_tool.flashOneFeatrueNoPan(jsonObj) {
//     if (flashLayer == null || jsonObj == null) {
//         return;
//     }else {
//         flashLayer.removeAllFeatures();
//     }
//     if (jsonObj.SFEleArray == null || jsonObj.SFEleArray.length <= 0) {
//         return;
//     }else {
//         var format = new Zondy.Format.PolygonJSON();
//         var features = format.read(jsonObj); //解析 JSON 对象 
//         flashLayer.setVisibility(true); //设置图层可见 
//         flashLayer.addFeatures(features); //将要素添加到图层中
//     }
//     startFlash(); //闪烁要素 
// }

//切换图层的可见属性，实现闪烁效果 



//-------------------------------------------------------------条件查询-----------------------------------------------------------



//条件查询回调函数
function querySuccess(data) {
      
}
function queryResult_con(a, m_layer, layerIndex) {
    if (a == null || a.SFEleArray == null || a.SFEleArray.length <= 0) {
        return;
    }
    if (m_layer == null) { return; }
    var strjson = new Array(a.SFEleArray.length)
    for (i = 0; i < a.SFEleArray.length; i++) {
        strjson[i] = {};
        for (k = 0; k <= a.AttStruct.FldName.length; k++) {
            if (k == 0) {
                strjson[i]["FID"] = a.SFEleArray[i].FID;
            }
            else {
                strjson[i][a.AttStruct.FldName[k - 1]] = a.SFEleArray[i].AttValue[k - 1];
            }
        }
    }
//    m_layer.setVisibility(false); //设置闪烁要素图层不可见 
    createHotPolyAll(a, m_layer); //创建闪烁要素
    //格式化后的 JSON 数据 
    CustomersData = {
        Rows: strjson,
        Total: a.SFEleArray.length
    };
    //设置要在表格显示的数据对象 
    var filedStr = new Array(a.AttStruct.FldName.length - 1);
    for (var k = 0; k <= a.AttStruct.FldName.length; k++) {
        filedStr[k] = {};
    }
    for (var m = 0; m <= a.AttStruct.FldName.length; m++) {
        if (m == 0) {
            filedStr[m]["display"] = "FID";
            filedStr[m]["name"] = "FID";
        }
        else {
            filedStr[m]["display"] = a.AttStruct.FldName[m - 1];
            filedStr[m]["name"] = a.AttStruct.FldName[m - 1];
            filedStr[m]["editor"] = "text";
        }
        filedStr[m]["align"] = "center";
        filedStr[m]["width"] = 85;
    }
    //初始化查询结果表格控件
    grid = $("#tab1").ligerGrid({
        columns: filedStr, //列 
        data: CustomersData, //表格数据 
        sortName: a.AttStruct.FldName, //列名 
        isScroll: true,
        width: "98%",
        height: "250px",
        pageSize: 15, //每页默认的结果数 
        pageSizeOptions: [15, 20, 25, 30], //可选择设定的每页结果数 
        //表格选中行事件
        onSelectRow: function (data, rowobj, rowindex) {
            var fid = data.FID.valueOf(); //获取当前选中行要素的 FID 
            queryByID(fid, layerIndex); //通过要素 FID 查询该要素的几何信息并闪烁 
        }
    });
    document.getElementById("tab1_a").style.display = "block";
    if (document.getElementById("tab1_a").style.display == "block") {
        $("#progressBar").remove();
        document.getElementById("queryResult").style.display = "block";
    }
    }
    function queryResult_conNull(a, m_layer) {
        m_layer.setVisibility(false); //设置闪烁要素图层不可见   
        //设置要在表格显示的数据对象 
        var filedStr = new Array(a.AttStruct.FldName.length - 1);
        for (var k = 0; k <= a.AttStruct.FldName.length; k++) {
            filedStr[k] = {};
        }
        for (var m = 0; m <= a.AttStruct.FldName.length; m++) {
            if (m == 0) {
                filedStr[m]["display"] = "FID";
                filedStr[m]["name"] = "FID";
            }
            else {
                filedStr[m]["display"] = a.AttStruct.FldName[m - 1];
                filedStr[m]["name"] = a.AttStruct.FldName[m - 1];
                filedStr[m]["editor"] = "text";
            }
            filedStr[m]["align"] = "center";
            filedStr[m]["width"] = 85;
        }
        grid = $("#tab1").ligerGrid({
            columns: filedStr, //列 
            data: null, //表格数据 
            sortName: a.AttStruct.FldName, //列名 
            isScroll: true,
            width: "98%",
            height: "250px",
            pageSize: 15, //每页默认的结果数 
            pageSizeOptions: [15, 20, 25, 30] //可选择设定的每页结果数 
        });
        document.getElementById("tab1_a").style.display = "block";
        if (document.getElementById("tab1_a").style.display == "block") {
            $("#progressBar").remove();
            document.getElementById("queryResult").style.display = "block";
        }
    }
    function closeQueryC() {
        document.getElementById('queryTable').remove();
        if (flashLayer_query != null) {
            flashLayer_query.removeAllFeatures();    //清空闪烁图层要素
        }
        if (timer != null) {
            clearInterval(timer); //清除计时器 
        }
    }

