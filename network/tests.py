from datetime import datetime

from django.test import TestCase
from django.contrib.auth.password_validation import validate_password

from .models import User, Post

# Create your tests here.
class UserTestCase(TestCase):
    def setUp(self):
        username = "test_username"
        email = "testemail200@gmail.com"
        password = "dogsandcats100"
        user = User.objects.create_user(username, email, password)
        p1 = Post.objects.create(author=user, content="This is the content", like_count=0)

    def test_username(self):
        user = User.objects.get(pk=1)
        self.assertEqual(user.get_username(), "test_username")

    def test_validate_password(self):
        self.assertEqual(validate_password("dogsandcats100"), None)

    def test_password(self):
        user = User.objects.get(username="test_username")
        is_valid = user.check_password("dogsandcats100")
        self.assertTrue(is_valid)

    def test_posts(self):
        user = User.objects.get(username="test_username")
        post = user.posts.filter(content__contains="content").first()
        self.assertEqual(post.content, "This is the content")

    def test_posts_count(self):
        user = User.objects.get(username="test_username")
        self.assertEqual(user.posts.count(), 1)

        p = Post.objects.create(author=user, content="Anotha one", like_count=0)
        self.assertEqual(user.posts.count(), 2)


class PostTestCase(TestCase):
    def setUp(self):
        username = "test_username"
        password = "dogsandcats100"
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
        p.remove_likes(4)
        self.assertEqual(p.like_count, 0)
