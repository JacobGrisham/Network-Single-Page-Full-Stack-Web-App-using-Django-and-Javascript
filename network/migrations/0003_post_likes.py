# Generated by Django 3.1.6 on 2021-03-07 21:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0002_follow_like_post'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='likes',
            field=models.PositiveSmallIntegerField(default=0),
        ),
    ]
