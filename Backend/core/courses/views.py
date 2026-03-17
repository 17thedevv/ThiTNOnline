from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum, Count, Q
from django.utils import timezone

from .models import Course, Lesson, CourseResource, CourseEnrollment, LessonProgress
from .serializers import (
    CourseListSerializer, CourseDetailSerializer, CourseCreateUpdateSerializer,
    LessonSerializer, CourseEnrollmentSerializer, LessonProgressSerializer
)


class CourseViewSet(viewsets.ModelViewSet):
    """ViewSet cho khóa học"""
    
    queryset = Course.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        """Chọn serializer phù hợp"""
        if self.action in ['create', 'update', 'partial_update']:
            return CourseCreateUpdateSerializer
        elif self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseListSerializer
    
    def get_queryset(self):
        """Lọc danh sách khóa học"""
        queryset = Course.objects.all()
        
        # Chỉ hiển thị khóa học đã xuất bản cho người dùng thường
        user = self.request.user
        if user and hasattr(user, 'role'):
            if user.role != 'admin':
                queryset = queryset.filter(is_published=True)
        
        # Lọc theo featured
        featured = self.request.query_params.get('featured')
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
        
        # Lọc theo độ khó
        difficulty = self.request.query_params.get('difficulty')
        if difficulty:
            queryset = queryset.filter(difficulty_level=difficulty)
        
        # Lọc theo miễn phí/trả phí
        free_only = self.request.query_params.get('free_only')
        if free_only == 'true':
            queryset = queryset.filter(is_free=True)
        
        # Tìm kiếm
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search)
            )
        
        return queryset.distinct()
    
    def perform_create(self, serializer):
        """Gán người tạo khi tạo khóa học"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        """Đăng ký khóa học"""
        course = self.get_object()
        user = request.user
        
        # Kiểm tra đã đăng ký chưa
        if CourseEnrollment.objects.filter(course=course, student=user).exists():
            return Response(
                {'detail': 'Bạn đã đăng ký khóa học này'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Tạo đăng ký mới
        enrollment = CourseEnrollment.objects.create(
            course=course,
            student=user,
            total_lessons=course.lessons.filter(is_published=True).count()
        )
        
        # Cập nhật số lượt đăng ký
        course.enrollment_count += 1
        course.save()
        
        serializer = CourseEnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'], permission_classes=[permissions.IsAuthenticated])
    def unenroll(self, request, pk=None):
        """Hủy đăng ký khóa học"""
        course = self.get_object()
        user = request.user
        
        try:
            enrollment = CourseEnrollment.objects.get(course=course, student=user)
            enrollment.delete()
            
            # Cập nhật số lượt đăng ký
            course.enrollment_count = max(0, course.enrollment_count - 1)
            course.save()
            
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CourseEnrollment.DoesNotExist:
            return Response(
                {'detail': 'Bạn chưa đăng ký khóa học này'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def progress(self, request, pk=None):
        """Lấy tiến độ học của user"""
        course = self.get_object()
        user = request.user
        
        try:
            enrollment = CourseEnrollment.objects.get(course=course, student=user)
            return Response({
                'progress_percentage': enrollment.progress_percentage,
                'completed_lessons': enrollment.completed_lessons,
                'total_lessons': enrollment.total_lessons,
                'is_completed': enrollment.is_completed,
                'lesson_progress': LessonProgressSerializer(
                    enrollment.lesson_progress.all(), many=True
                ).data
            })
        except CourseEnrollment.DoesNotExist:
            return Response(
                {'detail': 'Bạn chưa đăng ký khóa học này'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def mark_lesson_complete(self, request, pk=None):
        """Đánh dấu hoàn thành bài học"""
        course = self.get_object()
        user = request.user
        lesson_id = request.data.get('lesson_id')
        
        if not lesson_id:
            return Response(
                {'detail': 'Vui lòng cung cấp lesson_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Lấy enrollment
            enrollment = CourseEnrollment.objects.get(course=course, student=user)
            
            # Lấy lesson
            lesson = Lesson.objects.get(id=lesson_id, course=course)
            
            # Tạo hoặc cập nhật progress
            lesson_progress, created = LessonProgress.objects.get_or_create(
                enrollment=enrollment,
                lesson=lesson,
                defaults={
                    'is_completed': True,
                    'completed_at': timezone.now()
                }
            )
            
            if not lesson_progress.is_completed:
                lesson_progress.is_completed = True
                lesson_progress.completed_at = timezone.now()
                lesson_progress.save()
            
            # Cập nhật tiến độ tổng thể
            self._update_enrollment_progress(enrollment)
            
            return Response({'status': 'success'})
            
        except (CourseEnrollment.DoesNotExist, Lesson.DoesNotExist):
            return Response(
                {'detail': 'Không tìm thấy khóa học hoặc bài học'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def _update_enrollment_progress(self, enrollment):
        """Cập nhật tiến độ enrollment"""
        completed_lessons = enrollment.lesson_progress.filter(is_completed=True).count()
        total_lessons = enrollment.course.lessons.filter(is_published=True).count()
        
        enrollment.completed_lessons = completed_lessons
        enrollment.total_lessons = total_lessons
        enrollment.progress_percentage = int((completed_lessons / total_lessons * 100)) if total_lessons > 0 else 0
        enrollment.last_accessed_at = timezone.now()
        
        # Đánh dấu hoàn thành nếu học hết
        if completed_lessons == total_lessons and total_lessons > 0:
            enrollment.is_completed = True
            enrollment.completed_at = timezone.now()
            # Cập nhật số lượt hoàn thành của course
            enrollment.course.completion_count += 1
            enrollment.course.save()
        
        enrollment.save()


class LessonViewSet(viewsets.ModelViewSet):
    """ViewSet cho bài học"""
    
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Lấy bài học của khóa học"""
        course_id = self.request.query_params.get('course_id')
        if course_id:
            return Lesson.objects.filter(course_id=course_id)
        return Lesson.objects.all()
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def resources(self, request, pk=None):
        """Lấy tài liệu của bài học"""
        lesson = self.get_object()
        resources = lesson.resources.all()
        return Response(CourseResourceSerializer(resources, many=True).data)


class CourseEnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet cho đăng ký khóa học"""
    
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Lấy danh sách đăng ký của user hoặc tất cả (admin)"""
        user = self.request.user
        
        if hasattr(user, 'role') and user.role == 'admin':
            # Admin thấy tất cả
            course_id = self.request.query_params.get('course_id')
            if course_id:
                return CourseEnrollment.objects.filter(course_id=course_id)
            return CourseEnrollment.objects.all()
        else:
            # User thường chỉ thấy của mình
            return CourseEnrollment.objects.filter(student=user)


class MyCoursesView(generics.ListAPIView):
    """API lấy danh sách khóa học của user"""
    
    serializer_class = CourseListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Lấy khóa học user đã đăng ký"""
        user = self.request.user
        enrolled_course_ids = CourseEnrollment.objects.filter(
            student=user, 
            is_active=True
        ).values_list('course_id', flat=True)
        
        return Course.objects.filter(id__in=enrolled_course_ids, is_published=True)


class FeaturedCoursesView(generics.ListAPIView):
    """API lấy danh sách khóa học nổi bật"""
    
    serializer_class = CourseListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        """Lấy khóa học nổi bật đã xuất bản"""
        return Course.objects.filter(
            is_featured=True, 
            is_published=True
        ).order_by('-enrollment_count')
