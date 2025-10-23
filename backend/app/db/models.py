from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    alerts = relationship("Alert", back_populates="owner")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    crypto_symbol = Column(String, index=True, nullable=False)
    alert_type = Column(String, nullable=False) # e.g., 'ANOMALY', 'TREND_UP', 'PRICE_TARGET'
    is_active = Column(Boolean, default=True)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="alerts")
