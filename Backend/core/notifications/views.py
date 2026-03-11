from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Lấy danh sách thông báo của user hiện tại"""
        notifications = Notification.objects.filter(
            recipient=request.user
        ).order_by('-created_at')[:20]  # Giới hạn 20 thông báo mới nhất
        
        serializer = NotificationSerializer(notifications, many=True)
        
        # Đếm số thông báo chưa đọc
        unread_count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()
        
        return Response({
            'notifications': serializer.data,
            'unread_count': unread_count
        })


class NotificationMarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, notification_id):
        """Đánh dấu một thông báo là đã đọc"""
        notification = get_object_or_404(
            Notification, 
            id=notification_id, 
            recipient=request.user
        )
        notification.is_read = True
        notification.save()
        
        return Response({'status': 'success'})


class NotificationMarkAllReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Đánh dấu tất cả thông báo là đã đọc"""
        Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(is_read=True)
        
        return Response({'status': 'success'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_notification(request):
    """Tạo thông báo mới (dùng cho system)"""
    if not request.user.is_staff and request.user.role != 'teacher':
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    data = request.data
    recipient_ids = data.get('recipient_ids', [])
    
    for recipient_id in recipient_ids:
        Notification.objects.create(
            recipient_id=recipient_id,
            title=data['title'],
            message=data['message'],
            notification_type=data.get('type', 'system')
        )
    
    return Response({'status': 'success'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def notification_count(request):
    """Lấy số lượng thông báo chưa đọc"""
    count = Notification.objects.filter(
        recipient=request.user,
        is_read=False
    ).count()
    
    return Response({'count': count})
