from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse


def index(request):
	
	return render(request, 'backboneSandbox/index.html', context)