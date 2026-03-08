from django.urls import path
from .views import SubjectListCreateView

urlpatterns = [
    path('', SubjectListCreateView.as_view()),
]