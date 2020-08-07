from datetime import datetime
from django.test import TestCase

from .models import User, Post

# Create your tests here.
class UserTestCase(TestCase):
    def setUp(self):
        username = "test_username"
        password = "test_password"
        test_user = User.objects.create_user(username, password)
        p1 = Post.objects.create(
            author=test_user,
            content="This is the content",
            like_count=0,
        )

    def test_username(self):
        user = User.objects.get(pk=1)
        self.assertEqual(user.get_username(), "test_username")

    def test_password(self):
        user = User.objects.get(username="test_username")
        is_valid = user.check_password("test_password")
        self.assertTrue(is_valid)

    def test_posts_count(self):
        user = User.objects.get(username="test_username")
        self.assertEqual(user.posts.count(), 1)


class PostTestCase(TestCase):
    def setUp(self):
        username = "test_username"
        password = "test_password"
        author = User.objects.create_user(username, password)
        p1 = Post.objects.create(
            author=author,
            content="This is the content",
            like_count=0,
        )

    def test_author(self):
        p = Post.objects.get(content="This is the content")
        self.assertEqual(p.author.username, "test_username")

    def test_content(self):
        p = Post.objects.get(content="This is the content")
        self.assertEqual(p.content, "This is the content")

    def test_like_count(self):
        p = Post.objects.get(content="This is the content")
        p.add_likes(2)
        self.assertEqual(p.like_count, 2)
