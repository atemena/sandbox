from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from balancedSandbox.models import *
import balanced
import datetime


def index(request):
	context={}
	return render(request, 'balancedSandbox/index.html', context)

@csrf_exempt
def createCard(request):
	# configure api key: https://dashboard.balancedpayments.com/#/start
	balanced.configure('ak-test-1k3ToGXhUzsAVWnjlUbLelZv92kMLQAwF')
	#create a new balanced customer
	customer = balanced.Customer().save()
	if request.POST.get('submit') == 'cc':
		#get tokenized card and save to customer
		customer.add_card(request.POST.get('uri'))
		c = Customer(name='', uri=customer.uri,created_at=datetime.datetime.now())
		c.save()
		#debit customer
		trans=customer.debit(amount=5000, appears_on_statement_as='test', description='test description')
	elif request.POST.get('submit') == 'ba':
		#get tokenized bank account  and create a verification
		bank_account = balanced.BankAccount.find(request.POST.get('uri'))
		customer.add_bank_account(bank_account)
		verification = bank_account.verify()
		#TODO: Bring to a new form where customer inputs the amounts deposited into their account
		#get customers verification amounts and verify with verify.save()
		verification.amount_1 = 1
		verification.amount_2 = 1
		verified = verification.save()
		#create new customer and debit if verified
		c = Customer(name='', uri=customer.uri,created_at=datetime.datetime.now())
		c.save()
		if verified.state == 'verified':
			trans = customer.debit(amount=1000)
	if request.POST.get('recurring') == 'true' and trans.status == 'succeeded':
		r = RecurringTransaction(customer=c,
			amount=5000,
			date_first_transacted=datetime.datetime.now(), 
			transaction_type=1, #choice between bank account and card?
			soft_descriptor="test",
			description="test description",
			last_transaction = datetime.datetime.now(),
			date_to_charge= datetime.datetime.now().day, 
		)
		r.save()
	elif request.POST.get('recurring') == 'false' and trans.status == 'succeeded':
		t = Transaction(customer=c,
			amount=5000,
			date_first_transacted=datetime.datetime.now(), 
			transaction_type=1, #choice between bank account and card?
			soft_descriptor="test",
			description="test description",
		)
		t.save()
	else:
		HttpResponse(status=400)
	return HttpResponse(status=201)






	#djangocron or billy
	#create models for transactions and customers and maybe cards with last 4 digits?