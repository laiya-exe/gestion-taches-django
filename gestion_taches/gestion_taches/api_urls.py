from django.urls import path, include
from rest_framework.routers import DefaultRouter
from projects.api_views import ProjectViewSet
from tasks.api_views import TaskViewSet
from users.api_views import UserViewSet
from users.views import user_stats
from users.api_views import (
    UserDetailView,
    change_password,
    RegisterView,
    CurrentUserUpdateView,
    ChangePasswordView
)


router = DefaultRouter()
router.register(r"projects", ProjectViewSet, basename="api-project")
router.register(r"tasks", TaskViewSet, basename="api-task")
router.register(r"users", UserViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("stats/", user_stats, name="user_stats"),
    path("api/user/", CurrentUserUpdateView.as_view(), name="current_user_update"),
    path("api/user/change-password/", ChangePasswordView.as_view(), name="change_password", ),
    path("user/", UserDetailView.as_view(), name="user-detail"),
    path("register/", RegisterView.as_view(), name="register"),
]