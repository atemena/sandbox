from django.conf.urls import patterns, url

from tumblrSandbox import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^authen/$', views.authen),
    url(r'^getSession/$', views.getSession),
    #url(r'', views.createCard),
)