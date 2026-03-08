from rest_framework import generics, permissions
from .models import Class
from .serializers import ClassSerializer

class ClassListCreateView(generics.ListCreateAPIView):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)
