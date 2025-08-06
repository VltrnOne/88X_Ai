import base64
from cryptography.fernet import Fernet, InvalidToken
from app.config import settings

_key = base64.urlsafe_b64encode(base64.b64decode(settings.SECRET_KEY_BASE64))
fernet = Fernet(_key)

def enc(s: str) -> str:
    return fernet.encrypt(s.encode()).decode()

def dec(s: str) -> str:
    try:
        return fernet.decrypt(s.encode()).decode()
    except InvalidToken:
        return "" 