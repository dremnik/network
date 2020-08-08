from datetime import datetime

from django.test import TestCase
from django.contrib.auth.password_validation import validate_password

from .models import User, Post

# Create your tests here.
class UserTestCase(TestCase):
    def setUp(self):
        self.username = "test_username"
        self.email = "testemail200@gmail.com"
        self.password = "dogsandcats100"
        user = User.objects.create_user(self.username, self.email, self.password)
        p1 = Post.objects.create(author=user, content="This is the content")

    def test_username(self):
        user = User.objects.get(pk=1)
        self.assertEqual(user.get_username(), self.username)

    def test_validate_password(self):
        self.assertEqual(validate_password(self.password), None)

    def test_password(self):
        user = User.objects.get(username=self.username)
        is_valid = user.check_password(self.password)
        self.assertTrue(is_valid)

    def test_followers(self):
        username = "user_2"
        email = "testuser200@gmail.com"
        follower = User.objects.create_user(username, email, self.password)
        user = User.objects.get(username=self.username)
        user.followers.add(follower)
        self.assertEqual(user.followers.get(username=username).get_username(), username)
        self.assertEqual(user.followers.count(), 1)

    def test_following(self):
        username = "user_2"
        email = "testuser200@gmail.com"
        new_user = User.objects.create_user(username, email, self.password)
        user = User.objects.get(username=self.username)
        user.following.add(new_user)
        self.assertEqual(user.following.get(username=username).get_username(), username)
        self.assertEqual(user.following.count(), 1)

    def test_posts(self):
        user = User.objects.get(username=self.username)
        post = user.posts.filter(content__contains="content").first()
        self.assertEqual(post.content, "This is the content")

    def test_posts_count(self):
        user = User.objects.get(username=self.username)
        self.assertEqual(user.posts.count(), 1)

        p = Post.objects.create(author=user, content="Anotha one")
        self.assertEqual(user.posts.count(), 2)


class PostTestCase(TestCase):
    def setUp(self):
        self.username = "test_username"
        self.password = "dogsandcats100"
        author = User.objects.create_user(self.username, self.password)
        p1 = Post.objects.create(author=author, content="This is the content")

    def test_author(self):
        p = Post.objects.get(content="This is the content")
        self.assertEqual(p.author.username, "test_username")

    def test_content(self):
        p = Post.objects.get(content="This is the content")
        self.assertEqual(p.content, "This is the content")

    def test_likes(self):
        p = Post.objects.get(content="This is the content")
        username = "user_2"
        email = "testuser200@gmail.com"
        new_user = User.objects.create_user(username, email, self.password)
        p.add_like(new_user)
        self.assertEqual(p.get_like_count(), 1)
        self.assertEqual(p.liked_by.get(username=username).get_username(), username)