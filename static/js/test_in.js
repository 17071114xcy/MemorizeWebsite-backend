(function ($) {
    let NOT_SELECT_VOCAB = 1;
    let MEM_IN_SUCCESS = 2;
    let USER_EXPIRE = 203;
    $("#test-choice").on("click", function(){
        $.ajax({
            //几个参数需要注意
            type: "POST",//方法类型
            dataType: "json",//预期服务器返回的数据类型
            url: "/app/in_handler/" ,//url
            data: {
            },
            success: function (result) {
                result = result['in']
                console.log(typeof(result))
                if(result == NOT_SELECT_VOCAB){
                    alert("您还没有选择词库，请选择你想要背诵的词库和计划")
                    location.href = '/setting/'
                }else if(result == MEM_IN_SUCCESS){
                    alert("开始测试")
                    localStorage.setItem("test_type", "test_choice")
                    location.href = '/app/test/test_choice/'
                }else if(result == USER_EXPIRE){
                    alert("用户登陆过期，请重新登陆");
                    location.href = '/login/'
                }
            },
            error : function(e) {
                alert("异常！");
            }
        });
    });

    $("#test-spelling").on("click", function(){
        $.ajax({
            //几个参数需要注意
            type: "POST",//方法类型
            dataType: "json",//预期服务器返回的数据类型
            url: "/app/in_handler/" ,//url
            data: {
            },
            success: function (result) {
                result = result['in']
                if(result == NOT_SELECT_VOCAB){
                    alert("您还没有选择词库，请选择你想要背诵的词库和计划")
                    location.href = '/setting/'
                }else if(result == MEM_IN_SUCCESS){
                    alert("开始测试")
                    localStorage.setItem("test_type", "test_spelling")
                    location.href = '/app/test/test_spelling/'
                }else if(result == USER_EXPIRE){
                    alert("用户登陆过期，请重新登陆");
                    location.href = '/login/'
                }
            },
            error : function(e) {
                alert("异常！");
            }
        });
    });
})(jQuery);
