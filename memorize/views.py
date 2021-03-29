from django.http import response
from django.shortcuts import render, redirect
from django.shortcuts import HttpResponse
from .voc import User, All_voc, Review, Test, connectDB
from sqlalchemy.sql import operators
from django.views.decorators.csrf import csrf_exempt
import json
from sqlalchemy.orm import join
import memorize.cfg as cfg
import random

def row2dict(row):
    d = {}
    for column in row.__table__.columns:
        d[column.name] = str(getattr(row, column.name))
    return d

def admin_search(request):
    return render(request, 'search.html')

def admin_modify(request):
    return render(request, 'modify.html')
def admin(request):
    return render(request, 'admin.html')
# 登录页面
def login(request):
    # 指定要访问的页面，render的功能：讲请求的页面结果提交给客户端
    return render(request, 'login.html')

# 注册页面
def register(request):
    return render(request, 'register.html')

# 设置页面
def setting(request):
    return render(request, 'setting.html')

def toMainPage(request):
    return render(request, "app.html")

# 个人主页
def profile(request):
    return render(request, 'profile.html')

# 背诵页面
def memorize_in(request):
    # 指定要访问的页面，render的功能：讲请求的页面结果提交给客户端
    return render(request, 'memorize_in.html')

def memorize(request):
    print("hello")
    # 指定要访问的页面，render的功能：讲请求的页面结果提交给客户端
    return render(request, 'memorize.html')

#测验页面
def test_in(request):
    # 指定要访问的页面，render的功能：讲请求的页面结果提交给客户端
    return render(request, 'test_in.html')

def test_choice(request):
    # 指定要访问的页面，render的功能：讲请求的页面结果提交给客户端
    return render(request, 'test.html')

def test_spelling(request):
    return render(request, 'test_spelling.html')

# 单词查询页面
def query(request):
    return render(request, 'query.html')

#中英互译
def translation(request):
    # 指定要访问的页面，render的功能：讲请求的页面结果提交给客户端
    return render(request, 'translation.html')

# 保存用户设置的数据
@csrf_exempt
def save_set(request):
    a = request.POST  # 获取post()请求
    # print(a)
    # 通过get()请求获取前段提交的数据
    oldpwd = a.get('old_pwd')
    newpwd = a.get('new_pwd')
    plan_num = a.get('plan_num')
    vocab_type = a.get('vocab_type')
    vocab_type = cfg.__C[vocab_type]
    print("vocab_type number: {}".format(vocab_type))
    print("plan_num: {}".format(plan_num))

    dburl = 'mysql+mysqlconnector://root:140810@localhost:3306/voc'
    DBSession = connectDB(dburl)
    session = DBSession()
    if hasattr(request, 'session'):
        userName = request.session.get('user_id')
    else:
        userName = "test_user"
    print("setting User: {}".format(userName))
    user = session.query(User).filter(User.user_id == userName).one()
    print("setting query : {}".format(user))
    user.sel_thesaurus = vocab_type
    user.plan_vocnum = plan_num

    if newpwd:
        if user.user_pwd != oldpwd:
            return HttpResponse(json.dumps({"setting": cfg.OLD_PWD_ERROR}))
        else:
            user.user_pwd = newpwd
    
    session.commit()
    session.close()
    return HttpResponse(json.dumps({"setting": cfg.SET_SUCCESS}))

# 读取用户当前的设置
@csrf_exempt
def fetch_set(request):
    dburl = 'mysql+mysqlconnector://root:140810@localhost:3306/voc'
    DBSession = connectDB(dburl)
    if hasattr(request, 'session'):
        userName = request.session.get('user_id')
    else:
        userName = "test_user"
    session = DBSession()
    user = session.query(User).filter(User.user_id == userName).one()
    if user.plan_vocnum == 0 or not user.sel_thesaurus:
        return HttpResponse(json.dumps({"result": cfg.NEW_USER, "plan_num": cfg.NEW_USER_PLAN, "vocab": cfg.NEW_USER_VOACB}))
    return HttpResponse(json.dumps({"result": cfg.OLD_USER, "plan_num": user.plan_vocnum, "vocab": user.sel_thesaurus}))

# 读取用户当前的信息
@csrf_exempt
def fetch_profile(request):
    dburl = 'mysql+mysqlconnector://root:140810@localhost:3306/voc'
    DBSession = connectDB(dburl)
    if hasattr(request, 'session'):
        userName = request.session.get('user_id')
    else:
        userName = "test_user"
    session = DBSession()
    user = session.query(User).filter(User.user_id == userName).one()
    result = {}
    result['user_name'] = userName
    result['vocab'] = user.sel_thesaurus
    result['plan_num'] = user.plan_vocnum
    result['total_num'] = user.com_vocnum
    return HttpResponse(json.dumps({"result": result}))

# 保存注册的数据
@csrf_exempt
def save(request):
    a = request.POST  # 获取post请求
    # print(a)
    # 通过get()请求获取前段提交的数据
    userName = a.get('username')
    passWord = a.get('password')
    print(userName)
    print(passWord)
    dburl = 'mysql+mysqlconnector://root:140810@localhost:3306/voc'
    DBSession = connectDB(dburl)
    session = DBSession()

    users = session.query(User).filter(User.user_id == userName).all()

    for item in users:
        if item:
            # 表示该账号已经存在
            session.close()
            return HttpResponse(json.dumps({"register": cfg.USER_EXIST}))
            
    new_user = User(user_id=userName, user_pwd=passWord, sel_thesaurus=0)
    # 添加到session:
    session.add(new_user)
    # 提交即保存到数据库:
    session.commit()
    # 关闭session:
    session.close()
    return HttpResponse(json.dumps({"register": cfg.REG_SUCCESS}))

# 登陆验证
@csrf_exempt
def login_handler(request):
    print("success")
    a = request.POST
    userName = a.get('username')
    passWord = a.get('password')
    if hasattr(request, 'session'):
        request.session['user_id'] = userName
    # 创建session对象:
    dburl = 'mysql+mysqlconnector://root:140810@localhost:3306/voc'
    DBSession = connectDB(dburl)
    session = DBSession()
    print(userName)
    print(passWord)
    try:
        user = session.query(User).filter(User.user_id == userName).one()
    except Exception:
        print("error")
        return HttpResponse(json.dumps({"login": cfg.USER_NOTEXIST}))
    finally:
        session.close()
    print(user.user_pwd)

    if user.user_pwd == passWord:
        # 设置cookie和session
        if user.permission == 1:
            res = HttpResponse(json.dumps({"login": cfg.LOGIN_ADMIN_SUCCESS}))
        else:
            res = HttpResponse(json.dumps({"login": cfg.LOGIN_SUCCESS}))

        res.set_cookie("username", userName, expires=cfg.COOKIE_EXPIRE)
        res.set_cookie("password", passWord, expires=cfg.COOKIE_EXPIRE)
        return res
    else:
        return HttpResponse(json.dumps({"login": cfg.PWD_INCORRECT}))
    session.close()

# 返回用户是否选择了词库
@csrf_exempt
def in_handler(request):
    dburl = 'mysql+mysqlconnector://root:140810@localhost:3306/voc'
    DBSession = connectDB(dburl)
    session = DBSession()
    if hasattr(request, 'session'):
        userName = request.session.get('user_id')
    else:
        userName = "test_user"
    user = session.query(User).filter(User.user_id == userName).one()
    if not user:
        return HttpResponse(json.dumps({"in" : cfg.USER_EXPIRE}))
    if(not user.sel_thesaurus):
        return HttpResponse(json.dumps({"in" : cfg.NOT_SELECT_VOCAB}))
    else:
        return HttpResponse(json.dumps({"in" : cfg.MEM_IN_SUCCESS}))

# 背诵单词结束，结算陌生指数
@csrf_exempt
def memorize_out_handler(request):
    dburl = 'mysql+mysqlconnector://root:140810@localhost:3306/voc'
    DBSession = connectDB(dburl)
    session = DBSession()
    if hasattr(request, 'session'):
        userName = request.session.get('user_id')
    else:
        userName = "test_user"
    user = session.query(User).filter(User.user_id == userName).one()
    print("userName:" + userName)
    a = request.POST
    words = json.loads(a.get("words"))
    sel_vocab = user.sel_thesaurus
    print(words)
    #复习的旧单词处理
    review_word = words["review"]
    #拿出所有指数大于3的单词，由于复习库没有变，因此这里的vocab与memorize_handler中的vocab一致
    #因此可以直接更新
    vocab = session.query(Review).filter(Review.index >= 3).all()
    new_review_word = []
    for i in range(len(vocab)):
        # 如果指数小于等于1， 则从复习单词表中删除
        if(vocab[i].index <= 1):
            session.query(Review).filter(vocab[i].voc_id == review_word[i]["id"]).delete()
            session.commit()
        else:
            session.query(Review).filter(vocab[i].voc_id == review_word[i]["id"]).update({"index": review_word[i]["index"]})
            session.commit()

    #背诵的新单词处理，
    vocab = session.query(All_voc).filter(operators.op(All_voc.thesaurus, '&', user.sel_thesaurus)).all()
    curr_num = user.com_vocnum
    
    recite_word = words["recite"]
    recite_num = words["recite_num"]
    user.com_vocnum += recite_num
    print("recite words: {}".format(recite_word))
    print("curr_num:" + str(curr_num))
    # 将背诵错误的单词加入复习单词表，指数再多增加1
    new_review_word = []
    for i in range(curr_num, curr_num + recite_num):
        # 如果这个单词背诵错误
        print(recite_word[i - curr_num])
        if(recite_word[i - curr_num]["index"] > 0):
            new_review_word.append(Review(voc_id=vocab[i].voc_id, user_id=user.user_id, index=recite_word[i - curr_num]["index"] + 1))
    print("new_review_word" + str(new_review_word))
    # 将复习单词表中其他单词指数+1
    review_vocab = session.query(Review).all()
    for i in range(len(review_vocab)):
        review_vocab[i].index += 1
    # 如果背诵完成，将上次背诵的数量清零
    complete = a.get("complete")
    if complete:
        user.last_vocnum = 0
    
    # 如果单词背诵完成， 更新完成的词库以及将当前所选词库清零
    voc_total_num = len(vocab)
    if voc_total_num == user.com_vocnum:
        user.com_thesaurus = user.com_thesaurus | user.sel_thesaurus
        user.sel_thesaurus = 0

    session.add_all(new_review_word)
    session.add_all(review_vocab)
    session.commit()
    if voc_total_num == user.com_vocnum:
        user.com_vocnum = 0
        session.commit()
        return HttpResponse(json.dumps({"memorize_out": cfg.MEM_FINISH_VOCAB, "vocab_type": user.sel_thesaurus}))
    return HttpResponse(json.dumps({"memorize_out" : cfg.MEM_OUT_SUCCESS}))

# 进入背诵单词， 返回本次背诵的单词
@csrf_exempt
def memorize_handler(request):
    vocab_type = {1: '四级词汇', 2: '六级词汇', 4: '托福词汇', 8: 'GRE词汇'}
    a = request.POST
    dburl = 'mysql+mysqlconnector://root:140810@localhost:3306/voc'
    DBSession = connectDB(dburl)
    session = DBSession()
    if hasattr(request, 'session'):
        userName = request.session.get('user_id')
    else:
        userName = "test_user"
    user = session.query(User).filter(User.user_id == userName).one()
    recite_dict= []  # 背诵列表
    review_dict = []  # 复习列表
    review_num = 0
    # 处理要背诵的单词
    recitevoc = session.query(All_voc).filter(operators.op(All_voc.thesaurus, '&', user.sel_thesaurus)).all()
    # print("recite: {}".format(recitevoc[0].__class__))
    left_num = len(recitevoc) - user.com_vocnum
    for i in range(min(left_num, user.plan_vocnum)):
        voc_dict0 = row2dict(recitevoc[user.com_vocnum + i])
        print(voc_dict0)
        voc_dict = {}
        voc_dict['id'] = voc_dict0['voc_id']
        voc_dict['word'] = voc_dict0['spelling']
        voc_dict['pron'] = voc_dict0['pronunciation']
        voc_dict['word'] = voc_dict0['spelling']
        voc_dict['correct'] = voc_dict0['translation']
        voc_dict['index'] = 0
        #voc_dict = row2dict(recitevoc[user.com_vocnum + i])
        #voc_dict['index'] = 0
        recite_dict.append(voc_dict)  ## 使用 append() 添加元素

    # 处理要复习的单词
    reviewvoc = session.query(All_voc.voc_id, All_voc.spelling, All_voc.pronunciation, All_voc.translation, \
                              Review.index).filter(All_voc.voc_id == Review.voc_id, Review.user_id == userName).all()
    # print("review : {}".format(reviewvoc[0].__class__))
    for item in reviewvoc:
        if item.index >= 2.9:
            item_dict = {}
            item_dict["id"] = item[0]
            item_dict["word"] = item[1]
            item_dict["pron"] = item[2]
            item_dict["correct"] = item[3]
            item_dict["index"] = item[4]
            review_dict.append(item_dict)  ## 使用 append() 添加元素
            review_num += 1
    session.close()
    # print(review_list)
    words = {}
    words['vocab_type'] = vocab_type[user.sel_thesaurus]  # 词库种类
    
    words['review_num'] = review_num  # 复习单词个数
    complete = False
    if(left_num <= user.plan_vocnum):
        complete = True
    recite_num = min(left_num, user.plan_vocnum)
    words['recite_num'] = recite_num  # 背诵单词个数
    words['review'] = review_dict   # 复习单词
    words['recite'] = recite_dict  #背诵单词
    last_num = user.last_vocnum #上次背诵数量
    print(words)
    complete = False
    if(left_num <= user.plan_vocnum):
        complete = True
    return HttpResponse(json.dumps({"words": words, "last_num": last_num, "complete": complete}))

@csrf_exempt
# 中途停止背诵，保存进度
def memorize_stop_handler(request):
    a = request.POST
    dburl = 'mysql+mysqlconnector://root:140810@localhost:3306/voc'
    DBSession = connectDB(dburl)
    session = DBSession()
    if hasattr(request, 'session'):
        userName = request.session.get('user_id')
    else:
        userName = "test_user"
    user = session.query(User).filter(User.user_id == userName).one()
    last_num = a.get('last_num')
    user.last_vocnum = last_num
    session.commit()
    return HttpResponse(json.dumps({"result": True}))

# 单选题测验
@csrf_exempt
def test_choice_handler(request):
    dburl = 'mysql+mysqlconnector://root:140810@localhost:3306/voc'
    DBSession = connectDB(dburl)
    session = DBSession()
    if hasattr(request, 'session'):
        userName = request.session.get('user_id')
    else:
        userName = "test_user"
    #userName = 'littlej'
    test_voc = {}
    user = session.query(User).filter(User.user_id == userName).one()
    all_voc = session.query(All_voc).filter(operators.op(All_voc.thesaurus, '&', user.sel_thesaurus)).all()
    cnt = len(all_voc)
    index = random.sample(range(0, cnt), cfg.TEST_CHOICE) # 生成20个测验单词id
    test_word = []
    for i in range(cfg.TEST_CHOICE):
        item_dict = {}
        item_dict["id"] = all_voc[index[i]].voc_id
        item_dict["word"] = all_voc[index[i]].spelling
        item_dict["pron"] = all_voc[index[i]].pronunciation
        item_dict["correct"] = all_voc[index[i]].translation
        options = [] # 四个选项
        wrong = random.sample(range(0, cnt), 3)
        for j in range(3):
            options.append(all_voc[wrong[j]].translation)
        options.append(all_voc[index[i]].translation)
        random.shuffle(options) # 随机打乱选项
        item_dict["options"] = options
        test_word.append(item_dict)
    if not user.sel_thesaurus:
        test_voc['select_vocab'] = False
    else:
        test_voc['select_vocab'] = True
    test_voc['test_num'] = cfg.TEST_CHOICE
    test_voc['test_word'] = test_word
    print(test_voc)
    session.close()
    return HttpResponse(json.dumps({"words": test_voc}))

# 拼写题目测验
@csrf_exempt
def test_spelling_handler(request):
    dburl = 'mysql+mysqlconnector://root:140810@localhost:3306/voc'
    DBSession = connectDB(dburl)
    session = DBSession()
    if hasattr(request, 'session'):
        userName = request.session.get('user_id')
    else:
        userName = "test_user"
    #userName = 'littlej'
    test_voc = {} # 测试的单词
    test_word = []
    user = session.query(User).filter(User.user_id == userName).one()
    all_voc = session.query(All_voc).filter(operators.op(All_voc.thesaurus, '&', user.sel_thesaurus)).all()
    cnt = len(all_voc)
    index = random.sample(range(0, cnt), cfg.TEST_SPELLING)  # 生成20个测验单词id
    for i in range(cfg.TEST_SPELLING):
        item_dict = {}
        item_dict["id"] = all_voc[index[i]].voc_id
        item_dict["word"] = all_voc[index[i]].spelling
        item_dict["pron"] = all_voc[index[i]].pronunciation
        item_dict["correct"] = all_voc[index[i]].translation
        length = len(all_voc[index[i]].spelling)
        position = random.randint(0,length//2+1)  #appleapple 10 6   0，1，2，3，4，5
        position_list = []
        position_list.append(position)
        position_list.append(position+length//2-1)
        item_dict["position"] = position_list
        test_word.append(item_dict)
    if not user.sel_thesaurus:
       test_voc['select_vocab'] = False
    else:
        test_voc['select_vocab'] = True
    test_voc['test_num'] = cfg.TEST_SPELLING
    test_voc['test_word'] = test_word
    print(test_voc)
    session.close()
    return HttpResponse(json.dumps({"words":test_voc}))

# 测验结束，结算测验分数，测验时间
@csrf_exempt
def test_out_handler(request):
    a = request.POST
    dburl = 'mysql+mysqlconnector://root:140810@localhost:3306/voc'
    DBSession = connectDB(dburl)
    session = DBSession()
    time = a.get("time")
    score = a.get("score")
    test_type = a.get("type")
    if hasattr(request, 'session'):
        userName = request.session.get('user_id')
    else:
        userName = "test_user"
    test = Test(user_id=userName, test_time=time, score=score, type=test_type)
    session.add(test)
    session.commit()
    session.close()
    return HttpResponse(json.dumps({"result" : cfg.TEST_SUCCESS}))

@csrf_exempt
def admin_in_handler(request):
    dburl = 'mysql+mysqlconnector://root:140810@localhost:3306/voc'
    DBSession = connectDB(dburl)
    session = DBSession()
    user = session.query(User).all()
    res = []
    
    for i in range(len(user)):
        res_user = {}
        res_user['user_name'] = user[i].user_id
        res_user['user_pwd']  = user[i].user_pwd
        res_user['sel_vocab'] = user[i].sel_thesaurus
        res_user['com_vocab'] = user[i].com_thesaurus
        res_user['com_num']  =  user[i].com_vocnum
        res_user['plan_num'] =  user[i].plan_vocnum
        res.append(res_user)
    print(res)
    return HttpResponse(json.dumps({"user": res}))

@csrf_exempt
def admin_modify_handler(request):
    a = request.POST
    dburl = 'mysql+mysqlconnector://root:140810@localhost:3306/voc'
    DBSession = connectDB(dburl)
    session = DBSession()
    
    modify_name = a.get("modify_name")
    modified_pwd = a.get("modified_pwd")
    clear_review = a.get("clear_review")
    reset_user = a.get("reset_user")
    clear_review = True if clear_review == "true" else False
    reset_user = True if reset_user == "true" else False
    
    if(modify_name == ''):
        return HttpResponse(json.dumps({"result": cfg.NOT_INPUT_USER}))

    try:
        user = session.query(User).filter(User.user_id == modify_name).one() 
    except Exception:
        return HttpResponse(json.dumps({"result": cfg.NO_SUCH_USER}))

    if modified_pwd != '':
        user.user_pwd = modified_pwd
        

    if clear_review:
        session.query(Review).filter(user.user_id == modify_name).delete()

    if reset_user:
        user.sel_thesaurus = 0
        user.com_thesaurus = 0
        user.com_vocnum = 0
        user.plan_vocnum = 0
        user.last_vocnum = 0
    session.commit()
    return HttpResponse(json.dumps({"result": cfg.MODIFY_SUCCESS}))

@csrf_exempt
def delete_handler(request):
    a = request.POST
    dburl = 'mysql+mysqlconnector://root:140810@localhost:3306/voc'
    DBSession = connectDB(dburl)
    session = DBSession()
    print(a)
    del_list = a.get("data")
    print("del_list",del_list)
    del_list.replace('', "")
    print("del_list2",del_list)
    del_list = json.loads(del_list)
    
    if del_list == None:
        return HttpResponse(json.dumps({"result": cfg.DELETE_SUCCESS}))
    for k,v in del_list.items():
        session.query(User).filter(User.user_id == v).delete()
        session.commit()
    return HttpResponse(json.dumps({"result": cfg.DELETE_SUCCESS}))



def setup(request):
    a = request.GET
    newpwd= a.get('passward')
    newtype = a.get('voctype')
    dburl = 'mysql+mysqlconnector://root:140810@localhost:3306/voc'
    DBSession = connectDB(dburl)
    session = DBSession()
    if hasattr(request, 'session'):
        userName = request.session.get('user_id')
    else:
        userName = "test_user"
    user = session.query(User).filter(User.user_id == userName).one()


