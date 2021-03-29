(function ($) {
    let __C = {
        '1' : '四级词库',
        '2' : '六级词库',
        '4' : '托福词库',
        '8' : 'GRE词库' 
    }
    $(document).ready(function(){
        $.ajax({
                type: "POST",//方法类型
                dataType: "json",//预期服务器返回的数据类型
                url: "/fetch_profile/" ,//url
                data: {},
                success: function (res) {
                    var res = res['result']
                    var user_name = res['user_name'];
                    var vocab = res['vocab'];
                    var plan_num = res['plan_num'];             
                    var total_num = res['total_num'];
                    $("#user-name").html('用户名：' + user_name);
                    $("#plan-vocab").html('当前所选词库：' + __C[vocab]);
                    $("#total-memorize-num").html('当前词库背诵个数：' + plan_num);
                    $("#plan-num").html('当前每日计划数量：' + total_num);
                },
                error : function(e) {
                    alert("异常！");
                }
        });
    });

})(jQuery);