from sqlalchemy import Column, Integer, BigInteger, String, DECIMAL, Boolean, ForeignKey
from app.core.database import Base

class ServiceArea(Base):
    __tablename__ = "service_areas"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    city = Column(String(100))
    province = Column(String(100))
    lat = Column(DECIMAL(10,7))
    lng = Column(DECIMAL(10,7))
    is_active = Column(Boolean, default=True)

class ProviderServiceArea(Base):
    __tablename__ = "provider_service_areas"
    provider_id = Column(BigInteger, ForeignKey("providers.id", ondelete="CASCADE"), primary_key=True)
    area_id = Column(Integer, ForeignKey("service_areas.id", ondelete="CASCADE"), primary_key=True)