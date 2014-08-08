from balancedSandbox.models import *
from django.contrib import admin

admin.site.register(Customer)
admin.site.register(BankAccount)
admin.site.register(CreditCard)
admin.site.register(Transaction)
admin.site.register(RecurringTransaction)