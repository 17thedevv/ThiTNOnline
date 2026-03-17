from django.contrib import admin
from .models import Course, Lesson, CourseResource, CourseEnrollment, LessonProgress


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    """Admin cho khóa học"""
    
    list_display = [
        'title', 'difficulty_level', 'duration_hours', 
        'price', 'is_free', 'is_published', 'is_featured',
        'enrollment_count', 'completion_count', 'created_at'
    ]
    list_filter = [
        'difficulty_level', 'is_free', 'is_published', 
        'is_featured', 'created_at'
    ]
    search_fields = ['title', 'description']
    list_editable = ['is_published', 'is_featured']
    readonly_fields = ['enrollment_count', 'completion_count', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Thông tin cơ bản', {
            'fields': ('title', 'description', 'thumbnail')
        }),
        ('Chi tiết khóa học', {
            'fields': ('duration_hours', 'difficulty_level', 'price', 'is_free')
        }),
        ('Trạng thái', {
            'fields': ('is_published', 'is_featured')
        }),
        ('Thống kê', {
            'fields': ('enrollment_count', 'completion_count'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def save_model(self, request, obj, form, change):
        """Gán created_by khi tạo mới"""
        if not change:  # Creating new object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    """Admin cho bài học"""
    
    list_display = [
        'title', 'course', 'order', 'duration_minutes', 
        'is_published', 'is_free_preview', 'created_at'
    ]
    list_filter = ['is_published', 'is_free_preview', 'course', 'created_at']
    search_fields = ['title', 'content', 'course__title']
    list_editable = ['is_published', 'is_free_preview']
    ordering = ['course', 'order']
    
    fieldsets = (
        ('Thông tin bài học', {
            'fields': ('course', 'title', 'content')
        }),
        ('Media', {
            'fields': ('video_url', 'video_file')
        }),
        ('Cài đặt', {
            'fields': ('order', 'duration_minutes', 'is_published', 'is_free_preview')
        }),
    )


@admin.register(CourseResource)
class CourseResourceAdmin(admin.ModelAdmin):
    """Admin cho tài liệu khóa học"""
    
    list_display = ['title', 'lesson', 'file_type', 'file_size', 'created_at']
    list_filter = ['file_type', 'lesson', 'created_at']
    search_fields = ['title', 'lesson__title']
    ordering = ['lesson', 'title']


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    """Admin cho đăng ký khóa học"""
    
    list_display = [
        'student', 'course', 'is_active', 'is_completed',
        'progress_percentage', 'enrolled_at', 'completed_at'
    ]
    list_filter = [
        'is_active', 'is_completed', 'enrolled_at', 'completed_at'
    ]
    search_fields = ['student__username', 'student__first_name', 'student__last_name', 'course__title']
    readonly_fields = ['enrolled_at', 'completed_at', 'last_accessed_at']
    
    fieldsets = (
        ('Thông tin đăng ký', {
            'fields': ('course', 'student', 'is_active')
        }),
        ('Tiến độ', {
            'fields': ('is_completed', 'progress_percentage', 'completed_lessons', 'total_lessons')
        }),
        ('Thời gian', {
            'fields': ('enrolled_at', 'completed_at', 'last_accessed_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    """Admin cho tiến độ bài học"""
    
    list_display = [
        'enrollment', 'lesson', 'is_completed', 
        'completion_time', 'completed_at', 'last_accessed_at'
    ]
    list_filter = ['is_completed', 'completed_at', 'last_accessed_at']
    search_fields = [
        'enrollment__student__username', 
        'lesson__title', 
        'enrollment__course__title'
    ]
    readonly_fields = ['completed_at', 'last_accessed_at']
    ordering = ['enrollment', 'lesson__order']
