"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib.admin import AdminSite
from django.http import HttpResponseRedirect
from django.urls import path, include
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.contrib import admin


# Eliminamos el requisito de login en el admin
class MyAdminSite(AdminSite):
    @method_decorator(never_cache)
    def has_permission(self, request):
        print(request.user)
        return HttpResponseRedirect("/admin/backend/")


# Crea una instancia del nuevo sitio de administración sin autenticación
admin_site = MyAdminSite()

urlpatterns = [
    path("api/", include("farming.urls")),
    path("", admin.site.urls),
]
