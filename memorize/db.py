from memorize.voc import User, All_voc, Review, Test, connectDB
from sqlalchemy.sql import operators
import json
from sqlalchemy.orm import join

def add_user(userName,passWord):
    dburl = 'mysql+mysqlconnector://root:140810@localhost:3306/voc'
    DBSession = connectDB(dburl)
    session = DBSession()
    users = session.query(User).filter(User.user_id == userName).all()
    for item in users:
        if item:
            # 表示该账号已经存在
            session.close()
            return 
            
    new_user = User(user_id=userName, user_pwd=passWord)
    # 添加到session:
    session.add(new_user)
    # 提交即保存到数据库:
    session.commit()
    # 关闭session:
    session.close()
    return 

def set_sel_thesaurus(userName, thesaurus):
    dburl = 'mysql+mysqlconnector://root:140810@localhost:3306/voc'
    DBSession = connectDB(dburl)
    session = DBSession()
    a = session.query(User).filter_by(user_id=userName).one()
    a.sel_thesaurus = thesaurus
    # 提交即保存到数据库:
    session.commit()
    # 关闭session:
    session.close()


def set_plan_vocnum(userName, plan_vocnum):
    dburl = 'mysql+mysqlconnector://root:140810@localhost:3306/voc'
    DBSession = connectDB(dburl)
    session = DBSession()
    a = session.query(User).filter_by(user_id=userName).one()
    a.plan_vocnum = plan_vocnum
    # 提交即保存到数据库:
    session.commit()
    # 关闭session:
    session.close()


def set_last_vocnum(userName, last_vocnum):
    dburl = 'mysql+mysqlconnector://root:140810@localhost:3306/voc'
    DBSession = connectDB(dburl)
    session = DBSession()
    a = session.query(User).filter_by(user_id=userName).one()
    a.last_vocnum = last_vocnum
    # 提交即保存到数据库:
    session.commit()
    # 关闭session:
    session.close()



def clear_user():
    dburl = 'mysql+mysqlconnector://root:140810@localhost:3306/voc'
    DBSession = connectDB(dburl)
    session = DBSession()
    session.query(User).filter_by(user_id="test_user").delete()
    session.query(User).filter_by(user_id="test_register_success").delete()
    # session.query(User).filter_by(last_vocnum = 0).delete()
    # 提交即保存到数据库:
    session.commit()
    # 关闭session:
    session.close()
