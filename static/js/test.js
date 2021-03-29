(function ($) {
    var g_words = undefined;


    $(document).ready(function(){
        test_type = localStorage.getItem("test_type");
        console.log(test_type)
        if(test_type == "test_choice"){
            $.ajax({
                //几个参数需要注意
                async:false,
                type: "POST",//方法类型
                dataType: "json",//预期服务器返回的数据类型
                url: "/app/test/test_choice_handler/" ,//url
                data: {},
                success: function(result){
    
                    g_words = result["words"]
                    console.log(g_words)
                },
                error : function(e) {
                    alert("异常！");
                }
            });
            console.log(g_words)
            handle_choice(g_words)
        }else if(test_type == "test_spelling"){
            $.ajax({
                //几个参数需要注意
                async:false,
                type: "POST",//方法类型
                dataType: "json",//预期服务器返回的数据类型
                url: "/app/test/test_spelling_handler/" ,//url
                data: {},
                success: function(result){
                    g_words = result["words"]
                    console.log(g_words)
                },
                error : function(e) {
                    alert("异常！");
                }
            });
            console.log(g_words)
            handle_spelling(g_words)
        }


        
        $('#return-main').on("click", function(){
            location.href="/app"
        });
        /* ajax 提交表单 
        var words = {
            select_vocab: true,
            test_num: 3,
            test_word: [
                {
                    id: 20,
                    word: "grape",
                    pron: "[ɡreɪp]",
                    correct: "n.葡萄",
                    options: ["n.苹果", "n.猕猴桃", "n.香蕉", "n.葡萄"]
                },
                {
                    id: 18,
                    word: "apple",
                    pron: "[ˈæpl]",
                    correct: "n.苹果",
                    options: ["n.葡萄", "n.苹果", "n.猕猴桃", "n.香蕉"]
                },
                {
                    id: 19,
                    word: "banana",
                    pron: "[bəˈnɑːnə]",
                    correct: "n.香蕉",
                    options: ["n.香蕉", "n.葡萄", "n.猕猴桃", "n.苹果"]
                }
                
            ]
        }
        */
    });

    function handle_choice(result){
        var seq = 0;
        var fault_num = 0;
        var fault = {};
        words = result;
        if(!words.select_vocab){
            alert("您还没有选择词库，请选择词库后再进行测验");
            location.href = "setting.html";
        }
        localStorage.setItem("fault_num", fault_num);
        localStorage.setItem("fault", JSON.stringify(fault));
        localStorage.setItem("seq", seq);
        localStorage.setItem("words", JSON.stringify(words));
        render_html(words, seq);
    }

    function render_html(words, seq){
        test_word = words.test_word; 
        test_num = words["test_num"];
        var word = test_word[seq];
        var word_pron = word["pron"];
        var word_spell = word["word"];
        $(".memory-progress").html("<p>进度：<font color='red'>" + (seq + 1) + "</font>/" + test_num + "</p>");
        $(".word").html(word_spell);
        $(".pron").html(word_pron)
        $(".current-mode > p:first").html("<p>当前您正在：<font color='red'>单词测验</font></p>")
        
        var options = word["options"];
        for(var i = 1; i <= options.length; i++){
            $("#btn" + i).html(options[i - 1]);
        }
    }

    $("#btn1, #btn2, #btn3, #btn4").on("click", function(){
        var content = this.innerHTML;
        var seq = getCurrentSequence();
        var words = getWords();
        console.log(seq);
        var correct_word = words["test_word"][seq]["correct"];
        if(content != correct_word){
            var fault = JSON.parse(localStorage.getItem("fault"));
            var word = words["test_word"][seq]["word"];
            fault[word] = correct_word;
            localStorage.setItem("fault", JSON.stringify(fault)); 
            
            var fault_num = parseInt(localStorage.getItem("fault_num"));
            fault_num++;
            localStorage.setItem("fault_num", fault_num);
            console.log("yes!!!")
        }
        if(seq == words["test_num"] - 1){
            /*ajax submit form*/
            alert("单词测验结束。");
            $(".outer-test").hide();
            var fault_num = localStorage.getItem("fault_num");
            var fault = localStorage.getItem("fault");
            var acc = (words["test_num"] - fault_num) * 1.0 / words["test_num"];
            console.log((acc * 100).toFixed(2) + "%");
            console.log(fault)
            fault = JSON.parse(fault);
            $("body").append("<div>您本次测验的正确率为:<font color='red'> " + (acc * 100).toFixed(2) + "%<font/><div/>");
            $("body").append("您本次选错了以下单词:")
            for(var key in fault){
                $("body").append("<div>" + key + "  :  " + fault[key] + "<div/>");
            }
            $("#return-main").html("返回主页");
            var date = new Date().Format("yyyy-MM-dd hh:mm:ss")
            console.log(date)
            $.ajax({
                async: false,
                method: "post",
                url: "/app/test/test_out_handler/",
                dataType: "json",
                data:{
                    "type" : "choice",
                    "score" : (acc * 100).toFixed(2),
                    "time" : date.toLocaleString()
                },
                success: function(result){
                    
                },
                error : function(e) {
                    alert("异常！");
                }
            })
            return;
        }
        
        localStorage.setItem("seq", seq + 1);
        render_html(words, seq + 1)
        
    })

    
    function getCurrentSequence(){
        return parseInt(localStorage.getItem("seq"));
    }

    function getWords(){
        return JSON.parse(localStorage.getItem("words"));
    }

    Date.prototype.Format = function (fmt) { // author: meizz
        var o = {
            "M+": this.getMonth() + 1, // 月份
            "d+": this.getDate(), // 日
            "h+": this.getHours(), // 小时
            "m+": this.getMinutes(), // 分
            "s+": this.getSeconds(), // 秒
            "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
            "S": this.getMilliseconds() // 毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                return fmt;
    }

    var sp_seq = 0;
    var fault_spelling = {};
    function handle_spelling(result){
        var words = result;
        $(".selection").remove();
        $("#btn5").show();
        if(!words.select_vocab){
            alert("您还没有选择词库，请选择词库后再进行测验");
            location.href = "setting.html";
        }

        render_spelling_html()
    }
    
    $("#btn5").on("click", function(){
        test_word = g_words["test_word"]; 
        test_num = g_words["test_num"];
        console.log("test_num");
        var word = test_word[sp_seq];
        var user_input = $(".fill-answer").val();
        var pos_start = word["position"][0];
        var pos_end = word["position"][1];
        var word_spell = word["word"];
        var correct_spell = word_spell.slice(pos_start, pos_end + 1);
        
        console.log("correct_spell" + correct_spell)
        console.log("user-input" + user_input)
        if(correct_spell != user_input) {
            fault_spelling[word_spell] = word["correct"]
            fault_num++;
        }
        if(sp_seq == g_words["test_num"] - 1){
            /*ajax submit form*/
            alert("单词测验结束。");
            $(".outer-test").hide();
            var fault_num = Object.keys(fault_spelling).length;

            var acc = (g_words["test_num"] - fault_num) * 1.0 / g_words["test_num"];
            console.log((acc * 100).toFixed(2) + "%");
            console.log(fault_spelling);
            $("body").append("<div>您本次测验的正确率为:<font color='red'> " + (acc * 100).toFixed(2) + "%<font/><div/>");
            $("body").append("您本次拼写错了以下单词:")
            for(var key in fault_spelling){
                $("body").append("<div>" + key + "  :  " + fault_spelling[key] + "<div/>");
            }
            $("#return-main").html("返回主页");
            var date = new Date().Format("yyyy-MM-dd hh:mm:ss");
            console.log("date")
            $.ajax({
                async: false,
                method: "post",
                url: "/app/test/test_out_handler/",
                dataType: "json",
                data:{
                    "type" : "spelling",
                    "score" : (acc * 100).toFixed(2),
                    "time" : date.toLocaleString()
                },
                success: function(result){

                },
                error : function(e) {
                    alert("异常！");
                }
            })
            return;
        }
        sp_seq++;
        render_spelling_html()
    });

    function render_spelling_html(){
        test_word = g_words["test_word"]; 
        test_num = g_words["test_num"];
        var word = test_word[sp_seq];
        var word_pron = word["pron"];
        var word_spell = word["word"];
        var pos_start = word["position"][0];
        var pos_end = word["position"][1];
        console.log(word_spell)
        console.log("start: " + pos_start + "," + "end: " + pos_end)
        var correct_spell = word_spell.slice(pos_start, pos_end + 1);
        console.log(correct_spell);
        var word_pre = word_spell.slice(0, Math.max(0, pos_start));
        var word_post = word_spell.slice(Math.min(pos_end + 1, word_spell.length), word_spell.length)
        var cns_meanning = word["correct"]
        $(".fill-answer").val("");
        $(".fill-answer").focus();
        $(".word-pre").html(word_pre);
        $(".word-post").html(word_post);
        $(".cns-meaning").html(cns_meanning);
        $(".memory-progress").html("<p>进度：<font color='red'>" + (sp_seq + 1) + "</font>/" + test_num + "</p>");
        $(".word").html(word_spell);
        $(".pron").html(word_pron);
        $(".current-mode > p:first").html("<p>当前您正在：<font color='red'>单词测验(拼写题)</font></p>")

    }

    $('.fill-answer').bind('input propertychange', function() {
        console.log("h")
        console.log()
        $(".fill-answer").css("width", $(".fill-answer").val().length*12 + "px")
    });
})(jQuery);
