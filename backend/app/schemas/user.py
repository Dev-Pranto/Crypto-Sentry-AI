from pydantic import BaseModel, EmailStr

# Properties to receive via API on user creation
class UserCreate(BaseModel):
    email: EmailStr
    password: str

# Properties to return via API, hiding sensitive data
class User(BaseModel):
    id: int
    email: EmailStr

    class Config:
        from_attributes = True  # Replaces orm_mode in Pydantic v2
