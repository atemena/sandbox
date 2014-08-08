from django.db import models

ACCOUNT_TYPE_CHOICES = (
	(0,'checking'),
	(1,'saving')
)
class Customer(models.Model):
	name = models.CharField(max_length=32, blank=True)
	uri = models.CharField(max_length=255, unique=True)
	address=models.CharField(max_length=320, blank=True) 
	business_name=models.CharField(max_length=32, blank=True)
	created_at=models.DateTimeField()  
	dob=models.CharField(max_length=16, blank=True) #string or datetime????
	email=models.CharField(max_length=32, blank=True) 
	facebook=models.CharField(max_length=255, blank=True) 
	is_identity_verified=models.BooleanField()
	meta=models.TextField()  
	phone=models.CharField(max_length=32, blank=True)
	twitter=models.CharField(max_length=255, blank=True) 

class BankAccount(models.Model):
	account_last_four= models.IntegerField()
	bank_name=models.CharField(max_length=16, blank=True) 
	can_debit=models.BooleanField()
	created_at=models.DateTimeField() 
	customer=models.ForeignKey(Customer) 
	fingerprint=models.CharField(max_length=70)#used to check for duplicates 
	name=models.CharField(max_length=40) 
	routing_number=models.CharField(max_length=9)
	account_type=models.IntegerField(choices = ACCOUNT_TYPE_CHOICES) 
	uri=models.CharField(max_length=70, null=True,blank=True)



class CreditCard(models.Model):
	brand=models.CharField(max_length=32) 
	card_type=models.CharField(max_length=32) 
	country_code=models.IntegerField(blank=True, null=True)
	created_at=models.DateTimeField() 
	customer=models.ForeignKey(Customer) 
	expiration_month=models.IntegerField()
	expiration_year=models.IntegerField()  
	hash=models.CharField(max_length=100)#used to check for duplicates
	is_valid=models.BooleanField()  
	is_verified=models.BooleanField() 
	last_four=models.IntegerField()   
	meta=models.TextField()
	name=models.CharField(max_length=32, blank=True) 
	postal_code=models.IntegerField(blank=True,null=True) 
	postal_code_check=models.CharField(max_length=16) 
	security_code_check=models.CharField(max_length=16) 
	address=models.CharField(max_length=320, blank=True)
	uri=models.CharField(max_length=128)

class Transaction(models.Model):
	customer=models.ForeignKey(Customer)
	amount=models.IntegerField()
	date_first_transacted=models.DateTimeField() 
	transaction_type=models.IntegerField() #choice between bank account and card?
	soft_descriptor=models.CharField(max_length=14)
	description=models.TextField()

class RecurringTransaction(Transaction):
	last_transaction = models.DateTimeField()
	date_to_charge= models.IntegerField() 

