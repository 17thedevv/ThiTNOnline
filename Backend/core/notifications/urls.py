from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('count/', views.notification_count, name='notification-count'),
    path('<int:notification_id>/mark-read/', views.NotificationMarkReadView.as_view(), name='mark-read'),
    path('mark-all-read/', views.NotificationMarkAllReadView.as_view(), name='mark-all-read'),
    path('create/', views.create_notification, name='create-notification'),
]
