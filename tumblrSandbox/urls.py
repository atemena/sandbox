from django.conf.urls import patterns, url

from tumblrSandbox import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^authen/$', views.authen),
    url(r'^getSessionTumblr/$', views.getSessionTumblr),
    url(r'^getSessionTwitter/$', views.getSessionTwitter),
    url(r'^getSessionInstagram/$', views.getSessionInstagram),
    url(r'^getImagesByTag/$', views.getImagesByTag),
    url(r'^mentionUser/$', views.mentionUser),
    url(r'^commentIG/$', views.commentIG),
    #url(r'', views.createCard),
)