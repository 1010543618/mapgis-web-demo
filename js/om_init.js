define([
  'jquery',
  'jquery.easyui',
  'jquery.easyui.ribbon',
  'jquery.smartresize',
  'jquery.browser',
  'openlayers',
  'om-openlayers',
  'openlayers.magnifyingglass',
  'zdclient',
  'zdclient.zdcontrol',
  'iziModal',
  'om_layer'
  ], function(){
  var om_init = new Object;
  om_init.init_ribbon = function() {
    var om_ribbon_data = {
        selected:0, //默认第几个是选择的
        tabs:[{
            title:'开始',
            groups:[{
                title:'地图操作',
                tools:[{
                    name:'om_base.zoom_in()',
                    text:'放大',
                    iconCls:'icon-zoom-in icon-large',
                    iconAlign:'top',
                    size:'large'
                },{
                    name:'om_base.zoom_out()',
                    text:'缩小',
                    iconCls:'icon-zoom-out icon-large',
                    iconAlign:'top',
                    size:'large'
                },{
                    name:'om_base.move()',
                    text:'移动',
                    iconCls:'icon-move icon-large',
                    iconAlign:'top',
                    size:'large'
                },{
                    name:'om_base.update()',
                    text:'更新',
                    iconCls:'icon-update icon-large',
                    iconAlign:'top',
                    size:'large'
                },{
                    name:'om_base.reset()',
                    text:'复位',
                    iconCls:'icon-reset icon-large',
                    iconAlign:'top',
                    size:'large'
                },{
                    name:'om_base.zoom_extends()',
                    text:'全图显示',
                    iconCls:'icon-zoom-extends icon-large',
                    iconAlign:'top',
                    size:'large'
                }]
            }]
        },{
            title:'查询',
            groups:[{
                title:'基本查询',
                dir:'v',
                tools:[{
                    name:'om_query.element_query()',
                    text:'要素查询',
                    iconCls:'icon-element-query icon-small'
                },{
                    name:'om_query.name_query()',
                    text:'名称查询',
                    iconCls:'icon-name-query icon-small'
                },{
                    type:'menubutton',
                    text:'简单查询',
                    iconCls:'icon-select icon-small',
                    menuItems:[{
                        name:"om_query.simple_query_point()",
                        text:'画点查询',
                        iconCls:'icon-ponit-query icon-small'
                    },{
                        name:"om_query.simple_query_line()",
                        text:'画线查询',
                        iconCls:'icon-line-query icon-small'
                    },{
                        name:"om_query.simple_query_circle()",
                        text:'画圆查询',
                        iconCls:'icon-circle-query icon-small'
                    },{
                        name:"om_query.simple_query_rectangle()",
                        text:'拉框查询',
                        iconCls:'icon-rectangle-query icon-small'
                    },{
                        name:"om_query.simple_query_polygon()",
                        text:'多边形查询',
                        iconCls:'icon-polygon-query icon-small'
                    }]
                }]
            },{
                title:'高级查询',
                tools:[{
                    name:"om_query.condition_query()",
                    text:'条件查询',
                    iconCls:'icon-condition-query icon-large',
                    iconAlign:'top',
                    size:'large'
                },{
                    name:"om_query.district_query()",
                    text:'按行政区查询',
                    iconCls:'icon-district-query icon-large',
                    iconAlign:'top',
                    size:'large'
                }]
            }]
        },{
            title:'分析&量算',
            groups:[{
                title:'分析',
                tools:[{
                    name:"om_analysis.path_analysis()",
                    text:'路径分析',
                    iconCls:'icon-path-analysis icon-large',
                    iconAlign:'top',
                    size:'large'
                },{
                    name:"om_analysis.topology_analysis()",
                    text:'拓扑分析',
                    iconCls:'icon-topology-analysis icon-large',
                    iconAlign:'top',
                    size:'large'
                },{
                    name:"om_analysis.buffer_analysis()",
                    text:'缓冲区分析',
                    iconCls:'icon-buffer-analysis icon-large',
                    iconAlign:'top',
                    size:'large'
                },{
                    name:"om_analysis.overlay_analysis()",
                    text:'叠加分析',
                    iconCls:'icon-overlay-analysis icon-large',
                    iconAlign:'top',
                    size:'large'
                },{
                    name:"om_analysis.clip_analysis()",
                    text:'裁剪分析',
                    iconCls:'icon-clip-analysis icon-large',
                    iconAlign:'top',
                    size:'large'
                }]
            },{
                title:'量算',
                tools:[{
                    name:"om_analysis.measure_length()",
                    text:'距离量算',
                    iconCls:'icon-measure-length icon-large',
                    iconAlign:'top',
                    size:'large'
                },{
                    name:"om_analysis.measure_area()",
                    text:'面积量算',
                    iconCls:'icon-measure-area icon-large',
                    iconAlign:'top',
                    size:'large'
                }]
            }]
        },{
            title:'编辑',
            groups:[{
                title:'编辑',
                tools:[{
                    name:"om_edit.add_point()",
                    text:'添加点要素',
                    iconCls:'icon-add-point icon-large',
                    iconAlign:'top',
                    size:'large'
                },{
                    name:"om_edit.add_line()",
                    text:'添加线要素',
                    iconCls:'icon-add-line icon-large',
                    iconAlign:'top',
                    size:'large'
                },{
                    name:"om_edit.add_polygon()",
                    text:'添加面要素',
                    iconCls:'icon-add-polygon icon-large',
                    iconAlign:'top',
                    size:'large'
                }]
            }]
        }]
    }
    // tab第一项om_base是默认加载的
    require(['om_base']);
    $('#mapgis-ribbon').ribbon({
        data:om_ribbon_data,
        onClick: function(name, target){
          // 点击了工具
          // if (name) {
          //   eval(name)
          // }
          if (name) {
            om_tool.reset();
            eval(name);
          }
        }
    }).tabs({
      onSelect: function(title, index){
        // 选择了tab（从0开始）
        switch(index){
          case 0:
            break;
          case 1:
            require(['om_query']);
            break;
          case 2:
            require(['om_analysis']);
            break;
          case 3:
            require(['om_edit']);
            break;
          default:
            alert('未定义的tab');
            break;
        }
      }
    });
  }
  om_init.init_map = function(){
      //地图漫游
      var mapPan = new OpenLayers.Control.TouchNavigation({
          dragPanOptions: {//惯性滑动
              enableKinetic: true
          }
      });
      OM_OL_MAP.addControl(mapPan);
      //鼠标滚动特效
      var glassUpDown = new OpenLayers.Control.MagnifyingGlass();
      OM_OL_MAP.addControl(glassUpDown);
      overViewMap = new Zondy.Control.OverviewMap();
      OM_OL_MAP.addControl(overViewMap);
      OM_OL_MAP.addControl(new OpenLayers.Control.PanZoomBar());
      OM_OL_MAP.setCenter(new OpenLayers.LonLat(430307, 4351021), 1);
      
      //固定地图大小
      var height = $(window).height() - $("#mapgis-ribbon").offset().top - $("#mapgis-ribbon").height() - 8;
      $("#om_map,#om_map_layer").height(height);
      $('#om_map').bind("contextmenu",function(e){
        e.preventDefault();
        $('#om_map-menu').menu().menu('show', {
          left: e.pageX,
          top: e.pageY
        });
      });
      // #mapgis-ribbon生成后调节#om_map,#om_map_layer高度
      $(window).smartresize(function(){  
          var height = $(window).height() - $("#mapgis-ribbon").offset().top - $("#mapgis-ribbon").height() - 8;
          $("#om_map,#om_map_layer").height(height);
      });
  }
  om_init.init_map_layer = function(layers) { //初始化图层列表
    var branch1 = new Object();
    var branch2 = new Object();
    var branch3_arr = new Array();
    $.each(layers["subLayerNames"], function (index, value) {
        branch3 = new Object();
        branch3.id = index;
        branch3.text = value;
        branch3.iconCls = "fa fa-eye om-layer-icon";
        branch3.attributes = {'status':'show'};
        branch3_arr.push(branch3);
    });

    branch2.text = layers["name"];
    branch2.state = 'open';
    branch2.children = branch3_arr;

    branch1.text = '地图文档';
    branch1.state = 'open';
    branch1.children = [branch2];
    $(function(){
      $("#om_map_layer-tree").tree({
        data:[branch1],
        onContextMenu: function(e, node){
            e.preventDefault();
            // select the node
            $('#om_map_layer-tree').tree('select', node.target);
            // display context menu
            $('#om_map_layer-menu').menu({
                onClick:function(item){
                    switch(item.text){
                        case '显示' :
                            om_layer.layer_show(node);
                            break;
                        case '隐藏' :
                            om_layer.layer_hide(node);
                            break;
                        case '查询' :
                            om_layer.layer_query(node);
                            break;
                        case '编辑' :
                            om_layer.layer_edit(node);
                            break;
                        case '查看属性表' :
                            om_layer.layer_table(node);
                            break;
                    }
                }
            });
            $('#om_map_layer-menu').menu('show', {
                left: e.pageX,
                top: e.pageY
            });
        }
      });
    });
  }
  om_init.init_navbar = function(){
  	// 小屏幕当点击导航条收回列表
    $("#dt-navbar-collapse").click(function(){  
        // $('#collapse').addClass("collapsed");  
        // $('#collapse').attr("aria-expanded",false);  
        $("#dt-navbar-collapse").removeClass("in");  
        $("#dt-navbar-collapse").attr("aria-expanded",false);
    });
  }
  om_init.init_login = function(){
  	// 用户登录
    $("#user-login").click(function(event){
        event.preventDefault();
        var $login_btn = $(this);
        // 正在登录的话不重复提交
        if ($login_btn.hasClass('btn-disabled')) {
            return;
        }

        $login_btn.addClass('btn-disabled').text('正在登录。。。');
        var post_data = new Object();
        post_data['user_name'] = $("#user-name").val();
        post_data['user_pwd'] = $("#user-pwd").val();
        console.log(post_data);
        $.post("<?=site_url('front/user/do_login')?>", post_data, function(data){
        if (data['status'] == true) {
            window.location.href = "<?=site_url('front/index/home')?>";
        }else{
            $login_btn.removeClass('btn-disabled').text('登录');
            console.log('登录失败');
            if (data['message'] == '用户名不存在')
                $('#admin-name').next().text('用户名不存在');
            else if(data['message'] == '密码错误')
                $('#admin-pwd').next().text('密码错误');
            var fx = "wobble",  //wobble shake
            $modal = $('#modal-custom').closest('.iziModal');
                if( !$modal.hasClass(fx) ){
                    $modal.addClass(fx);
                    setTimeout(function(){
                        $modal.removeClass(fx);
                    }, 1500);
                }
            }
        });
    });

    // 管理员登录
    $("#admin-login").click(function(event){
        event.preventDefault();
        var $login_btn = $(this);
        // 正在登录的话不重复提交
        if ($login_btn.hasClass('btn-disabled')) {
            return;
        }

        $login_btn.addClass('btn-disabled').text('正在登录。。。');
        var post_data = new Object();
        post_data['admin_name'] = $("#admin-name").val();
        post_data['admin_pwd'] = $("#admin-pwd").val();
        console.log(post_data);
        $.post("<?=site_url('back/admin/do_login')?>", post_data, function(data){
        if (data['status'] == true) {
            window.location.href = "<?=site_url('back/index/home')?>";
        }else{
            $login_btn.removeClass('btn-disabled').text('登录');
            console.log('登录失败');
            if (data['message'] == '用户名不存在')
                $('#admin-name').next().text('用户名不存在');
            else if(data['message'] == '密码错误')
                $('#admin-pwd').next().text('密码错误');
            var fx = "wobble",  //wobble shake
            $modal = $('#modal-custom').closest('.iziModal');
                if( !$modal.hasClass(fx) ){
                    $modal.addClass(fx);
                    setTimeout(function(){
                        $modal.removeClass(fx);
                    }, 1500);
                }
            }
        });
    });
  }
  om_init.init_iziModal = function(){
  	$("#modal-custom").iziModal({
        overlayClose: false,
        width: 600,
        overlayColor: 'rgba(0, 0, 0, 0.6)',
        transitionIn: 'bounceInDown',
        transitionOut: 'bounceOutDown',
        navigateCaption: true,
        history: false,
        navigateArrows: 'closeScreenEdge',
        onOpened: function() {
            //console.log('onOpened');
        },
        onClosed: function() {
            //console.log('onClosed');  
        }
    });
    $("#modal-custom header a").on('click', function(event) {
        event.preventDefault();
        var $this = $(this);
        var index = $this.index();
        $this.addClass('active').siblings('a').removeClass('active');
        
        var $sections = $this.closest('div').find('.sections');
        var $currentSection = $this.closest("div").find("section").eq(index);
        //var $nextSection = $this.closest("div").find("section").eq(index).siblings('section');

        $sections.css('height', $currentSection.innerHeight());

        function changeHeight(){
            $this.closest("div").find("section").eq(index).fadeIn().siblings('section').fadeOut(100);
        }

        if( $currentSection.innerHeight() > $sections.innerHeight() ){
            changeHeight();
        } else {
            setTimeout(function() {
                changeHeight();
            }, 150);
        }

        if( $this.index() === 0 ){
            $("#modal-custom .iziModal-content .icon-close").css('background', '#ddd');
        } else {
            $("#modal-custom .iziModal-content .icon-close").attr('style', '');
        }
    });
    $('#trigger-custom-official').on('click', function (event) {
        event.preventDefault();
        $('#modal-custom').iziModal('open');
        $("#show-official-login").click();
    });
    $('#trigger-custom-user').on('click', function (event) {
        event.preventDefault();
        $('#modal-custom').iziModal('open');
        $("#show-user-login").click();
    });
  }



  var getMapPosition = function(e) { //状态栏
          // 显示地图屏幕坐标
          // var str = "[Screen]:" + e.xy.x + "," + e.xy.y;
          // 屏幕坐标向地图坐标的转换
          var xy = OM_OL_MAP.getLonLatFromViewPortPx(e.xy);
          $("#statusBar span").css("display","block");
          $("#coorX").text(xy.lon);
          $("#coorY").text(xy.lat);
      }
      
	return (window.om_init = om_init);
});
