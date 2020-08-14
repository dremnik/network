import json

from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseNotAllowed, JsonResponse
from django.shortcuts import render
from django.urls import reverse

from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth.decorators import login_required

from .models import User


@ensure_csrf_cookie
def index(request):
    return render(request, "network/index.html")

@login_required
def new_post(request):
    if request.method != "POST":
        return HttpResponseNotAllowed("Sorry, that method is not allowed.")

    try:
        post = json.loads(request.body)
    except JSONDecodeError:
        return JsonResponse({"success": False, "error": "invalid format: must be JSON."})

    post_content = post.get('content')

    if post_content is None:
        return JsonResponse({"success": False, "error": "invalid format: must be of form {'content': '*content*'}"})

    # TODO: need to add post to db at this point.

    return JsonResponse({"success": True, "error": None})

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successfucheck if authenticatedl
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
    # render for everything except POST
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
        return JsonResponse({'auth': True})
    
    return JsonResponse({'auth': False})
