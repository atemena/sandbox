from django.conf.urls import patterns, url

from ccpSandbox import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^newIndex/$', views.newIndex, name='newIndex'),
    #url(r'', views.createCard),
)