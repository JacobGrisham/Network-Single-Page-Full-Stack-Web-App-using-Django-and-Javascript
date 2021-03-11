from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError
from django.core.exceptions import EmptyResultSet
from django.http import HttpResponse, HttpResponseRedirect
import json
from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.utils import timezone
from django import forms

from .models import User, Follow, Post, Like

# ------------------------------------------------------------------------
# DJANGO FORMS
# ------------------------------------------------------------------------

class PostForm(forms.Form):
    create_content = forms.CharField(label="New Post", max_length=280, widget=forms.Textarea)

# ------------------------------------------------------------------------
# DJANGO ROUTES
# ------------------------------------------------------------------------

def index(request):
    # Simply return index.html because index.js will take care of the rest via API calls
    return render(request, "network/index.html")

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
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
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
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
    else:
        return render(request, "network/register.html")

# ------------------------------------------------------------------------
# API ROUTES
# ------------------------------------------------------------------------

def posts(request, view, user_id, page):

    lower_limit = page * 10
    upper_limit = page * 10 + 10

    # Filter posts returned based on view selection
    # In order to for this function to have the single responsibility for displaying posts, I had to include user_id in the parameters
    if view == "public":
        posts = Post.objects.all()
    elif view == "profile":
        user_id = user_id
        posts = Post.objects.filter(author=user_id)
    elif view == "following":
        following = Follow.objects.filter(user_id=user_id).values_list("follower_id")
        posts = Post.objects.filter(author_id__in = following)
    else:
        return JsonResponse({"error": "Invalid view."}, status=400)

    # Return posts in reverse chronologial order
    posts = posts.order_by("-timestamp")[lower_limit:upper_limit]

    return JsonResponse([post.serialize() for post in posts], safe=False)


def profile(request, user_id):
    # Obtaining profile info must be via GET
    if request.method != "GET":
        return JsonResponse({"error": "POST request required."}, status=400)
    else:
        try:
            username = User.objects.get(pk=user_id)
            following = Follow.objects.filter(user_id=user_id).count()
            followers = Follow.objects.filter(follower_id=user_id).count()
            currently_following = Follow.objects.filter(user_id=request.user, follower_id=user_id).count()
        except:
            return JsonResponse({"error": "Invalid user."}, status=400)
        else:
            data = {
                "username": username.username,
                "following": following,
                "followers": followers,
                "currently_following": currently_following
            }
            return JsonResponse(data, safe=False)

@csrf_exempt
@login_required
def follow(request, user_followed):
    # Composing a new post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    else:
        followed = Follow.objects.filter(user_id=request.user, follower_id=user_followed)
        if len(followed) > 0:
            # Logged in user currently follows this user and now wants to unfollow this user, so delete entry
            Follow.objects.get(user_id=request.user, follower_id=user_followed).delete()
            return JsonResponse({"message": "User unfollowed."}, status=201)
        else:
            # User wants to follow another user, so create an entry
            follow = Follow(user_id=request.user)
            follow.save()
            follow.follower_id.add(user_followed)
            return JsonResponse({"message": "User followed."}, status=201)


@csrf_exempt
@login_required
def create(request):
    # Composing a new post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    else:
        # Get contents of post
        try:
            data = json.loads(request.body)
            content = data.get("content", "")
            post = Post(author=request.user, content=content, timestamp=timezone.now())
            post.save()
            return JsonResponse({"message": "Post created successfully."}, status=201)
        except:
            return JsonResponse({"error": "Server side logic failed"}, status=400)

@csrf_exempt
@login_required
def update(request, post_id):
    # Editing an existing post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    else:
        post = Post.objects.get(pk=post_id)
        # Only the author can edit the post
        if post.author == request.user:
                try:
                    data = json.loads(request.body)
                    content = data.get("content", "")
                    timestamp = timezone.now()
                    post.content = content
                    post.timestamp = timestamp
                    post.save(update_fields=['content', 'timestamp'])
                    return JsonResponse({"message": "Email sent successfully."}, status=201)
                except:
                    return JsonResponse({"error": "Server side logic failed"}, status=400)
        else:
            return JsonResponse({"forbidden": "You must be the author to edit this post"}, status=400)

@csrf_exempt
@login_required
def like(request, post_id):
    if request.method == "POST":
        # If user already liked or unliked the post
        if Like.objects.filter(user_id=request.user, post_id=post_id).exists():
            liked = Like.objects.get(user_id=request.user, post_id=post_id)
            # If user already liked the post change to unlike
            if liked.like == True:
                liked.like = False
                liked.save(update_fields=['like'])
                return JsonResponse({"message": "Post unliked."}, status=201)
            # If user already unliked the post previously then change to like
            else:
                liked.like = True
                liked.save(update_fields=['like'])
                return JsonResponse({"message": "Post liked again."}, status=201)
        # If user has not liked or unliked the post, create an entry
        else:
            like = Like(user_id=request.user, post_id=post_id, like=True)
            like.save()
            return JsonResponse({"message": "Post liked."}, status=201)
    else:
        try:
            try:
                post = Like.objects.get(user_id=request.user.id, post_id=post_id)
                user_liked = post.like
            except:
                user_liked = False
            total_likes = Like.objects.filter(post_id=post_id, like=True).count()
            data = {
                'total_likes': total_likes,
                'user_liked': user_liked,
            }
            return JsonResponse(data)
        except:
            return JsonResponse({"error": "Server side logic failed"}, status=400)