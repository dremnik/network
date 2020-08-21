from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("posts/create/", views.create_post, name="create_post"),
    path("posts/list/", views.list_posts, name="list_posts"),
    path("posts/update/<int:post_id>/", views.update_post, name="update_post"),
    path("likes/create/<int:post_id>/", views.create_like, name="create_like"),
    path("likes/destroy/<int:post_id>/", views.destroy_like, name="destroy_like"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("register/", views.register, name="register"),
    path("authenticated/", views.authenticated, name="authenticated"),
]
