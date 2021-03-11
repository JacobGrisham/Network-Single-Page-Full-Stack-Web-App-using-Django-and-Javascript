from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.fields import PositiveSmallIntegerField


class User(AbstractUser):
    pass

    def __str__(self):
        return f"User {self.id} is ${self.username}"
    
    def serialize(self):
        return {
            "user_id": self.user_id,
            "username": self.username,
        }

class Follow(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name="Owner", verbose_name="Account owner who follows another")
    follower_id = models.ManyToManyField(User, related_name="Follower")

    def __str__(self):
        return f"{self.follower_id} is following ${self.user_id}"

    def serialize(self):
        return {
            "user_id": self.user_id,
            "follower_id": self.follower_id,
        }

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="Author", verbose_name="User who created the post")
    content = models.TextField(max_length=280)
    timestamp = models.DateTimeField(auto_now=False, auto_now_add=False)
    likes = models.PositiveSmallIntegerField(default=0)

    def __str__(self):
        return f"{self.author} wrote a post on ${self.timestamp}. Here is the content of the post: {self.content}"

    def serialize(self):
        return {
            "post_id": self.id,
            "author": self.author.username,
            "author_id": self.author.id,
            "content": self.content,
            "timestamp": self.timestamp.strftime("%m/%d/%Y, %H:%M"),
        }
    
class Like(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name="Liker", verbose_name="User who liked the post")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="Post", verbose_name="The post that the user liked")
    like = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user_id} likes ${self.post}"

    def serialize(self):
        return {
            "user_id": self.user_id.id,
            "post_id": self.post.id,
            "like": self.like
        }