from django_cron import CronJobBase, Schedule
import balanced
import datetime
from balancedSandbox.models import *



class MyCronJob(CronJobBase):
    RUN_EVERY_MINS = 60*24 # everyday

    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'balancedSandbox.cron-payments.MyCronJob'    # a unique code

    def do(self):
    	balanced.configure('ak-test-LgwABu1X3Lz1oi1pFbyL8dxkd62hFMYq')
    	#get all transactions 
        #import pdb; pdb.set_trace();
        today= datetime.datetime.now().day
        tomorrow= datetime.datetime.now() + datetime.timedelta(days=1)
        if tomorrow.day == 1:
            RecurringTransactions = RecurringTransaction.objects.filter(date_to_charge__gte = today).filter( last_transaction__lt=datetime.datetime.now())
        else:
            RecurringTransactions = RecurringTransaction.objects.filter(date_to_charge =today).filter(last_transaction__lt=datetime.datetime.now())
    	for transaction in RecurringTransactions:
            customerToCharge = balanced.Customer.find(transaction.customer.uri)
            customerToCharge.debit(transaction.amount)
            #change soft descriptor
            transaction.last_transaction = datetime.datetime.now()
            transaction.save()
            print('charged '+ transaction.customer.name )
        pass    # do your thing here

        