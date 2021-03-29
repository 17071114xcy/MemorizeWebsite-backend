(function ($) {
    let __C = {
        '0' : '无',
        '1' : '四级词库',
        '2' : '六级词库',
        '4' : '托福词库',
        '8' : 'GRE词库' 
    }
    let DELETE_SUCCESS = 4

    $(document).ready(function(){
        
        $.ajax({
            async: false,
            method: "post",
            url: "/admin/search_in_handler/",
            dataType: "json",
            data:{},
            success: function(result){
                result = result['user'];
                for(var i = 0; i < result.length; i++){
                    var user_name =  result[i]['user_name']
                    var user_pwd =   result[i]['user_pwd'] 
                    var sel_vocab =  result[i]['sel_vocab']
                    var com_num =    result[i]['com_num']  
                    var plan_num =   result[i]['plan_num'] 
                    var com_vocab =  result[i]['com_vocab']
                    
                   
                    $(".table11_7").append("<tr><td>" + user_name + "</td>" + "<td>" + user_pwd + "</td>" + "<td>" + __C[sel_vocab] + "</td>" + "<td>" + com_num + "</td>" + "<td>" + plan_num + "</td>" + "<td>" + __C[com_vocab] + "</td>" + "<td><input type='checkbox' id=" + user_name + " />" + "</td></tr>");
                }
            },
            error : function(e) {
                alert("异常！");
            }
        });
    });

    $("#search-submit").on("click", function(){
        var ckbx_list = $(":checkbox");
        var del_list = {}

        for(var i = 0; i < ckbx_list.length; i++)
            if(ckbx_list[i].checked)
                del_list["id" + i] = ckbx_list[i].id
        

        console.log(del_list)

        $.ajax({
            method: "post",
            url: "/admin/delete_handler/",
            dataType: "json",
            traditional: true,
            data:{
                "data" : JSON.stringify(del_list)
            },
            success: function(result){
               if(result['result'] == DELETE_SUCCESS){
                   location.href = '/admin/search/'
               }
                
            },
            error : function(e) {
                alert("异常！");
            }
        });

       
    })
})(jQuery);
