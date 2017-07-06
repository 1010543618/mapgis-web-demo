//@ sourceURL=topology_analysis.js
om_func.topology_analysis = function() {
	var GxglCfg = OM_CONFIG;
	
	var $ta_window = $('#om-topology-anaylse-window');
	var $ta_select = $('#om-ta-select');
	var $ta_start = $('#om-ta-start');
	var selectTopControl; //选择控件
	var topDrawLayer; //绘制层
	var topFeatureType = new Array(); //存储要素类型
	var topIndex = 0; //存储索引值
	var topData = new Array(); //存储拓扑几何数据
	var featureInformation = "";
	var temporaryFlashLayer; //临时闪烁层
	var timer_top = null;//临时计时器

	//接收拉框选择对象
	var callbackSelectTop = function(feature) {
	    var geomObj = new Zondy.Object.Polygon();
	    geomObj.setByOL(feature.geometry);
	    feature.destroy();
	    // 在图层中查找
	    var selectLayer = [];
	    for (var i = 0; i < MAP_LAYER["subLayerNames"].length; i++) {
	        selectLayer.push(i);
	    }
	    var selectLayerStr = selectLayer.join(',');
	    var queryStruct = new Zondy.Service.QueryFeatureStruct();  //初始化查询结构对象
	    queryStruct.IncludeGeometry = true; //设置查询结构包含几何信息
	    var queryParam = new Zondy.Service.QueryParameter({ geometry: geomObj, resultFormat: "json", struct: queryStruct, recordNumber: 10000 }); //实例化查询参数对象
	    var queryService = new Zondy.Service.QueryDocFeature(queryParam, GxglCfg.mapName, selectLayer, { ip: GxglCfg.ip });  //实例化地图文档查询服务对象
	    queryService.query(onSuccess_top); //执行查询操作，onSuccess_top 为查询回调函数
	}
	//查询回调函数
	function onSuccess_top(data) {
		var feature = [];// 查询结果个数
		var total_result = 0;// 查询结果个数
		//去除没查到数据的图层
		for (var i = 0; i < MAP_LAYER["subLayerNames"].length; i++) {
			if(data[i].TotalCount !== 0){
				data[i].name = MAP_LAYER["subLayerNames"][i];
				feature.push(data[i]);
				total_result += data[i].TotalCount;
			}
		}
		if (total_result > 2) {
			var select_tree_data = [];
			for (var i = 0; i < feature.length; i++) {
				var feature_data = {};
				feature_data.id = i;
				feature_data.text = feature[i].name;
				feature_data.state = 'closed',
				feature_data.children = [];
				for (var j = 0; j < feature[i].TotalCount; j++) {
					feature_data.children.push({id : i+'-'+feature[i].SFEleArray[j].FID, text : feature[i].SFEleArray[j].FID});
				}
				select_tree_data.push(feature_data);
			}
			// 让用户选择查询元素
			var $select_window = $('<div style="width:200px;height:400px"></div>');
			var $select_tree = $('<ul></ul>');
			$select_tree.tree({
				data : select_tree_data,
				checkbox : true,
				onlyLeafCheck : true
			});
			$select_window.append($select_tree);
			$select_window.window().window('show');
			    
		}
	}
	$ta_window.window().window('open');
	//激活选择控件
    $ta_select.click(function(){
        om_tool.tip("点击地图或拉框选择两个拓扑分析要素");
        if (selectTopControl) {
            selectTopControl.deactivate();
            selectTopControl.activate();
        }
    });

    topDrawLayer = new OpenLayers.Layer.Vector("绘制层"); //初始化绘制层
    temporaryFlashLayer = new OpenLayers.Layer.Vector("临时闪烁层");
    temporaryFlashLayer.style = OpenLayers.Util.extend(OpenLayers.Feature.Vector.style['default'], { strokeColor: "red", strokeWidth: 2 });
    OM_OL_MAP.addLayers([topDrawLayer, temporaryFlashLayer]);
    var flashLayer_space = new OpenLayers.Layer.Vector("flashLayer_space"); //创建闪烁图层并添加到地图容器中
    OM_OL_MAP.addLayer(flashLayer_space);
    selectTopControl = new OpenLayers.Control.DrawFeature(topDrawLayer, OpenLayers.Handler.RegularPolygon, { handlerOptions: { snapAngle: 90, irregular: true }, featureAdded: callbackSelectTop }); //初始化画矩形控件
    OM_OL_MAP.addControl(selectTopControl);
}