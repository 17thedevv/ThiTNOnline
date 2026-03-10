from django.urls import path
from .views import SubmissionListView, SubmissionCreateView


urlpatterns = [
    path('', SubmissionListView.as_view(), name='submission-list'),
    path('submit/', SubmissionCreateView.as_view(), name='submission-create'),
]

