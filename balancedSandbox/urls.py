from django.conf.urls import patterns, url

from balancedSandbox import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'createCC', views.createCard),
)