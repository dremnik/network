import json

from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, Http404
from django.http import HttpResponseNotAllowed
from django.shortcuts import render, get_list_or_404
from django.urls import reverse
from django.core.paginator import Paginator
from django.core.serializers import serialize

from django.views.decorators.csrf import ensure_csrf_cookie

from .models import User, Post

@ensure_csrf_cookie
def index(request):
    return render(request, "network/index.html")

def list_posts(request):
    """
    Returns a page worth of posts specified by page.
    """
    if request.method != "GET":
        return HttpResponseNotAllowed("Sorry, that method is not allowed.")

    page_num = request.GET.get('page')
    if page_num is None:
        return JsonResponse({"error": "you must specify the page number in the URL params."})

    pages = Paginator(Post.objects.order_by('-id'), 10)
    page = pages.page(page_num).object_list

    posts = serialize('json', page, use_natural_foreign_keys=True, use_natural_primary_keys=True)

    return HttpResponse(posts, content_type="application/json")

def create_post(request):
    """
    Handles the creation of a new post.
    It only accepts HTTP POST requests, and the payload body should contain a JSON
    object representing the post, which takes this form: {'content': '*post_content*'}
    """
    if request.method != "POST":
        return HttpResponseNotAllowed("Sorry, that method is not allowed.")
    elif not request.user.is_authenticated:
        return JsonResponse({"error": "auth error: must be authenticated to post to this endpoint"}, status=401)

    try:
        post = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "invalid format: must be JSON."}, status=400)

    post_content = post.get('content')

    if post_content is None:
        return JsonResponse({"error": "invalid format: must be of form {'content': '*post_content*'}"}, status=400)
    elif len(post_content) > 250:
        return JsonResponse({"error": "invalid post: content length exceeds 250 chars."}, status=400)

    Post.objects.create(author=request.user, content=post_content)

    return JsonResponse({"error": None})


def update_post(request, post_id):
    """
    Updates a user post as long as the user is the author.
    Returns the new post object on success.
    """
    if request.method != "POST":
        return HttpResponseNotAllowed("Sorry, that method is not allowed.")
    elif not request.user.is_authenticated:
        return JsonResponse({"error": "auth error: must be authenticated to post to this endpoint"}, status=401)

    post_list = get_list_or_404(Post, pk=post_id)
    post = post_list[0] # will always be of length one, but need the list in order to serialize

    if request.user != post.author:
        return JsonResponse({"error": "auth error: this post was not created by you."}, status=401)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "invalid format: must be JSON."}, status=400)

    new_content = data.get('content')

    if new_content is None:
        return JsonResponse({"error": "invalid format: must be of form {'content': '*post_content*'}"}, status=400)
    elif len(new_content) > 250:
        return JsonResponse({"error": "invalid post: content length exceeds 250 chars."}, status=400)

    post.content = new_content
    post.save()

    res = serialize('json', post_list, use_natural_foreign_keys=True, use_natural_primary_keys=True)
    return HttpResponse(res, content_type="application/json")


def create_like(request, post_id):
    """
    Add a like to a post.
    Must be authenticated to post to this endpoint.
    """
    if request.method != "POST":
        return HttpResponseNotAllowed("Sorry, that method is not allowed.")
    elif not request.user.is_authenticated:
        return JsonResponse({"error": "auth error: must be authenticated to post to this endpoint"}, status=401)

    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        raise Http404("id error: there is no post with that id")

    post.add_like(request.user)

    return JsonResponse({"error": None})

def destroy_like(request, post_id):
    """
    Remove a like from a post.
    Must be authenticated to post to this endpoint.
    """
    if request.method != "POST":
        return HttpResponseNotAllowed("Sorry, that method is not allowed.")
    elif not request.user.is_authenticated:
        return JsonResponse({ "error": "auth error: must be authenticated to post to this endpoint"}, status=401)

    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return HttpResponse("id error: there is no post with that id")

    post.remove_like(request.user)

    return JsonResponse({"error": None})

def login_view(request):
    if request.method == "POST":
        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def register(request):
    # render for every method except POST
    if request.method != "POST":
        return render(request, "network/register.html")

    username = request.POST["username"]
    email = request.POST["email"]
    password = request.POST["password"]
    confirmation = request.POST["confirmation"]
    if password != confirmation:
        return render(request, "network/register.html", {
            "message": "Passwords must match."
        })

    # Attempt to create new user
    try:
        user = User.objects.create_user(username, email, password)
        user.save()
    except IntegrityError:
        return render(request, "network/register.html", {
            "message": "Username already taken."
        })

    login(request, user)
    return HttpResponseRedirect(reverse("index"))


def authenticated(request):
    if request.user.is_authenticated:
        return JsonResponse({'auth': True, 'user': request.user.username})

    return JsonResponse({'auth': False, 'user': None})

