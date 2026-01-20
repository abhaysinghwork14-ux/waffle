from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timezone
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = 'users'
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), unique=True, nullable=False, index=True)
    current_points = Column(Integer, default=0)
    lifetime_points = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    redemptions = relationship('Redemption', back_populates='user', cascade='all, delete-orphan')
    transactions = relationship('PointTransaction', back_populates='user', cascade='all, delete-orphan')

class Redemption(Base):
    __tablename__ = 'redemptions'
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    user_name = Column(String(255), nullable=False)
    reward_id = Column(String(50), nullable=False)
    reward_name = Column(String(255), nullable=False)
    points_spent = Column(Integer, nullable=False)
    reward_code = Column(String(50), nullable=False, unique=True)
    claimed = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    claimed_at = Column(DateTime(timezone=True), nullable=True)
    
    user = relationship('User', back_populates='redemptions')

class PointTransaction(Base):
    __tablename__ = 'point_transactions'
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    user_name = Column(String(255), nullable=False)
    points = Column(Integer, nullable=False)
    reason = Column(String(255), nullable=False)
    transaction_type = Column(String(20), nullable=False, index=True)  # "earned" or "spent"
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    user = relationship('User', back_populates='transactions')
