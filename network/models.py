from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models


# Create your models here
class UserManager(UserManager):
    def get_by_natural_key(self, username):
        return self.get(username=username)

class User(AbstractUser):
    """
    Model for representing network users.
    """
    followers = models.ManyToManyField("self", related_name="followers")
    following = models.ManyToManyField("self", related_name="following")

    objects = UserManager()

    def natural_key(self):
        return self.username


class Post(models.Model):
    """
    Model for representing network posts.
    """
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    content = models.CharField(max_length=250)
    liked_by = models.ManyToManyField(User, related_name="liked_by")
    timestamp = models.DateTimeField(auto_now_add=True)

    def add_like(self, user):
        """
        Adds a new like to this post by the user passed in
        """
        self.liked_by.add(user)

    def remove_like(self, user):
        self.liked_by.remove(user)

    def get_like_count(self):
        """Returns the number of likes on this post"""
        return self.liked_by.count()
