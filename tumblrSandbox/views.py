from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.shortcuts import render_to_response
from tumblrSandbox.models import *
from rauth import OAuth1Service, OAuth2Service
from django.shortcuts import redirect
import json
import requests
import pytumblr

tumblr = OAuth1Service(
	    name='tumblr',
	    consumer_key='zLZDEzKfKaxtlMeFnG1dXrZ4jlo1pFZuDZRLQGR7izKBHB7DeJ',
	    consumer_secret='c05OzghD6IBkKtD0Vekg2ucAK0q5dwgafhzbzlRs2kf4tn0sCq',
	    request_token_url='http://www.tumblr.com/oauth/request_token',
	    access_token_url='http://www.tumblr.com/oauth/access_token',
	    authorize_url='http://www.tumblr.com/oauth/authorize')

twitter = OAuth1Service(
       name='example',
       consumer_key='H7oEtDyZMPEMxX0RuElUfGNKE',
       consumer_secret='Wc1JGtvLqblv3Um7yv5CVv04mDHlSGkVO1LUQcYBdenvDVUtnD',
       request_token_url='https://api.twitter.com/oauth/request_token',
       access_token_url='https://api.twitter.com/oauth/access_token',
       authorize_url='https://api.twitter.com/oauth/authorize',
       base_url='https://api.twitter.com/1.1/')

instagram = OAuth2Service(
       name='example',
       client_id='3cc0c367787843d4a97d8c59cfc9b208',
       client_secret='6fddfb45317f4e319dd8e66414e6f359',
       access_token_url='https://api.instagram.com/oauth/access_token',
       authorize_url='https://api.instagram.com/oauth/authorize/',
       base_url='https://api.instagram.com/')

#notes on refreshing tokens
# instagram will give error_type=OAuthAccessTokenError if expired will need to reauth if expired

def index(request):
	return render(request, 'tumblrSandbox/index.html')

def authen(request):
	network = request.GET.get('network')
	if network == 'tumblr':
		if 'tumblr_oauth_token' in request.session.keys() and 'tumblr_oauth_token_secret' in request.session.keys() and 'tumblr_session' in request.session.keys():
			return getSessionTumblr(request)			
		request_token, request_token_secret = tumblr.get_request_token(method='POST', key_token='oauth_token', key_token_secret='oauth_token_secret', data={'oauth_callback':'http://127.0.0.1:8000/tumblrSandbox/getSessionTumblr'})
		authorize_url = tumblr.get_authorize_url(request_token)
		request.session['tumblr_oauth_token'] = request_token
		request.session['tumblr_oauth_token_secret'] = request_token_secret

	elif network == 'twitter':
		request.session['twitter_search'] =  request.GET.get('search')
		request.session['twitter_mediatype'] =  request.GET.get('mediatype')
		if 'twitter_oauth_token' in request.session.keys() and 'twitter_oauth_token_secret' in request.session.keys() and 'twitter_session' in request.session.keys():
			return getSessionTwitter(request)
		else:
			request_token, request_token_secret = twitter.get_request_token(method='POST', key_token='oauth_token', key_token_secret='oauth_token_secret', data={'oauth_callback':'http://127.0.0.1:8000/tumblrSandbox/getSessionTwitter'})
			authorize_url = twitter.get_authorize_url(request_token)
			request.session['twitter_oauth_token'] = request_token
			request.session['twitter_oauth_token_secret'] = request_token_secret

	elif network == 'instagram':
		request.session['instagram_search'] =  request.GET.get('search')
		#if 'oauth_token' in request.session.keys() and 'oauth_token_secret' in request.session.keys() and 'session' in request.session.keys():
		#	return getSessionInstagram(request)
		#else:
		params = {'redirect_uri': 'http://127.0.0.1:8000/tumblrSandbox/getSessionInstagram',
	          'response_type': 'code',
	          'client_id': '3cc0c367787843d4a97d8c59cfc9b208',
	          'scope': 'likes comments'}
		authorize_url = instagram.get_authorize_url(**params)
	return redirect(authorize_url)


@csrf_exempt
def getSessionTumblr(request):
	#check if user already has verified token if not do:
	if 'tumblr_session'  not in request.session.keys():
		request.session['tumblr_session'] = tumblr.get_auth_session(request.session['tumblr_oauth_token'], request.session['tumblr_oauth_token_secret'], data={'oauth_verifier':request.GET.get('oauth_verifier')})
	#else:
		#
	#options = {'type': 'photo', 'source': 'http://img2.wikia.nocookie.net/__cb20120427202836/gameofthrones/images/7/78/House_Stark_sigil.jpg'}
	#post = request.session['session'].post('http://api.tumblr.com/v2/blog/thisisawesome192734.tumblr.com/post', data=options)
	options = {'base-hostname': 'macdrew.tumblr.com'}
	followers = request.session['session'].get('http://api.tumblr.com/v2/blog/macdrew.tumblr.com/followers', data=options)
	post_options = {'base-hostname': 'macdrew.tumblr.com', 'reblog_info': 'true', 'notes_info': 'true'}
	posts = request.session['session'].get('http://api.tumblr.com/v2/blog/macdrew.tumblr.com/posts?api_key=zLZDEzKfKaxtlMeFnG1dXrZ4jlo1pFZuDZRLQGR7izKBHB7DeJ', params=post_options)
	info_options = {'base-hostname': 'macdrew.tumblr.com'}
	info = request.session['session'].get('http://api.tumblr.com/v2/blog/macdrew.tumblr.com/info?api_key=zLZDEzKfKaxtlMeFnG1dXrZ4jlo1pFZuDZRLQGR7izKBHB7DeJ', data=options)
	context = {'followers':json.loads(followers.text), 'posts':json.loads(posts.text), 'info':json.loads(info.text)}
	post_info = []
	blog_info = {}
	followers_info = {}
	reblogs = 0
	for post in context['posts']['response']['posts']:
		reblogs = 0
		likes = 0
		answers = 0
		posted = False
		src = ''
		if 'photos' in post:
			src = post['photos'][0]['original_size']['url']
		if 'notes' in post:
			for note in post['notes']:
				if note['type'] == "reblog":
					reblogs = reblogs +1
				if note['type'] =="like":
					likes = likes + 1
				if note['type'] == "answer":
					answers = answers + 1
				if note['type'] == "posted":
					posted = True
		post_info.append({'reblogs': reblogs, 'likes': likes, 'answers': answers, 'posted': posted, 'src': src})
	context2 = {'posts':post_info}
	#postsReblogs = get from posts
	#postsLikes = get from posts
	return render(request, 'tumblrSandbox/getSession.html', context2)
	#return HttpResponse(status=201)

@csrf_exempt
def getSessionTwitter(request):
	if 'twitter_session' not in request.session.keys():
		request.session['twitter_session'] = twitter.get_auth_session(request.session['twitter_oauth_token'], request.session['twitter_oauth_token_secret'], data={'oauth_verifier':request.GET.get('oauth_verifier')})
	#else:
		#should already be authenticated
	search_query = {'q':request.session['twitter_search'] + ' filter:' + request.session['twitter_mediatype'] + " lang:en"}
	search_results = request.session['session'].get('https://api.twitter.com/1.1/search/tweets.json', params=search_query)
	search_results = json.loads(search_results.text)
	tweets = []
	for tweet in search_results['statuses']:
		print tweet
		if request.session['twitter_mediatype'] == 'images':
			if 'media' in tweet['entities'].keys():
				if len(tweet['entities']['media']) > 0:
					media_url = tweet['entities']['media'][0]['media_url_https']
			else:
				media_url = ""
			if len(tweet['entities']['urls']) > 0:
				url = tweet['entities']['urls'][0]['url']
			tweets.append({'text': tweet['text'], 'url': media_url, 'id_str': tweet['user']['id_str'], 'screen_name': tweet['user']['screen_name']  }) #hashtags retweet_count id
		elif request.session['twitter_mediatype'] == 'news':
			tweets.append({'text': tweet['text']})
	context = {'tweets': tweets}
	return render(request, 'tumblrSandbox/getSessionTwitter.html', context)

def postToTwitter(request):
	options = {'status': 'Post Succesful'}
	post = request.session['session'].post('https://api.twitter.com/1.1/statuses/update.json', data=options)
	tweet_info = []
	user_info = request.session['session'].get('https://api.twitter.com/1.1/account/verify_credentials.json', params={})
	user_info_json = json.loads(user_info.text)
	user_timeline = request.session['session'].get('https://api.twitter.com/1.1/statuses/user_timeline.json', params={'screen_name': user_info_json['screen_name'] })
	user_timeline = json.loads(user_timeline.text)
	for tweet in user_timeline: 
		tweet_info.append({'retweets': tweet['retweet_count'], 'favorites': tweet['favorite_count'], 'text':tweet['text']})
	context={'user_info_followers': user_info_json['followers_count'], 'user_info_friends': user_info_json['friends_count'],'user_info_statuses': user_info_json['statuses_count'], 'user_timeline':user_timeline, 'tweet_info': tweet_info }
	return render(request, 'tumblrSandbox/getSessionTwitter.html', context)

def mentionUser(request):
	#status = request.session['session'].post("https://api.twitter.com/1.1/direct_messages/new.json", data={'screen_name': 'andrewthreethou', 'text': request.GET.get('text')})
	options = {'status': request.GET.get('text')}
	post = request.session['session'].post('https://api.twitter.com/1.1/statuses/update.json', data=options)
	import pdb; pdb.set_trace(); #	
	status = json.loads(post.text)
	context = {'status': status}
	return HttpResponse(json.dumps(context), content_type="application/json")

@csrf_exempt
def getSessionInstagram(request):
	data = {'code': request.GET['code'],
	        'grant_type': 'authorization_code',
	        'redirect_uri': 'http://127.0.0.1:8000/tumblrSandbox/getSessionInstagram'}
	session = instagram.get_auth_session(data=data, decoder=json.loads)
	tags = session.get('https://api.instagram.com/v1/tags/search', params={'format': 'json','q':request.session['instagram_search'], 'access_token':session.access_token})
	tags = tags.json()
	tag_info = []
	for tag in tags['data']:
		tag_info.append({'media_count': tag['media_count'], 'name': tag['name'], 'url': 'https://api.instagram.com/v1/tags/'+tag['name']+'/media/recent?client_id=3cc0c367787843d4a97d8c59cfc9b208'})
	context = {'tag_info': tag_info}
	return render(request, 'tumblrSandbox/getSessionInstagram.html', context)

def getImagesByTag(request):
	media = requests.get("https://api.instagram.com/v1/tags/"+request.GET.get('tag')+"/media/recent", params={'client_id': "3cc0c367787843d4a97d8c59cfc9b208"})
	media = json.loads(media.text)
	posts = []
	#nextLink = media['pagination']['next_url']
	for post in media['data']:
		if 'caption' in post.keys():
			cap = post['caption']['text']
		else:
			cap = 'No caption'
		posts.append({'tags': post['tags'], 'link':post['link'], 'likes':post['likes']['count'], 'url': post['images']['standard_resolution']['url'], 'username': post['user']['username'], 'caption': cap }) 
	context = {'posts': posts,} # 'nextLink': nextLink
	return HttpResponse(json.dumps(context), content_type="application/json")

def commentIG(request):
	options = {'access_token': request.session['token'], 'text':request.GET.get('text')}
	status = request.session['session'].post('https://api.instagram.com/v1/media/'+request.GET.get('media_id')+'/comments', data=options)
	return HttpResponse(json.dumps(status.text), content_type="application/json")

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

def requester(requestKeyword, session, options):
	toEndpoint = {'tweets_twitter': 'https://api.twitter.com/1.1/search/tweets.json', 'mentions_twitter': 'https://api.twitter.com/1.1/statuses/mentions_timeline.json' , 'post_twitter': 'https://api.twitter.com/1.1/statuses/update.json', 'media_instagram': 'https://api.instagram.com/v1/tags/snow/media/recent?access_token=ACCESS-TOKEN', 'tags_instagram': 'https://api.instagram.com/v1/tags/search?q=snowy&access_token=ACCESS-TOKEN', 'comment_instagram': 'https://api.instagram.com/v1/media/{media-id}/comments'}
	if requestKeyword != 'post_twitter' or requestKeyword != 'comment_instagram':
		json = session.get(toEndpoint[requestKeyword], options)
	else:
		json = session.post(toEndpoint[requestKeyword], options)
	return jsonToModel(json, requestKeyword);

def jsonToModel(json, requestKeyword):
	#twitter
	#tweet_info.append({'retweets': tweet['retweet_count'], 'favorites': tweet['favorite_count'], 'text':tweet['text']}) #need link to tweet and username
	twitterModel= {
		'favorites': json['favorite_count'],
		'text': json['text'],
		'link': 'required',
		'image_url': json['entities']['media'][0]['media_url_https'],
		'social_network': 'twitter',
		'username': 'required',
		'retweets': json['retweet_count'],
		'tags': json['hashtags'] 
		}#returns an array that still needs to br proccessed

	#instagram	#posts.append({'tags': post['tags'], 'link':post['link'], 'likes':post['likes']['count'], 'url': post['images']['standard_resolution']['url'], 'username': post['user']['username'], 'caption': cap }) 
	instagramToModel = {
		'favorites': json['likes']['count'],
		'text': json['caption']['text'] or 'no caption',
		'link': json['link'],
		'image_url': json['images']['standard_resolution']['url'],
		'social_network': 'instagram',
		'username': json['user']['username'],
		'retweets': 'optionaltwitter',
		'tags': json['tags'], 
		}
	if "_twitter" in requestKeyword: 
		image = Image(twitterModel)
	elif "_instagram" in requestKeyword:
		image = Image(instagramToModel)
	pass

#def getEndPoint(network, media):
	

'''
	important or possibly useful endpoints:
	Twitter:

	Search for tweets:
	https://api.twitter.com/1.1/search/tweets.json
	Get last mentions:
	https://api.twitter.com/1.1/statuses/mentions_timeline.json
	Post a tweet:
	https://api.twitter.com/1.1/statuses/update.json

	Instagram:
	Get latest media with a certain tag:
	https://api.instagram.com/v1/tags/snow/media/recent?access_token=ACCESS-TOKEN
	Search for tags:
	https://api.instagram.com/v1/tags/search?q=snowy&access_token=ACCESS-TOKEN
	Comment:
    https://api.instagram.com/v1/media/{media-id}/comments 'text=This+is+my+comment'

	twitter to model dictionary:
	favorites = likes
	status = text
	url = link
	media_url = image_url
	social_network = twitter
	username = username
	retweets = retweets
	hashtags = tags

	instragram to model dictionary:
	likes = likes
	caption = text
	url = link



	model:
	favorites/likes = required
	text/caption = required
	link = required
	image_url = required
	social_network = required
	username = required
	retweets = optional twitter
	tags = optional 


	"hashtags": [
          {
            "text": "FreeBandNames",
def getQueue():
	queue = request.session['session'].post('http://api.tumblr.com/v2/blog/'+request.session['blog_url']+'/posts/queue', '')
	import pdb; pdb.set_trace();
	return queue.json()
'''

