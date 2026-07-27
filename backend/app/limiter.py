from slowapi import Limiter
from slowapi.util import get_remote_address

# Shared rate limiter. key_func uses the client IP; behind a proxy you would
# configure trusted forwarded headers instead.
limiter = Limiter(key_func=get_remote_address)