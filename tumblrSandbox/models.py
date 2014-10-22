from django.db import models

##class TumblrInfo(models.Model):
'''
username = models.CharField(max_length=32)
token = models.CharField(max_length=32, blank=True, default='')
token_secret = models.CharField(max_length=32, blank=True, default='')
verifier = models.CharField(max_length=32, blank=True, default='')
header = models.TextField( blank=True, default='')
'''
'''
user = models.ForeignKey(PinterestUser, null=True, blank=True)
board = models.ForeignKey(Board, null=True, blank=True)
# Always 18 characters, but set to 31 for room to change
pin_id = models.CharField(max_length=31, unique=True)
# taken from the image url
md5 = models.CharField(max_length=32, blank=True, default='')
description = models.TextField()
source = models.CharField(max_length=255, blank=True, default='')
likes = models.IntegerField(default=0, db_index=True)
repins = models.IntegerField(default=0, db_index=True)
comments = models.IntegerField(default=0, db_index=True)
actions = models.IntegerField(default=0, db_index=True)
price = models.BigIntegerField(default=0)
currency = models.CharField(max_length=1)
etag = models.CharField(max_length=63, blank=True)
pinned = models.DateTimeField(null=True, blank=True)
created = models.DateTimeField(auto_now_add=True)
updated = models.DateTimeField(auto_now=True)
'''

STATUS_CHOICES = (
	(0,'unrequested') ,
	(1,'requested') ,
	(2,'granted'),
)

class Image(models.Model):
		favorites = models.IntegerField()
		text = models.CharField()
		link = models.CharField()
		image_url = models.CharField(unique=true)
		social_network = models.CharField()
		username = models.CharField()
		retweets = models.IntegerField(null=true, blank=true)
		tags = models.CharField()
		status = models.CharField(choices=STATUS_CHOICES)
