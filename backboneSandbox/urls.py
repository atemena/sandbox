from django.conf.urls import patterns, url

from backboneSandbox import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    #url(r'', views.createCard),
)