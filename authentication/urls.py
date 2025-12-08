from django.urls import path
from .views import (RegisterView, VerifyEmailView, ResendVerificationView, SendPhoneOTPView, 
                    VerifyPhoneOTPView, LoginView, ForgotPasswordEmailView, VerifyTokenView, 
                    ResetPasswordView, AdminUserListView, ApproveUserView, DeclineUserView,
                    SendLoginOTPView, VerifyLoginOTPView)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('forgot-password/', ForgotPasswordEmailView.as_view(), name='forgot-password'),
    path('verify-token/', VerifyTokenView.as_view(), name='verify-token'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('resend-verification/', ResendVerificationView.as_view(), name='resend-verification'),

    # Phone OTP
    path('phone/send-otp/', SendPhoneOTPView.as_view(), name='phone-send-otp'),
    path('phone/verify-otp/', VerifyPhoneOTPView.as_view(), name='phone-verify-otp'),

    # JWT
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Admin endpoints
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:user_id>/approve/', ApproveUserView.as_view(), name='approve-user'),
    path('admin/users/<int:user_id>/decline/', DeclineUserView.as_view(), name='decline-user'),
    
    # Login OTP endpoints
    path('login/send-otp/', SendLoginOTPView.as_view(), name='send-login-otp'),
    path('login/verify-otp/', VerifyLoginOTPView.as_view(), name='verify-login-otp'),
]