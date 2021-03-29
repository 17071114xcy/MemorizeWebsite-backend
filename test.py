# -*- coding: utf-8 -*-
# （3）
from django.test import TestCase,Client,RequestFactory
import requests
import memorize.views
import memorize.cfg
import memorize.db
import json
import datetime

class TestLogin(TestCase):
    def setUp(self):
        self.request = RequestFactory()                                 #生成request         
        memorize.db.clear_user()                                        #清空用户
        memorize.db.add_user("test_user", "test_password")              #创建测试用户test_user
        

# 1.注册接口测试 
    def test1_register_USER_EXIST(self):            #用户已存在
        print("\n running test1_register_USER_EXIST \n")
        The_request = self.request.post("/register/",{'username': "test_user", 'password': 'testt_password'})       #输入与已有用户相同的用户名
        temp = memorize.views.save(The_request)
        result = json.loads(temp.content)
        self.assertEqual(result['register'],memorize.cfg.USER_EXIST)                                                #返回值为用户已存在
    
    def test2_register_REG_SUCCESS(self):           #注册成功
        print("\n running test2_register_REG_SUCCESS \n")
        now_time = str(datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        The_request = self.request.post("/register/",{'username': now_time, 'password': 'testt_register_success'})  #输入与已有用户不相同的用户名
        temp = memorize.views.save(The_request)
        result = json.loads(temp.content)
        self.assertEqual(result['register'],memorize.cfg.REG_SUCCESS)                                               #返回值为注册成功
    
# 2.登录接口测试
    def test3_login_handler_USER_NOTEXIST(self):  #用户不存在 
        print("\n running test3_login_handler_USER_NOTEXIST \n")                                                
        The_request = self.request.post("/login/",{'username': 'test_login_user_notexist', 'password': 'testt_login_user_notexist'})  #输入数据库中不存在的用户名
        temp = memorize.views.login_handler(The_request)
        result = json.loads(temp.content)
        self.assertEqual(result['login'],memorize.cfg.USER_NOTEXIST)                                                            #返回值为用户不存在
    
    def test4_login_handler_PWD_INCORRECT(self):  #密码不正确
        print("\n running test4_login_handler_PWD_INCORRECT \n")
        The_request = self.request.post("/login/",{'username': 'test_user', 'password': 'testt_pwd_incorrect'})                 #输入错误密码
        temp = memorize.views.login_handler(The_request)
        result = json.loads(temp.content)
        self.assertEqual(result['login'], memorize.cfg.PWD_INCORRECT)                                                           #返回值为密码错误
        
    def test5_login_handler_LOGIN_SUCCESS(self):  #登陆成功
        print("\n running test5_login_handler_LOGIN_SUCCESS \n")
        The_request = self.request.post("/login/",{'username': 'test_user', 'password': 'test_password'})                       #输入正确的用户名和密码
        temp = memorize.views.login_handler(The_request)
        result = json.loads(temp.content)
        self.assertEqual(result['login'], memorize.cfg.LOGIN_SUCCESS)                                                           #返回值为登录成功

# 3.设置接口测试
    def test6_setting_OLD_PWD_ERROR(self):  #原密码错误
        print("\n running test6_setting_OLD_PWD_ERROR \n")
        The_request = self.request.post("/setting/", {'old_pwd': 'test_old_pwd_error', 'new_pwd': 'kkk', 'plan_num': '20', 'vocab_type': 'cet-4'})              #输入原密码错误
        temp = memorize.views.save_set(The_request) 
        result = json.loads(temp.content)
        self.assertEqual(result['setting'], memorize.cfg.OLD_PWD_ERROR)                                                                                         #返回值为原密码错误
        
    def test7_setting_SET_SUCCESS(self):  #设置成功
        print("\n running test7_setting_SET_SUCCESS \n")
        The_request = self.request.post("/setting/", { 'old_pwd': 'test_password', 'new_pwd': 'new_test_password', 'plan_num': '20', 'vocab_type': 'cet-6'})    #输入正确的密码和设置信息
        temp = memorize.views.save_set(The_request)
        result = json.loads(temp.content)
        self.assertEqual(result['setting'],memorize.cfg.SET_SUCCESS)                                                                                            #返回值为设置成功
    
# 4.选择词库接口测试
    def test8_in_handler_NOT_SELECT_VOCAB(self):  #没有选择词库
        print("\n running test8_in_handler_NOT_SELECT_VOCAB \n")
        The_request = self.request.post("/setting/")                              #用户没有选择词库
        temp = memorize.views.in_handler(The_request)
        result = json.loads(temp.content)
        self.assertEqual(result['in'],memorize.cfg.NOT_SELECT_VOCAB)              #返回值为用户没有选择词库    
            
    def test9_in_handler_MEM_IN_SUCCESS(self):  #已选择词库
        print("\n running test9_in_handler_MEM_IN_SUCCESS \n")
        The_request = self.request
        memorize.db.set_sel_thesaurus("test_user",2)                              #通过修改数据库中用户test_user的sel_thesaurus数据，表示test_user选择了词库
        temp = memorize.views.in_handler(The_request)
        result = json.loads(temp.content)
        self.assertEqual(result['in'],memorize.cfg.MEM_IN_SUCCESS)                #返回值为用户已选词库

# 5.背单词接口测试
    def test10_memorize_handler_NUM(self):  #背单词量是否与用户输入一致
        print("\n running test10_memorize_handler_NUM \n")
        memorize.db.set_plan_vocnum("test_user", 10)                            #设置用户计划背单词数为10 
        memorize.db.set_sel_thesaurus("test_user",2)                            #设置用户背诵词库为2(六级词汇)
        The_request = self.request.post("/memorize/")
        temp = memorize.views.memorize_handler(The_request)                     #得到ruquest
        result = json.loads(temp.content)
        self.assertEqual(len(result['words']["recite"]), 10)                    #判断返回的背诵词汇列表的长度与用户设置的10是否相同

    def test11_memorize_stop_handler(self):  #断点续背功能       
        print("\n running test11_memorize_stop_handler \n") 
        The_request = self.request.post("/memorize/",{'last_num' : 8})          #设置用户上次背诵到地8个词
        temp = memorize.views.memorize_stop_handler(The_request)
        result = json.loads(temp.content)
        self.assertTrue(result["result"])                                       #判断是否载入成功
       

# 6.测验题接口测试
    def test12_test_choice_handler(self):  #单选题    
        print("\n running test12_test_choice_handler \n")
        memorize.db.set_sel_thesaurus("test_user",2)                                                            #设置用户背诵词库为2(六级词汇)
        The_request = self.request
        temp = memorize.views.test_choice_handler(The_request)
        result = json.loads(temp.content)
        self.assertNotEqual(result["words"],None)                                                               #判断返回值列表是否为空
           
    def test13_test_spelling_handler(self):  #拼写题    
        print("\n running test13_test_spelling_handler \n")
        memorize.db.set_sel_thesaurus("test_user",2)                                                            #设置用户背诵词库为2(六级词汇)
        The_request = self.request
        temp = memorize.views.test_spelling_handler(The_request)
        result = json.loads(temp.content)
        self.assertNotEqual(result["words"], None)                                                              #判断返回值列表是否为空

    def test14_test_out_handler(self):  #测验结果
        print("\n running test14_test_out_handler \n")
        now_time=str(datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'))                                     #测试时间为当前时间
        The_request = self.request.post("/test/",{'time': now_time, 'score': 100.0,'type':'choice'})            #传入测试间间、成绩、测试类型
        temp = memorize.views.test_out_handler(The_request)
        result = json.loads(temp.content)
        self.assertEqual(result['result'], memorize.cfg.TEST_SUCCESS)                                           #判断返回值是否为记录成功


# 7.管理员接口测试
    def test15_admin_delete_handler_DELETE_SUCCESS(self):                                           #删除成功
        print("\n running test15_admin_modify_handler_MODIFY_SUCCESS \n")                                                                                                 
        The_request = self.request.post("/admin/",{"data": [{"'user_id'":"'test_user'"}]})
        # The_request = self.request.post("/admin/",{"data": "test_user"})                            #输入待删除用户名
        temp = memorize.views.delete_handler(The_request)
        result = json.loads(temp.content)
        self.assertEqual(result['result'], memorize.cfg.DELETE_SUCCESS)                             #判断返回值是否修改正确
        
    def test16_admin_modify_handler_NOT_INPUT_USER(self):                                           #输入为空 
        print("\n running test16_admin_modify_handler_NOT_INPUT_USER \n")                                                
        The_request = self.request.post("/admin/", {'modify_name': '', 'modified_pwd': "aaa", "clear_review": 0, "reset_user": 0})               #输入用户名为空
                               
        temp = memorize.views.admin_modify_handler(The_request)
        result = json.loads(temp.content)
        self.assertEqual(result['result'],memorize.cfg.NOT_INPUT_USER)                              #判断返回值是否为未输入用户名
    
    def test17_admin_modify_handler_NO_SUCH_USER(self):                                             #输入错误用户名
        print("\n running test17_admin_modify_handler_NO_SUCH_USER \n")
        The_request = self.request.post("/admin/", {'modify_name': 'ssss', 'modified_pwd': "aaa", "clear_review": 0, "reset_user": 0})           #输入用户表中没有的用户名
        temp = memorize.views.admin_modify_handler(The_request)
        result = json.loads(temp.content)
        self.assertEqual(result['result'], memorize.cfg.NO_SUCH_USER)                               #判断返回值是否为没有该用户名
        
    def test18_admin_modify_handler_MODIFY_SUCCESS(self):                                           #修改成功
        print("\n running test18_admin_modify_handler_MODIFY_SUCCESS \n")
        The_request = self.request.post("/admin/", {'modify_name': 'test_user', 'modified_pwd': "aaa", "clear_review": 0, "reset_user": 0})      #输入正确的用户名
        temp = memorize.views.admin_modify_handler(The_request)
        result = json.loads(temp.content)
        self.assertEqual(result['result'], memorize.cfg.MODIFY_SUCCESS)                             #判断返回值是否修改正确


        
if __name__ == '__main__':
    unitttest.main()



