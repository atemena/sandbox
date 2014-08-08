from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.shortcuts import render_to_response
from tumblrSandbox.models import *
from rauth import OAuth1Service
from django.shortcuts import redirect
import requests
import pytumblr

tumblr = OAuth1Service(
	    name='tumblr',
	    consumer_key='zLZDEzKfKaxtlMeFnG1dXrZ4jlo1pFZuDZRLQGR7izKBHB7DeJ',
	    consumer_secret='c05OzghD6IBkKtD0Vekg2ucAK0q5dwgafhzbzlRs2kf4tn0sCq',
	    request_token_url='http://www.tumblr.com/oauth/request_token',
	    access_token_url='http://www.tumblr.com/oauth/access_token',
	    authorize_url='http://www.tumblr.com/oauth/authorize',
	    )

def index(request):
	return render(request, 'tumblrSandbox/index.html')

def authen(request):
	if 'oauth_token' in request.session.keys() and 'oauth_token_secret' in request.session.keys() and 'session' in request.session.keys():
		options = {'type': 'photo', 'state':'queue', 'publish_on':'2014-05-9T15:21:30', 'source': 'http://img2.wikia.nocookie.net/__cb20120427202836/gameofthrones/images/7/78/House_Stark_sigil.jpg'}
		r = request.session['session'].post('http://api.tumblr.com/v2/blog/'+request.session['blog_url']+'/post', data=options)
		if response == 201:
			return HttpResponse(status=201)
		if r.status_code == 401:
			request.session.flush()
	request_token, request_token_secret = tumblr.get_request_token(method='POST', key_token='oauth_token', key_token_secret='oauth_token_secret', data={'oauth_callback':'http://127.0.0.1:8000/tumblrSandbox/getSession'})
	authorize_url = tumblr.get_authorize_url(request_token)
	request.session['oauth_token'] = request_token
	request.session['oauth_token_secret'] = request_token_secret
	request.session['blog_url'] =  request.GET.get('blog')
	return redirect(authorize_url)

@csrf_exempt
def getSession(request):
	#check if user already has verified token if not do:
	request.session['session'] = tumblr.get_auth_session(request.session['oauth_token'], request.session['oauth_token_secret'], data={'oauth_verifier':request.GET.get('oauth_verifier')})
	options = {'type': 'photo', 'source': 'http://img2.wikia.nocookie.net/__cb20120427202836/gameofthrones/images/7/78/House_Stark_sigil.jpg'}
	r = request.session['session'].post('http://api.tumblr.com/v2/blog/'+request.session['blog_url']+'/post', data=options)
	return HttpResponse(status=201)

def editOrDeletePost(request):
	#check if user already has verified token if not do:
	post_id = request.POST.get('postID')
	action = request.POST.get('action')
	request.session['blog_url'] =  request.GET.get('blog')
	if not request.session['session']:
		if not request.session['oauth_token'] or not request.session['oauth_token_secret']:
			return redirect(authen)
		request.session['session'] = tumblr.get_auth_session(request.session['oauth_token'], request.session['oauth_token_secret'], data={'oauth_verifier':request.GET.get('oauth_verifier')})
	if action == 'edit':
		options = {'id':post_id, 'date':request.POST.get('date')}
	if action == 'delete':
		options = {'id':post_id}
	r = request.session['session'].post('http://api.tumblr.com/v2/blog/'+request.session['blog_url']+'/post/' + action, data=options)
	return HttpResponse(status=201)
'''
def getQueue():
	queue = request.session['session'].post('http://api.tumblr.com/v2/blog/'+request.session['blog_url']+'/posts/queue', '')
	import pdb; pdb.set_trace();
	return queue.json()
'''

