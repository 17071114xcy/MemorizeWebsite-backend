
(function ($) {

    let NOT_SELECT_VOCAB = 1;
    let MEM_IN_SUCCESS = 2;
    let MEM_FINISH_VOCAB = 3;
    let __C = {
        '1' : '四级词库',
        '2' : '六级词库',
        '4' : '托福词库',
        '8' : 'GRE词库' 
    }
    var g_words = {};
    $("#stop-memorize").on("click", function(){
        /* 提示用户是否要停止背诵 */
        if(getCurrentMode() == "recite"){
            if(confirm("确定要停止背诵吗，您当前的背诵进度将被保留")){
                /* ajax 提交表单，获取本次需要背诵的词库 */
                seq = localStorage.getItem("seq");
                console.log(seq)
                $.ajax({
                    //几个参数需要注意
                    async:false,
                    type: "POST",//方法类型
                    dataType: "json",//预期服务器返回的数据类型
                    url: "/app/memorize_stop_handler/" ,//url
                    data: {"last_num" : seq - 1},
                    success: function(result){
                        if(result['result'] == true){
                            location.href="/app/"
                        }
                    },
                    error : function(e) {
                        alert("异常！");
                    }
                });
            }else{
                /* empty */
            }
        }else{
            location.href="/app/"
        }
        
       
    });

    $(document).ready(function(){
        /* ajax 提交表单，获取本次需要背诵的单词 */
        $.ajax({
            //几个参数需要注意
            async:false,
            type: "POST",//方法类型
            dataType: "json",//预期服务器返回的数据类型
            url: "/app/memorize_handler/" ,//url
            data: {},
            success: function(result){
 
                g_words = result["words"];
                var seq = result["last_num"];
                if(seq){
                    if(confirm("检测到您上次背诵单词的记录，是否需要继续背诵？点击是继续背诵，点击否重新背诵")){
                        localStorage.setItem("seq", seq);
                        console.log(seq);
                        console.log(typeof(seq))
                    }else{
                        localStorage.setItem("seq", 0);
                    }
                    
                }else{
                    localStorage.setItem("seq", 0);
                }
                console.log(g_words);
            },
            error : function(e) {
                alert("异常！");
            }
        });
        console.log(g_words)
        handle(g_words)
    })

    function handle(result){
        /* 前端逻辑处理 */
        var words = result;
        var recite_queue = words["recite"];
        var review_queue = words["review"];
        var recite_review_queue = [];
        localStorage.setItem("recite_review_queue", JSON.stringify(recite_review_queue));
        localStorage.setItem("recite_queue", JSON.stringify(recite_queue));
        localStorage.setItem("review_queue", JSON.stringify(review_queue));
        localStorage.setItem("words", JSON.stringify(words));
        if(words.review_num != 0){
            localStorage.setItem("mode", "review")
        }else{
            localStorage.setItem("mode", "recite")
        }
        vocab_type = words["vocab_type"];
        $(".current-vocab").html("<p>当前词库：<font color='blue'>" + vocab_type + "</font></p>")    
        var mode = getCurrentMode();
        seq = getCurrentSequence()
        console.log(seq)
        render_html(words, seq, mode);
        localStorage.setItem("seq", seq + 1);
    }

    function render_html(words, seq, mode){
        $(".correct-answer").hide();
        $("#not-familiar").hide();
        $("#not-determined").hide();
        $("#familiar").hide();
        console.log(mode);
        if(mode == "review"){
            review = getReviewQueue();
            review_num = words["review_num"];
            var word = review[seq];
            var word_pron = word["pron"];
            var word_spell = word["word"];
            $(".memory-progress").html("<p>进度：<font color='red'>" + (seq + 1) + "</font>/" + review_num + "</p>");
            $(".word").html(word_spell);
            $(".pron").html(word_pron);
            $(".prompt").html("点击屏幕任何空白位置，显示正确答案");
            $(".current-mode > p:first").html("<p>当前您正在：<font color='red'>复习</font></p>")
        }
        else if(mode == "recite"){
            recite = getReciteQueue();
            recite_num = words["recite_num"];
            var word = recite[seq];
            var word_pron = word["pron"];
            var word_spell = word["word"];
            $(".memory-progress").html("<p>进度：<font color='red'>" + (seq + 1) + "</font>/" + recite_num + "</p>");
            $(".word").html(word_spell);
            $(".pron").html(word_pron);
            $(".prompt").html("点击屏幕任何空白位置，显示正确答案");
            $(".current-mode > p:first").html("<p>当前您正在：<font color='red'>背诵</font></p>")
        }else{
            recite = getReciteReviewQueue();
            if(!recite.length) return;
            var word = recite.shift();
            var word_pron = word["pron"];
            var word_spell = word["word"];
            /* 复习刚背诵的单词时， 隐藏进度 */
            $(".memory-progress").hide();
            $(".word").html(word_spell);
            $(".pron").html(word_pron);
            $(".current-mode > p:first").html("<p>当前您正在：<font color='red'>复习背诵的新单词</font></p>")
            $(".prompt").html("还记得这个单词吗?")
            $("#not-familiar").html("不记得");
            $("#not-determined").html("模糊");
            $("#familiar").html("记得");
        }
        
    }

    $("#not-familiar, #not-determined, #familiar").on("click", function(){
        words = getWords();
        var mode = getCurrentMode();
        //console.log(mode);
        seq = getCurrentSequence();

        select_content = this.innerHTML;
        updateIndex(select_content, seq - 1, mode);
        /* 判断是否背诵结束 */
        if(judgeExit(words, seq + 1, mode))
            return true;

        render_html(words, seq, mode);
        localStorage.setItem('seq', seq + 1);
    })

    $(".right-button").on("click", function(){
        var mode = getCurrentMode();
        var seq = getCurrentSequence();
        var type = this.attr("class");
        setSequence(seq + 1);
        render_button_html(mode, seq, type);
    });

    function updateIndex(select_content, seq, mode){

        if(mode == 'review'){
            if(select_content == "认识" || select_content == "记得"){
                decIndex(2, seq);
            }else if(select_content == "模糊"){
                decIndex(1, seq)
            }else{
                /* 复习时不认识： 则不做任何操作 */
            }
        }else if(mode == "recite"){
            if(select_content == "认识" || select_content == "记得"){
                /* 背诵时认识， 不做任何操作 */
            }else if(select_content == "模糊"){
                incIndex(1, seq);
            }else{
                incIndex(2, seq);
            }
        }else{
            /* 复习所背诵的新单词，不更新指数，只将不认识/模糊，重新入队 */
            if(select_content == "认识" || select_content == "记得"){
                /* 复习新单词时认识， 不做任何操作 */
            }else{
                recite_review_queue = getReciteReviewQueue();
                appendAgain(recite_review_queue[0]);
                console.log("queue length:" + recite_review_queue);
            }
            popFromReviewQueue();
        }
    }

    function judgeExit(words, seq, mode){
        if(mode == "review"){
            var review_max_seq = words["review_num"];
            if(seq > review_max_seq){
                alert("本次复习已完成！");
                /* ajax提交表单 */
                
                /* 后续处理，开始背诵新单词 */
                render_html(words, 0, "recite");
                setMode("recite");
                setSequence(1);
                return true;
            }
        }else if(mode == "recite"){
            var recite_max_seq = words["recite_num"];
            if(seq > recite_max_seq){
                alert("本次背诵新单词已完成，请再次背诵不熟悉的单词");
                /* ajax提交表单 */

                review = JSON.stringify(getReviewQueue());
                recite = JSON.stringify(getReciteQueue());
                console.log(review);
                console.log(recite);
                /* 后续处理， 返回主页面 */
                recite_review = getReciteReviewQueue();
                if(!recite_review.length){
                    /* 背诵结束 */
                    reciteEnd();
                    return true;
                }
                console.log("now-" + JSON.stringify(getReciteReviewQueue()));
                render_html(words, 0, "recite_review");
                setMode("recite_review");
                return true;
            }
        }else{
            /* recite_review */
            recite_review = getReciteReviewQueue();
            if(!recite_review.length){
                /* 背诵结束 */
                console.log("END!!!!!!!!!!!")
                reciteEnd();
                return true;
            }
        }
    }

    function reciteEnd(){
        alert("背诵结束");
        /* ajax 提交陌生指数、背诵单词个数 */
        words = getWords()
        recite_queue = getReciteQueue()
        review_queue = getReviewQueue()
        words["recite"] = recite_queue;
        words["review"] = review_queue;
        words = JSON.stringify(words)
        console.log("??!")
        $.ajax({
            //几个参数需要注意
            async:false,
            type: "POST",//方法类型
            dataType: "json",//预期服务器返回的数据类型
            url: "/app/memorize_out_handler/",//url
            data: {"words" : words, "complete": true},
            success: function(result){
                console.log(result)
                if(result['memorize_out'] == MEM_FINISH_VOCAB){
                    var vocab_type = result['vocab_type'] + '';
                    alert("恭喜您！您已完成" + __C[vocab_type] + "的背诵！");
                }
                location.href = "/app/"
            },
            error : function(e) {
                alert("异常！");
            }
        });
        
    }

    function decIndex(num, seq=0){
        review = getReviewQueue();
        review[seq]["index"] -= num;
        setReviewQueue(review);
    }

    function incIndex(num, seq=-1){
        if(getCurrentMode() == "recite"){
            recite = getReciteQueue();
            recite[seq]["index"] += num;
            setReciteQueue(recite);
            appendToReviewQueue(recite, seq);
        }
    }

    function appendToReviewQueue(recite, seq){
        recite_review_queue = JSON.parse(localStorage.getItem("recite_review_queue"));
        recite_review_queue.push(recite[seq]);
        recite_review_queue = localStorage.setItem("recite_review_queue", JSON.stringify(recite_review_queue));
    }

    function appendAgain(word){
        recite_review_queue = JSON.parse(localStorage.getItem("recite_review_queue"));
        recite_review_queue.push(word);
        console.log(recite_review_queue);
        recite_review_queue = localStorage.setItem("recite_review_queue", JSON.stringify(recite_review_queue));
    }

    function popFromReviewQueue(){
        recite_review_queue = JSON.parse(localStorage.getItem("recite_review_queue"));
        recite_review_queue.shift();
        localStorage.setItem("recite_review_queue", JSON.stringify(recite_review_queue));
    }

    function getReciteReviewQueue(){
        return JSON.parse(localStorage.getItem("recite_review_queue"));
    }


    function getWords(){
        return JSON.parse(localStorage.getItem("words"));
    }

    function setReviewQueue(new_review_queue){
        localStorage.setItem("review_queue", JSON.stringify(new_review_queue));
    }

    function setReciteQueue(new_recite_queue){
        localStorage.setItem("recite_queue", JSON.stringify(new_recite_queue));
    }

    function getReviewQueue(){
        return JSON.parse(localStorage.getItem("review_queue"));
    }

    function getReciteQueue(){
        return JSON.parse(localStorage.getItem("recite_queue"));
    }

    function setWords(words){
        localStorage.setItem("words", JSON.stringify(words));
    }

    function getCurrentSequence(){
        return parseInt(localStorage.getItem("seq"));
    }

    function getCurrentMode(){
        return localStorage.getItem("mode");
    }

    function setSequence(new_seq){
        localStorage.setItem("seq", new_seq);
    }

    function setMode(new_mode){
        localStorage.setItem("mode", new_mode);
        return true;
    }

    function getCorrectWord(seq, mode){
        words = getWords();
        if(mode == "review"){
            review = words["review"];
            return review[seq]["correct"]; 
        }else if (mode == "recite"){
            recite = words["recite"];
            return recite[seq]["correct"];
        }
    }

    $("body").not(".selection").click( function() {
        seq = getCurrentSequence();
        mode = getCurrentMode();
        
        if(mode == "recite_review")
            correct = getReciteReviewQueue()[0]["correct"];
        else
            correct = getCorrectWord(seq - 1, mode);
        $(".correct-answer").html("<h3 class='correct-answer'><font color='green'>" + correct + "</font></h3>")
        $(".correct-answer").show();
        $("#not-familiar").show();
        $("#not-determined").show();
        $("#familiar").show();
        $(".prompt").html("请根据您对单词认识程度选择以下选项中的一个：")   
    });

    $('.selection').click(function(e){
        // 阻止按键事件冒泡
        if(e.stopPropagation){
        e.stopPropagation();
        }
    });


})(jQuery);
