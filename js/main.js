requirejs.config({
    urlArgs: "bust=" +  (new Date()).getTime(),
    baseUrl: BASE_URL,
    waitSeconds: 0,
    paths: {
        'jquery':'node_modules/jquery/dist/jquery',
        'jquery.easyui':'node_modules/demo-jquery-easyui/jquery.easyui.min',
        'jquery.easyui.ribbon':'node_modules/demo-jquery-easyui-ribbon/jquery.ribbon',
        'jquery.browser':'node_modules/mapgis/jquery.browser',
        'openlayers':'node_modules/mapgis/openlayers',
        'om-openlayers':'js/om-openlayers',
        'openlayers.magnifyingglass':'node_modules/mapgis/openlayers-magnifyingglass',
        'zdclient':'node_modules/mapgis/zdclient',
        'zdclient.zdcontrol':'node_modules/mapgis/zdcontrol',
        'iziModal':'node_modules/iziModal/js/iziModal.min',
        'store':'node_modules/store-js/dist/store.legacy.min',
        'jquery.smartresize':'js/jquery.smartresize',
        'user_module':'js/user-module',
        'om_init':'js/om_init',
        'om_tool':'js/om_tool',
        'om_func':'js/om_func',
        'om_layer':'js/func/om_layer',
        'om_base':'js/func/om_base',
        'om_query':'js/func/om_query',
    },
    shim: {
        'store':{
            shim:'store'
        },
        'jquery.smartresize' : ['jquery'],
        'jquery.browser' :['jquery'],
        'jquery.easyui' : ['jquery'],
        'jquery.easyui.ribbon' : ['jquery','jquery.easyui'],
        'iziModal':['jquery'],
        'openlayers.magnifyingglass' : ['openlayers'],
        'zdclient' : ['jquery.browser','openlayers'],
        'zdclient.zdcontrol' : ['zdclient'],
        'om_init' : [
          'jquery',
          'jquery.easyui',
          'jquery.easyui.ribbon',
          'jquery.smartresize',
          'jquery.browser',
          'openlayers',
          'openlayers.magnifyingglass',
          'zdclient',
          'zdclient.zdcontrol',
          'iziModal',
          'om_func',
          'om_tool'
          ],
    }
});
// 初始化user_module
requirejs(['user_module'],function(){
    UserModule.init(null, SITE_URL+'/user/login', SITE_URL+'/user/login', SITE_URL+'/user/logout');
});

requirejs(['om_init'],function () {
    var mapSqlName = "gxgl";//数据库名称
    window.OM_CONFIG = {
        ip:"127.0.0.1",//ip地址
        port:"6163",//端口号
        mapName: "gxgl",//地图服务名称
        resolution:7.8,//分辨率
        mapBound: new OpenLayers.Bounds(428993.7136, 4350000, 431500, 4352002.484),//范围
        pathAnalysisUrl: "gdbp://MapGisLocal/" + mapSqlName + "/ds/gxgl_set/ncls/道路网",//路径分析Url
        pathAnalysisAddr: "gdbp://MapGisLocal/" + mapSqlName + "/ds/gxgl_set/sfcls/地址点", //路径分析地址点
        bufferSourceSet: "gdbp://MapGisLocal/" + mapSqlName + "/ds/buffer/sfcls/", //缓冲区分析分析Url
        overlaySourceSet: "gdbp://MapGisLocal/" + mapSqlName + "/ds/overlay/sfcls/",//叠加分析Url
        SrcLayer: "gdbp://MapGisLocal/" + mapSqlName + "/ds/gxgl_set/sfcls/", //空间分析Url
        clipSourceSet: "gdbp://MapGisLocal/" + mapSqlName + "/ds/clip/sfcls/"//裁剪分析Url
    };
    window.OL_EVENTS = {};
    window.OM_OL_MAP = new OpenLayers.Map('om_map', { numZoomLevels: 10, maxExtent: OM_CONFIG.mapBound, maxResolution: OM_CONFIG.resolution,
        //当前地图采用坐标系（墨卡托坐标）            
        projection: "EPSG:900913",
        //数据采用的坐标系  
        displayProjection: "EPSG:4326",
        units: "m"
    });
    //地图加载
    window.OM_ZD_MAP_DOC = new Zondy.Map.Doc("管线地图", OM_CONFIG.mapName, { ip: OM_CONFIG.ip, port: OM_CONFIG.port, transitionEffect: "resize", singleTile: true }); //,guid:statisOper.guid
    window.OM_OL_MAP.addLayers([window.OM_ZD_MAP_DOC]);
    window.ZD_S_C_MAPDOC = new Zondy.Service.Catalog.MapDoc({ docName: OM_CONFIG.mapName, ip: OM_CONFIG.ip, port: OM_CONFIG.port, mapIndex: 0 });
    window.ZD_S_C_MAPDOC.getMapInfo(function(layers){
      window.MAP_LAYERS = layers;
      window.MAP_LAYERS['hide_layers'] = [];
      window.MAP_LAYERS['query_layers'] = [];
      window.MAP_LAYERS['edit_layers'] = [];
      om_init.init_map_layer(layers);
    }, true, true);
    om_init.init_ribbon();
    om_init.init_map();
    // om_init.init_login();
    // om_init.init_iziModal();
    // //init OM_QUERY_WINDOW
    // $(OM_QUERY_WINDOW).window({
    //   closed:true,
    //   onOpen:function(){
    //     $(OM_QUERY_TABS).tabs();
    //     om_tool.euCloseAllTabs(OM_QUERY_TABS);
    //   }
    // });
});

