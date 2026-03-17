from django.db import models
from django.conf import settings


class Course(models.Model):
    """Mô hình khóa học - chứa nội dung học tập, bài giảng, tài liệu"""
    
    title = models.CharField(max_length=255, verbose_name="Tên khóa học")
    description = models.TextField(verbose_name="Mô tả khóa học")
    thumbnail = models.ImageField(
        upload_to='course_thumbnails/', 
        null=True, 
        blank=True, 
        verbose_name="Ảnh thumbnail"
    )
    
    # Thông tin cơ bản
    duration_hours = models.IntegerField(
        default=0, 
        verbose_name="Thời lượng (giờ)"
    )
    difficulty_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Cơ bản'),
            ('intermediate', 'Trung bình'),
            ('advanced', 'Nâng cao')
        ],
        default='beginner',
        verbose_name="Cấp độ khó"
    )
    
    # Giá cả (nếu có)
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.00,
        verbose_name="Giá khóa học"
    )
    is_free = models.BooleanField(
        default=True, 
        verbose_name="Miễn phí"
    )
    
    # Trạng thái
    is_published = models.BooleanField(
        default=False, 
        verbose_name="Đã xuất bản"
    )
    is_featured = models.BooleanField(
        default=False, 
        verbose_name="Nổi bật"
    )
    
    # Metadata
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="Người tạo"
    )
    created_at = models.DateTimeField(
        auto_now_add=True, 
        verbose_name="Ngày tạo"
    )
    updated_at = models.DateTimeField(
        auto_now=True, 
        verbose_name="Cập nhật lần cuối"
    )
    
    # Thống kê
    enrollment_count = models.IntegerField(
        default=0, 
        verbose_name="Số lượt đăng ký"
    )
    completion_count = models.IntegerField(
        default=0, 
        verbose_name="Số lượt hoàn thành"
    )
    
    class Meta:
        verbose_name = "Khóa học"
        verbose_name_plural = "Các khóa học"
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class Lesson(models.Model):
    """Bài học trong một khóa học"""
    
    course = models.ForeignKey(
        Course, 
        on_delete=models.CASCADE, 
        related_name='lessons',
        verbose_name="Khóa học"
    )
    
    title = models.CharField(
        max_length=255, 
        verbose_name="Tiêu đề bài học"
    )
    content = models.TextField(
        verbose_name="Nội dung bài học"
    )
    video_url = models.URLField(
        null=True, 
        blank=True, 
        verbose_name="Link video"
    )
    video_file = models.FileField(
        upload_to='lesson_videos/', 
        null=True, 
        blank=True,
        verbose_name="File video"
    )
    
    # Thứ tự trong khóa học
    order = models.IntegerField(
        default=0, 
        verbose_name="Thứ tự"
    )
    
    # Thời lượng
    duration_minutes = models.IntegerField(
        default=0, 
        verbose_name="Thời lượng (phút)"
    )
    
    # Trạng thái
    is_published = models.BooleanField(
        default=False, 
        verbose_name="Đã xuất bản"
    )
    is_free_preview = models.BooleanField(
        default=False, 
        verbose_name="Xem thử miễn phí"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        auto_now=True
    )
    
    class Meta:
        verbose_name = "Bài học"
        verbose_name_plural = "Các bài học"
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"


class CourseResource(models.Model):
    """Tài liệu đính kèm cho bài học"""
    
    lesson = models.ForeignKey(
        Lesson, 
        on_delete=models.CASCADE, 
        related_name='resources',
        verbose_name="Bài học"
    )
    
    title = models.CharField(
        max_length=255, 
        verbose_name="Tên tài liệu"
    )
    file = models.FileField(
        upload_to='course_resources/', 
        verbose_name="File tài liệu"
    )
    file_type = models.CharField(
        max_length=50,
        choices=[
            ('pdf', 'PDF'),
            ('doc', 'Word Document'),
            ('ppt', 'PowerPoint'),
            ('img', 'Image'),
            ('other', 'Other')
        ],
        default='other',
        verbose_name="Loại file"
    )
    file_size = models.IntegerField(
        default=0, 
        verbose_name="Kích thước (bytes)"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    
    class Meta:
        verbose_name = "Tài liệu khóa học"
        verbose_name_plural = "Các tài liệu khóa học"
    
    def __str__(self):
        return f"{self.lesson.title} - {self.title}"


class CourseEnrollment(models.Model):
    """Đăng ký khóa học"""
    
    course = models.ForeignKey(
        Course, 
        on_delete=models.CASCADE, 
        related_name='enrollments',
        verbose_name="Khóa học"
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='course_enrollments',
        verbose_name="Học sinh"
    )
    
    # Trạng thái đăng ký
    is_active = models.BooleanField(
        default=True, 
        verbose_name="Đang học"
    )
    is_completed = models.BooleanField(
        default=False, 
        verbose_name="Đã hoàn thành"
    )
    
    # Tiến độ
    progress_percentage = models.IntegerField(
        default=0, 
        verbose_name="Tiến độ (%)"
    )
    completed_lessons = models.IntegerField(
        default=0, 
        verbose_name="Số bài đã hoàn thành"
    )
    total_lessons = models.IntegerField(
        default=0, 
        verbose_name="Tổng số bài"
    )
    
    # Thời gian
    enrolled_at = models.DateTimeField(
        auto_now_add=True, 
        verbose_name="Ngày đăng ký"
    )
    completed_at = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name="Ngày hoàn thành"
    )
    last_accessed_at = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name="Truy cập lần cuối"
    )
    
    class Meta:
        verbose_name = "Đăng ký khóa học"
        verbose_name_plural = "Các đăng ký khóa học"
        unique_together = ['course', 'student']
    
    def __str__(self):
        return f"{self.student.username} - {self.course.title}"


class LessonProgress(models.Model):
    """Tiến độ học từng bài"""
    
    enrollment = models.ForeignKey(
        CourseEnrollment, 
        on_delete=models.CASCADE, 
        related_name='lesson_progress',
        verbose_name="Đăng ký khóa học"
    )
    lesson = models.ForeignKey(
        Lesson, 
        on_delete=models.CASCADE, 
        related_name='progress',
        verbose_name="Bài học"
    )
    
    is_completed = models.BooleanField(
        default=False, 
        verbose_name="Đã hoàn thành"
    )
    completion_time = models.IntegerField(
        default=0, 
        verbose_name="Thời gian hoàn thành (phút)"
    )
    
    completed_at = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name="Ngày hoàn thành"
    )
    last_accessed_at = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name="Truy cập lần cuối"
    )
    
    class Meta:
        verbose_name = "Tiến độ bài học"
        verbose_name_plural = "Các tiến độ bài học"
        unique_together = ['enrollment', 'lesson']
    
    def __str__(self):
        return f"{self.enrollment.student.username} - {self.lesson.title}"
