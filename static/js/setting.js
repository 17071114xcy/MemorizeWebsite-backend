
(function ($) {
    let OLD_PWD_ERROR = 1;
    let SET_SUCCESS = 2;
    let NEW_USER_PLAN = 20
    let NEW_USER_VOACB = 1
    let NEW_USER = 10
    let OLD_USER = 11
    var __map_voc = {
        '1': 'cet-4',
        '2': 'cet-6',
        '4': 'toefl',
        '8': 'gre'
    }
    $(document).ready(function(){
        console.log("in setting")
        if($.cookie('username') && $.cookie('password')){
            console.log($.cookie('username'))
            console.log($.cookie('password'))
        }else{
            alert("您还没有登陆")
            location.href = '/login'
        }
        for(var plan_num = 5; plan_num <= 100; plan_num += 5){
            $("#plan").append("<option id=plan"+ plan_num + " value=" + plan_num + "'>" + plan_num + "</option>")
        }
        $.ajax({
            //几个参数需要注意
                type: "POST",//方法类型
                dataType: "json",//预期服务器返回的数据类型
                url: "/setting/fetch_set/" ,//url
                data: {},
                success: function (res) {
                    var vocab = res['vocab'];
                    var plan_num = res['plan_num'];             
                    var result = res['result'];
                    if(result == NEW_USER){
                        $("#plan" + plan_num).attr("selected", true) 
                        $("#cet-4").attr("selected", true) ;
                    }else{
                        $("#plan" + plan_num).attr("selected", true) 
                        var selected_voc = __map_voc[vocab + '']
                        $('#' + selected_voc).attr("selected", true) 
                    }
                },
                error : function(e) {
                    alert("异常！");
                }
            });
    });




    $("#logout-item").on("click", function(){
        console.log("logout")
        $.removeCookie("username",{ path: '/'})
        $.removeCookie("password",{ path: '/'})
    })

    $("#change-info").on("click", function(){
        var old_pwd = $("#old-pwd").val()
        var new_pwd = $("#new-pwd").val()
        var dup_new_pwd =$("#dup-new-pwd").val()
        console.log(old_pwd)
        console.log(new_pwd)
        if(old_pwd && new_pwd && dup_new_pwd){
            if(new_pwd != dup_new_pwd){
                alert("两次密码输入不同!")
                $("#new-pwd").val("")
                $("#dup-new-pwd").val("")
                $("#new-pwd").focus()
                return;
            }
        }
        
        
        $.ajax({
        //几个参数需要注意
            type: "POST",//方法类型
            dataType: "json",//预期服务器返回的数据类型
            url: "/setting/saveset/" ,//url
            data: {"vocab_type" : $("#vocab").val(),
                "plan_num" : parseInt($("#plan").val()),
                "old_pwd" : old_pwd,
                "new_pwd" : new_pwd 
            },
            success: function (result) {
                result = result['setting']
                console.log(typeof(result))
                if(result == OLD_PWD_ERROR){
                    alert("旧密码错误，请重新输入")
                    $("#new-pwd").val("")
                    $("#dup-new-pwd").val("")
                    $("#old-pwd").val("")
                    $("#old-pwd").focus()
                }else if(result == SET_SUCCESS){
                    alert("设置成功!")
                    location.href = '/app'
                }
            },
            error : function(e) {
                alert("异常！");
            }
        });
    });

})(jQuery);