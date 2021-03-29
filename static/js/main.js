
(function ($) {

    let USER_EXIST = 1
    let REG_SUCCESS = 2

    let USER_NOTEXIST = 1
    let PWD_INCORRECT = 2
    let LOGIN_SUCCESS = 3
    let ADMIN_LOGIN_SUCCESS = 4

    $("#login-btn").on("click", function(){
        console.log("submit")
        console.log($("#login-username").val())
        var input = $('.validate-input .input100');
        var check = true;
        for(var i=0; i<input.length; i++) {
            //console.log($(input[i]).val())
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check = false;
            }
        }
        if(check == false){
            return;
        }
       $.ajax({
        //几个参数需要注意
            type: "POST",//方法类型
            dataType: "json",//预期服务器返回的数据类型
            url: "/login/login_handler/" ,//url
            data: {"username" : $("#login-username").val(),
                "password" : $("#login-userpwd").val(),
            },
            success: function (result) {
                result = result['login']
                console.log(typeof(result))
                if(result == LOGIN_SUCCESS){
                    localStorage.setItem("times", 0);
                    console.log("right")
                    location.href = '/app/'
                }else if(result == ADMIN_LOGIN_SUCCESS){
                    location.href = '/admin_page/'
                }else if(result == PWD_INCORRECT){
                    alert("密码错误")
                    console.log("password error")
                }else if(result == USER_NOTEXIST){
                    alert("用户名不存在")
                    console.log("user not exist")
                }
            },
            error : function(e) {
                alert("异常！");
            }
        });
    });
    
    $("#register-btn").on("click", function(){
        console.log("submit")
        console.log($("#reg-username").val())
        console.log($("#reg-pwd").val())
        var input = $('.validate-input .input100');
        var check = true
        for(var i=0; i<input.length; i++) {
            //console.log($(input[i]).val())
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check = false;
            }
        }
        if(!check) return;
        var username = $(input[0]).val();
        var pwd = $(input[1]).val();
        var confirm_pwd = $(input[2]).val();
        console.log(pwd)
        console.log(confirm_pwd)
        if(username == pwd){
            alert("用户名不能与密码一致")
            return;
        }
        if(pwd != confirm_pwd){
            alert("两次输入密码不一致，请重新输入")
            return;
        }
    
       $.ajax({
        //几个参数需要注意
            type: "POST",//方法类型
            dataType: "json",//预期服务器返回的数据类型
            url: "/register/save/" ,//url
            data: {"username" : username,
                   "password" : pwd,
            },
            success: function (result) {
                result = result['register']
                console.log(typeof(result))
                if(result == REG_SUCCESS){
                    console.log("right")
                    location.href = '/login/'
                }else if(result == USER_EXIST){
                    alert("用户名已存在，请更换后重新注册")
                    console.log("user not exist")
                }
            },
            error : function(e) {
                alert("异常！");
            }
        });
    });

    function validate (input) {
        if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if($(input).val().trim() == ''){
                return false;
            }
        }
    }
    
    function showValidate(input) {
        console.log("show")
        var thisAlert = $(input).parent();
    
        $(thisAlert).addClass('alert-validate');
    }
    
    function hideValidate(input) {
        console.log("hide")
        var thisAlert = $(input).parent();
        $(thisAlert).removeClass('alert-validate');
    }
    
    // 根据cookie连接情况，显示动态页面
    $(document).ready(function(){
        
        if($.cookie('username') && $.cookie('password')){
            console.log($.cookie('username'))
            console.log($.cookie('password'))
            $("#register-item").hide();
            $("#login-item").hide();
            $("#nav-bar").append("<li class='menuItem' id='setting-item'><a href='/setting'>Setting</a></li>")
            $("#nav-bar").append("<li class='menuItem' id='profile-item'><a href='/profile'> profile </a></li>")
            $("#nav-bar").append("<li class='menuItem' id='logout-item'><a href='/app'> logout </a></li>")
            
        }else{
            $("#register-item").show();
            $("#login-item").show();
            $("#setting-item").remove();
            $("logout-item").remove();
        }
    });
    
    $("#nav-bar").on("click", "#logout-item", function(){
        console.log("logout")
        $.removeCookie("username",{ path: '/'})
        $.removeCookie("password",{ path: '/'})
    })

    $('.input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });
    
    $("#memory").on("click", function(){
        if($.cookie('username') && $.cookie('password')){
            location.href = 'memorize_in/'
        }else{
            alert("您还没有登陆")
            location.href = '/login'
        }
        
    });
    
    $("#test").on("click", function(){
        if($.cookie('username') && $.cookie('password')){
            location.href = 'test_in/'
        }else{
            alert("您还没有登陆")
            location.href = '/login'
        }
    });
    
    $("#trans").on("click", function(){
        location.href = '/app/translation/'
    });
    
    $("#query").on("click", function(){
        location.href = '/app/query/'
    });

})(jQuery);

