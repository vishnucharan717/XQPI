from rest_framework.permissions import BasePermission
from rest_framework_simplejwt.tokens import AccessToken
from django.core.cache import cache

class IsTokenValid(BasePermission):
    def has_permission(self, request, view):
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            access_token = auth_header.split(' ')[1]
            try:
                token_obj = AccessToken(access_token)
                if cache.get(token_obj['jti']):
                    return False  # Token is blacklisted
            except Exception:
                return False  # Token is invalid
        return True  # No token provided
