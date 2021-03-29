(function ($) {
    /* ajax请求 错误代码 */
    let KEYWORD_EMPTY = 260;
    let QUERY_SUCCESS = 200;
    let NO_SUCH_WORD = 250;
    let SERVER_INTERNAL_ERROR = 100;
    let API_IN_MAINTAIN = 110;
    let FREQ_EXCEED = 130;
    let TIMES_EXCEED = 150;
    
    /* 未登录用户限制 */
    let NO_LOGIN_LIMIT = 2; //未登录用户最多使用次数
    localStorage.setItem("times", 0);
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

    $("#submit-query").on("click", function(){
        if( !($.cookie('username') && $.cookie('password'))){
            use_times = parseInt(localStorage.getItem("times"));
            if(use_times >= NO_LOGIN_LIMIT){
                alert("未登录用户使用次数超过限制，请登陆后继续使用");
                location.href = '/login/'
            }
        }
        localStorage.setItem("times", parseInt(localStorage.getItem("times")) + 1);
        console.log(localStorage.getItem("times"))
        var query_content = $(".query-input").val();
        $.ajax({
            method: "POST",
            url: "http://api.tianapi.com/txapi/enwords/index",
            dataType: "json",
            data: {
                key: "3dd3c86d801afb8ff9bf5661e7a8ab5c",
                word: query_content,
            },
            success: function(result){
                console.log(result)
                var code = result["code"];
                switch(code){
                    case QUERY_SUCCESS:
                        query_result = result['newslist'][0]["content"];
                        $("#query-result").html("<h3>查询结果：" + query_result + "</h3>");
                        break;
                    case KEYWORD_EMPTY:
                        alert("关键词不能为空");
                        break;
                    case NO_SUCH_WORD:
                        alert("请输入正确的英文单词");
                        break;
                    case SERVER_INTERNAL_ERROR:
                        alert("服务器内部错误，请等待修复");
                        break;
                    case API_IN_MAINTAIN:
                        alert("服务器正在维护中，请等待");
                        break;
                    case FREQ_EXCEED:
                        alert("请求频率超过限制，请等待一分钟后再次请求");
                        break;
                    case TIMES_EXCEED:
                        alert("请求次数超过限制，请增加次数");

                }
            },
            error: function(e){
                alert("异常")
            }
        });
    });

})(jQuery);