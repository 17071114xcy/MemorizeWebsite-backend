from sqlalchemy import Column, String, Integer, Float, create_engine, DateTime
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# 创建对象的基类:
Base = declarative_base()

def connectDB(dburl):
    # 初始化数据库连接:
    engine = create_engine(dburl)
    # 创建DBSession类型:
    DBSession = sessionmaker(bind=engine)
    return DBSession


# 定义User对象:
class User(Base):
    # 表的名字:
    __tablename__ = 'user'
    # 表的结构:
    user_id = Column(String(20), primary_key=True)
    user_pwd = Column(String(20))
    sel_thesaurus = Column(Integer, default=0)
    com_thesaurus = Column(Integer, default=0)
    com_vocnum = Column(Integer, default=0)
    plan_vocnum = Column(Integer, default=0)
    last_vocnum = Column(Integer, default=0)
    permission = Column(Integer, default=0)


class All_voc(Base):
    # 表的名字:
    __tablename__ = 'all_voc'
    # 表的结构:
    voc_id = Column(Integer, primary_key=True)
    spelling = Column(String(45), nullable=False)
    pronunciation= Column(String(45))
    translation = Column(String(100), nullable=False)
    thesaurus = Column(Integer, nullable=False)

class Review(Base):
    # 表的名字:
    __tablename__ = 'review'
    # 表的结构:
    voc_id = Column(Integer, primary_key=True)
    user_id = Column(String(20), primary_key=True)
    index = Column(Float)

class Test(Base):
    # 表的名字:
    __tablename__ = 'test'
    # 表的结构:
    user_id = Column(String(20), primary_key=True)
    test_time = Column(DateTime, primary_key=True)
    score = Column(Float, nullable=False)
    type = Column(String(20), nullable=False)


