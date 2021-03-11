
from django.urls import path

from . import views

urlpatterns = [
    # Django Routes
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("posts/<str:view>/<int:user_id>/<int:page>", views.posts, name="posts"),
    path("post/add", views.create, name="create"),
    path("post/<int:post_id>", views.update, name="update"),
    path("like/<int:post_id>", views.like, name="like"),
    path("profile/<int:user_id>", views.profile, name="profile"),
    path("follow/<int:user_followed>", views.follow, name="follow")
]
