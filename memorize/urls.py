"""memorize URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from memorize import views

urlpatterns = [
    path('admin/', admin.site.urls),#系统默认创建的
    path('login/',views.login),#用于打开登录页面
    path('register/',views.register),#用于打开注册页面
    path('register/save/',views.save),#输入用户名密码后交给后台save函数处理
    path('login/login_handler/',views.login_handler),#输入用户名密码后交给后台query函数处理
    path('setting/',views.setting),#用于打开登录页面
    path('setting/saveset/',views.save_set),#用于后台处理设置
    path('setting/fetch_set/',views.fetch_set),
    path('app/', views.toMainPage),
    
    path('profile/', views.profile),
    path('fetch_profile/', views.fetch_profile),

    path('app/memorize_in/', views.memorize_in),
    path('app/test_in/', views.test_in),

    path('app/in_handler/', views.in_handler),
    path('app/memorize/', views.memorize),
    path('app/memorize_handler/', views.memorize_handler),
    path('app/memorize_out_handler/', views.memorize_out_handler),
    path('app/memorize_stop_handler/', views.memorize_stop_handler),

    path('app/test/test_choice/', views.test_choice),
    path('app/test/test_spelling/', views.test_spelling),
    path('app/test/test_choice_handler/', views.test_choice_handler),
    path('app/test/test_spelling_handler/', views.test_spelling_handler),
    path('app/test/test_out_handler/', views.test_out_handler),

    path('app/query/', views.query),
    path('app/translation/', views.translation),

    path('admin/search/', views.admin_search),
    path('admin/search_in_handler/', views.admin_in_handler),
    path('admin/delete_handler/', views.delete_handler),

    path('admin/modify/', views.admin_modify),
    path('admin/modify_handler/', views.admin_modify_handler),
    path('admin_page/', views.admin),
]