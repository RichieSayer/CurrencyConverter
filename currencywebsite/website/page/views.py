from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.

def home(request):
    return render(request, 'page/home.html')

def products(request):
    return render(request, 'page/products.html')