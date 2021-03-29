(function ($) {
    let NOT_INPUT_USER = 1
    let MODIFY_SUCCESS = 2
    let NO_SUCH_USER = 3


    $("#modify-btn").on("click", function(){
        var modify_name = $("#modify-name").val()
        console.log(modify_name)
        if(modify_name == ''){
            alert("您尚未输入用户名");
            return;
        }
        var modified_pwd = $("#modified-pwd").val()
        var clear_review = $("#clear-review").prop("checked");
        var reset_user = $("#reset-user").prop("checked");
        console.log(clear_review)
        console.log(reset_user)
        $.ajax({
            async: false,
            method: "post",
            url: "/admin/modify_handler/",
            dataType: "json",
            data: {
                "modify_name": modify_name,
                "modified_pwd": modified_pwd,
                "clear_review": clear_review,
                "reset_user": reset_user
            },
            success: function(result){
                result = result['result']
                if(result == MODIFY_SUCCESS){
                    alert("修改成功")
                    location.href = "/admin_page/"
                }else if (result == NO_SUCH_USER){
                    alert("您所要修改的用户不存在")
                    return;
                }else{
                    alert("空用户名")
                }

            },
            error : function(e) {
                alert("异常！");
            }

        })
    })
})(jQuery);
