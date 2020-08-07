from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    content = models.CharField(max_length=250)
    like_count = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def add_likes(self, n):
        self.like_count += n

    def remove_likes(self, n):
        if self.like_count - n >= 0:
            self.like_count -= n