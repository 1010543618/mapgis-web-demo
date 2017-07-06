/**
 * jquery-change-bg
 */
;(function(factory) {        
  if (typeof define === "function" && define.amd) {            
      // AMD模式         
      define(["jquery", "store", "iziModal"], factory);
  } else {            
      // 全局模式           
      factory(jQuery, store);
  }
}(function ($, store) {
  var UserModule = {
    init : function(tigger_selector, login_url, regist_url, logout_url){
      this.login_url = login_url;
      this.regist_url = regist_url;
      this.logout_url = logout_url;
      // 初始化变量
      var autoOpen = typeof store.get('user') !== 'object' && window.location.href.split('#')[1] === 'user-modal';
      var iziModal_options = {
          overlayClose: false,
          width: 600,
          overlayColor: 'rgba(0, 0, 0, 0.6)',
          transitionIn: 'bounceInDown',
          transitionOut: 'bounceOutDown',
          navigateCaption: true,
          history: false,
          autoOpen: autoOpen,
          navigateArrows: 'closeScreenEdge',
          onOpened: function() {
          },
          onClosed: function() {
              //console.log('onClosed');
          }
      }
      $('body').append('<div id="user-modal">'+
          '<button data-iziModal-close class="icon-close">&times;</button>'+
          '<header>'+
              '<a id="show-login" class="active" href="">登录</a>'+
              '<a id="show-register" href="">注册</a>'+
          '</header>'+
          '<div class="sections">'+
            '<section style="">'+
                '<div class="my-form-group">'+
                  '<input id="user-login-name" type="text" placeholder="用户名">'+
                  '<span class="msg">'+'</span>'+
                '</div>'+
                '<div class="my-form-group">'+
                  '<input id="user-login-pwd" type="password" placeholder="密码">'+
                  '<span class="msg">'+'</span>'+
                '</div>'+
                '<footer>'+
                    '<button onclick="UserModule.login(this);">登录</button>'+
                    '<button data-iziModal-close>取消</button>'+            
                '</footer>'+
            '</section>'+
            '<section style="display: none;">'+
              '<div class="my-form-group">'+
                  '<input id="user-register-name" type="text" placeholder="用户名">'+
                  '<span class="msg">'+'</span>'+
                '</div>'+
                '<div class="my-form-group">'+
                  '<input id="user-register-pwd" type="password" placeholder="密码">'+
                  '<span class="msg">'+'</span>'+
                '</div>'+
                '<footer>'+
                    '<button onclick="UserModule.regist(this);">注册</button>'+
                    '<button data-iziModal-close>取消</button>'+            
                '</footer>'+
            '</section>'+
          '</div>'+
        '</div>');
      var $user_modal = this.$user_modal = $('#user-modal');
      // 初始化iziModal
      $user_modal.iziModal(iziModal_options);
      $user_modal.on('click', 'header a', function(event) {
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
              $user_modal.find(".iziModal-content .icon-close").css('background', '#ddd');
          } else {
              $user_modal.find(".iziModal-content .icon-close").attr('style', '');
          }
      });
      // 设置弹出条件
      if (tigger_selector) {
        $(tigger_selector).click(function (event) {
            event.preventDefault();
            $user_modal.iziModal('open');
        });
      }
    },
    open: function(type) {
      if (type === 'regist') {
        this.$user_modal.iziModal('open');
        $('#show-register').trigger('click');
        return;
      }
      this.$user_modal.iziModal('open');
    },
    login: function(btn_dom) {
      var $login_btn = $(btn_dom);
      // 正在登录的话不重复提交
      if ($login_btn.hasClass('btn-disabled')) {
        return;
      }
      $login_btn.addClass('btn-disabled').text('正在登录。。。');
      var post_data = new Object();
      post_data['user_name'] = $("#user-login-name").val();
      post_data['user_pwd'] = $("#user-login-pwd").val();
      $.post(this.login_url, post_data, function(data){
          $('#user-login-name').next().text('');
          $('#user-login-pwd').next().text('');
          $login_btn.removeClass('btn-disabled').text('登录');
          if (data['status'] == true) {
            store.set('user', data['user_info']);
            window.location.reload(true);
          }else{
            $login_btn.removeClass('btn-disabled').text('登录');
            if (data['msg'] == 'user name does not exist')
              $('#user-login-name').next().text('用户名不存在');
            else if(data['msg'] == 'password incorrect')
              $('#user-login-pwd').next().text('密码错误');
            var fx = "wobble",  //wobble shake
            $modal = $('#modal-custom').closest('.iziModal');
            if( !$modal.hasClass(fx) ){
                $modal.addClass(fx);
                setTimeout(function(){
                    $modal.removeClass(fx);
                }, 1500);
            }
          }
      }, 'json');
    },
    regist: function(btn_dom) {
      var $register_btn = $(btn_dom);
      // 正在登录的话不重复提交
      if ($register_btn.hasClass('btn-disabled')) {
        return;
      }
      $register_btn.addClass('btn-disabled').text('正在登录。。。');
      var post_data = new Object();
      post_data['user_name'] = $("#user-register-name").val();
      post_data['user_pwd'] = $("#user-register-pwd").val();
      $.post(this.regist_url, post_data, function(data){
          $('#user-register-name').next().text('');
          $('#user-register-pwd').next().text('');
          $register_btn.removeClass('btn-disabled').text('注册');
          if (data['status'] == true) {
            store.set('user', data['user_info']);
            window.location.reload();
          }else{
            $register_btn.removeClass('btn-disabled').text('注册');
            if (data['msg'] == 'user name already exists')
              $('#user-register-name').next().text('用户名已存在');
            var fx = "wobble",  //wobble shake
            $modal = $('#modal-custom').closest('.iziModal');
            if( !$modal.hasClass(fx) ){
                $modal.addClass(fx);
                setTimeout(function(){
                    $modal.removeClass(fx);
                }, 1500);
            }
          }
      }, 'json');
    },
    logout: function() {
      $.post(this.logout_url, null, function(data){
          if (data['status'] == true) {
            store.remove('user');
            window.location.reload();
          }
      }, 'json');
    }
  }

  window.UserModule = UserModule;
}));