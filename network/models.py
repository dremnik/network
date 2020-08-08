from django.contrib.auth.models import AbstractUser
from django.db import models


# Create your models here
class User(AbstractUser):
    """
    Model for representing network users.
    """
    followers = models.ManyToManyField("self", related_name="followers")
    following = models.ManyToManyField("self", related_name="following")

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

    def get_like_count(self):
        """Returns the number of likes on this post"""
        return self.liked_by.count()