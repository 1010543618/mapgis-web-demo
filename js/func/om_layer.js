define([
  'jquery',
  'jquery.browser',
  'openlayers',
  'om-openlayers',
  'openlayers.magnifyingglass',
  'zdclient',
  'zdclient.zdcontrol',
  'om_tool'
  ], function(){//图层状态显示

  /**
   * show   --->  show
   * hide   --->  hide
   * query  --->  show,query
   * edit   --->  show,edit
   * table  --->  table
   */
  var om_layer = {};
  om_layer.layer_show = function(node){
      if('show' == node.attributes.status) return;
      do_layer_show(node);
  }
  //图层状态隐藏
  om_layer.layer_hide = function(node){
      if('hide' == node.attributes.status) return;
      do_layer_hide(node);
  }
  //图层状态查询
  om_layer.layer_query = function(node){
      if('query' == node.attributes.status) return;
      do_layer_show(node);
      var layer_index = node.id;
      window.MAP_LAYERS['query_layers'].push(layer_index);
      node.attributes.status = 'query';
      $(node.target).find('.fa').removeClass().addClass('fa fa-search om-layer-icon');
  }
  //图层状态修改
  om_layer.layer_edit = function(node){
      if('edit' == node.attributes.status) return;
      do_layer_show(node);
      var layer_index = node.id;
      window.MAP_LAYERS['edit_layers'].push(layer_index);
      node.attributes.status = 'edit';
      $(node.target).find('.fa').removeClass().addClass('fa fa-pencil om-layer-icon');
  }
  //图层状态查看属性表
  om_layer.layer_table = function(node){
      if('table' == node.attributes.status) return;
      var layer_index = node.id;
      node.attributes.status = 'table';
      $(node.target).find('.fa').removeClass().addClass('fa fa-table om-layer-icon');
  }

  om_layer.show_all_layer = function(this_tree, node){
    var children = $(this_tree).tree('getNode', node.target).children;
    var arr = [];
    for (var i = children.length - 1; i >= 0; i--) {
      var node = children[i];
      var layer_index = node.id;
      claer_query_edit(layer_index);
      window.MAP_LAYERS['hide_layers'].splice($.inArray(layer_index,window.MAP_LAYERS['hide_layers']),1);
      node.attributes.status = 'show';
      arr.push(i);
    }
    $(this_tree).find('.fa').removeClass().addClass('fa fa-eye om-layer-icon');
    window.OM_ZD_MAP_DOC.layers = "include: " + arr.join(',');
    om_tool.refresh();
  }

  /**
  *循环调用do_layer_hide无法隐藏图层
  *所以先循环再"exclude: " + MAP_LAYERS['hide_layers'].join(',');一起隐藏
  */
  om_layer.hide_all_layer = function(this_tree, node){
    var children = $(this_tree).tree('getNode', node.target).children;
    for (var i = children.length - 1; i >= 0; i--) {
      var node = children[i];
      var layer_index = node.id;
      claer_query_edit(layer_index);
      window.MAP_LAYERS['hide_layers'].push(layer_index);
      node.attributes.status = 'hide';
    }
    $(this_tree).find('.fa').removeClass().addClass('fa fa-eye-slash om-layer-icon');
    window.OM_ZD_MAP_DOC.layers = "exclude: " + MAP_LAYERS['hide_layers'].join(',');
    om_tool.refresh();
  }

  function do_layer_show(node){
    var layer_index = node.id;
    claer_query_edit(layer_index);
    window.MAP_LAYERS['hide_layers'].splice($.inArray(layer_index,window.MAP_LAYERS['hide_layers']),1);
    window.OM_ZD_MAP_DOC.layers = "include: " + layer_index;
    om_tool.refresh();
    node.attributes.status = 'show';
    $(node.target).find('.fa').removeClass().addClass('fa fa-eye om-layer-icon');
  }

  function do_layer_hide(node){
    var layer_index = node.id;
    claer_query_edit(layer_index);
    window.MAP_LAYERS['hide_layers'].push(layer_index);
    window.OM_ZD_MAP_DOC.layers = 'exclude: ' + layer_index;
    om_tool.refresh();
    node.attributes.status = 'hide';
    $(node.target).find('.fa').removeClass().addClass('fa fa-eye-slash om-layer-icon');
  }
  
  function claer_query_edit(layer_index){
    var ql_pos = $.inArray(layer_index,window.MAP_LAYERS['query_layers']);
    var el_pos = $.inArray(layer_index,window.MAP_LAYERS['edit_layers']);
    // 位置为=-1不删除
    window.MAP_LAYERS['query_layers'].splice(ql_pos, ql_pos == -1 ? 0 : 1);
    window.MAP_LAYERS['edit_layers'].splice(el_pos, el_pos == -1 ? 0 : 1);
  }
  return (window.om_layer = om_layer);
});