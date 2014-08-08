from django.conf.urls import patterns, include, url
from django.conf import settings
from django.conf.urls.static import static
# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'bSandbox.views.home', name='home'),
    # url(r'^bSandbox/', include('bSandbox.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^balancedSandbox/', include('balancedSandbox.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^backboneSandbox/', include('backboneSandbox.urls')),
    url(r'^tumblrSandbox/', include('tumblrSandbox.urls')),
    url(r'^ccpSandbox/', include('ccpSandbox.urls')),
) + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
