from django.urls import path
from .views import ClassListCreateView

urlpatterns = [
    path('', ClassListCreateView.as_view(), name='class-list-create'),
]