from rest_framework import serializers
from .models import Course, Lesson, CourseResource, CourseEnrollment, LessonProgress


class CourseResourceSerializer(serializers.ModelSerializer):
    """Serializer cho tài liệu khóa học"""
    
    file_size_display = serializers.SerializerMethodField()
    
    class Meta:
        model = CourseResource
        fields = [
            'id', 'title', 'file', 'file_type', 'file_size', 
            'file_size_display', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_file_size_display(self, obj):
        """Hiển thị kích thước file dễ đọc"""
        if obj.file_size < 1024:
            return f"{obj.file_size} B"
        elif obj.file_size < 1024 * 1024:
            return f"{obj.file_size / 1024:.1f} KB"
        else:
            return f"{obj.file_size / (1024 * 1024):.1f} MB"


class LessonSerializer(serializers.ModelSerializer):
    """Serializer cho bài học"""
    
    resources = CourseResourceSerializer(many=True, read_only=True)
    duration_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'content', 'video_url', 'video_file',
            'order', 'duration_minutes', 'duration_display',
            'is_published', 'is_free_preview',
            'resources', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_duration_display(self, obj):
        """Hiển thị thời gian dễ đọc"""
        if obj.duration_minutes < 60:
            return f"{obj.duration_minutes} phút"
        else:
            hours = obj.duration_minutes // 60
            minutes = obj.duration_minutes % 60
            return f"{hours}h {minutes} phút"


class CourseListSerializer(serializers.ModelSerializer):
    """Serializer cho danh sách khóa học (gọn gàng)"""
    
    lessons_count = serializers.SerializerMethodField()
    enrollment_count_display = serializers.SerializerMethodField()
    difficulty_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'thumbnail',
            'duration_hours', 'difficulty_level', 'difficulty_display',
            'price', 'is_free', 'is_published', 'is_featured',
            'enrollment_count', 'enrollment_count_display', 'completion_count',
            'lessons_count', 'created_at'
        ]
    
    def get_lessons_count(self, obj):
        return obj.lessons.filter(is_published=True).count()
    
    def get_enrollment_count_display(self, obj):
        if obj.enrollment_count >= 1000:
            return f"{obj.enrollment_count // 1000}k+"
        return str(obj.enrollment_count)
    
    def get_difficulty_display(self, obj):
        difficulty_map = {
            'beginner': 'Cơ bản',
            'intermediate': 'Trung bình', 
            'advanced': 'Nâng cao'
        }
        return difficulty_map.get(obj.difficulty_level, obj.difficulty_level)


class CourseDetailSerializer(serializers.ModelSerializer):
    """Serializer cho chi tiết khóa học (đầy đủ)"""
    
    lessons = LessonSerializer(many=True, read_only=True)
    lessons_count = serializers.SerializerMethodField()
    total_duration = serializers.SerializerMethodField()
    difficulty_display = serializers.SerializerMethodField()
    price_display = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    user_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'thumbnail',
            'duration_hours', 'total_duration',
            'difficulty_level', 'difficulty_display',
            'price', 'price_display', 'is_free',
            'is_published', 'is_featured',
            'enrollment_count', 'completion_count',
            'lessons', 'lessons_count',
            'is_enrolled', 'user_progress',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def get_lessons_count(self, obj):
        return obj.lessons.filter(is_published=True).count()
    
    def get_total_duration(self, obj):
        """Tổng thời lượng tất cả bài học"""
        total_minutes = obj.lessons.aggregate(
            total=models.Sum('duration_minutes')
        )['total'] or 0
        
        if total_minutes < 60:
            return f"{total_minutes} phút"
        else:
            hours = total_minutes // 60
            minutes = total_minutes % 60
            return f"{hours}h {minutes} phút"
    
    def get_difficulty_display(self, obj):
        difficulty_map = {
            'beginner': 'Cơ bản',
            'intermediate': 'Trung bình', 
            'advanced': 'Nâng cao'
        }
        return difficulty_map.get(obj.difficulty_level, obj.difficulty_level)
    
    def get_price_display(self, obj):
        if obj.is_free:
            return "Miễn phí"
        return f"{obj.price:,.0f} VNĐ"
    
    def get_is_enrolled(self, obj):
        """Kiểm tra user đã đăng ký chưa"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.enrollments.filter(
                student=request.user, 
                is_active=True
            ).exists()
        return False
    
    def get_user_progress(self, obj):
        """Tiến độ của user với khóa học này"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            enrollment = obj.enrollments.filter(
                student=request.user, 
                is_active=True
            ).first()
            if enrollment:
                return {
                    'progress_percentage': enrollment.progress_percentage,
                    'completed_lessons': enrollment.completed_lessons,
                    'total_lessons': enrollment.total_lessons,
                    'is_completed': enrollment.is_completed,
                    'last_accessed_at': enrollment.last_accessed_at
                }
        return None


class CourseEnrollmentSerializer(serializers.ModelSerializer):
    """Serializer cho đăng ký khóa học"""
    
    course_title = serializers.CharField(source='course.title', read_only=True)
    student_name = serializers.SerializerMethodField()
    progress_display = serializers.SerializerMethodField()
    
    class Meta:
        model = CourseEnrollment
        fields = [
            'id', 'course', 'course_title', 'student', 'student_name',
            'is_active', 'is_completed', 'progress_percentage',
            'completed_lessons', 'total_lessons', 'progress_display',
            'enrolled_at', 'completed_at', 'last_accessed_at'
        ]
        read_only_fields = ['enrolled_at', 'completed_at', 'last_accessed_at']
    
    def get_student_name(self, obj):
        """Lấy tên đầy đủ của học sinh"""
        student = obj.student
        full_name = f"{student.first_name or ''} {student.last_name or ''}".strip()
        return full_name or student.username
    
    def get_progress_display(self, obj):
        """Hiển thị tiến độ dễ đọc"""
        if obj.is_completed:
            return "Đã hoàn thành"
        return f"{obj.progress_percentage}% ({obj.completed_lessons}/{obj.total_lessons})"


class LessonProgressSerializer(serializers.ModelSerializer):
    """Serializer cho tiến độ bài học"""
    
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    lesson_order = serializers.IntegerField(source='lesson.order', read_only=True)
    
    class Meta:
        model = LessonProgress
        fields = [
            'id', 'lesson', 'lesson_title', 'lesson_order',
            'is_completed', 'completion_time',
            'completed_at', 'last_accessed_at'
        ]
        read_only_fields = ['completed_at', 'last_accessed_at']


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer cho tạo/cập nhật khóa học"""
    
    class Meta:
        model = Course
        fields = [
            'title', 'description', 'thumbnail', 'duration_hours',
            'difficulty_level', 'price', 'is_free',
            'is_published', 'is_featured'
        ]
    
    def validate_price(self, value):
        """Giá phải >= 0"""
        if value < 0:
            raise serializers.ValidationError("Giá không thể âm")
        return value
    
    def validate(self, data):
        """Validate dữ liệu"""
        # Nếu là miễn phí thì price phải là 0
        if data.get('is_free', False) and data.get('price', 0) > 0:
            raise serializers.ValidationError({
                'price': 'Khóa học miễn phí không thể có giá > 0'
            })
        
        # Nếu có giá thì không được miễn phí
        if not data.get('is_free', True) and data.get('price', 0) == 0:
            raise serializers.ValidationError({
                'price': 'Khóa học trả phí phải có giá > 0'
            })
        
        return data
