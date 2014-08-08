from django.shortcuts import render

def index(request):
	return render(request, 'ccpSandbox/index.html')

def newIndex(request):
	return render(request, 'ccpSandbox/newIndex.html')