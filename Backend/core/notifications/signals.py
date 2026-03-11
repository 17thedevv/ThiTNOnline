from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Notification
from .utils import create_exam_notification
from exams.models import Exam
from submissions.models import Submission


@receiver(post_save, sender=Exam)
def exam_created_notification(sender, instance, created, **kwargs):
    """
    Tự động tạo thông báo khi có bài kiểm tra mới được tạo
    """
    if created:
        # Tạo thông báo cho tất cả học sinh trong lớp
        create_exam_notification(instance)


@receiver(post_save, sender=Submission)
def submission_completed_notification(sender, instance, created, **kwargs):
    """
    Tự động tạo thông báo khi học sinh nộp bài (cho teacher)
    """
    if created and instance.exam.created_by:
        # Thông báo cho giáo viên ra đề
        from .utils import create_notification
        
        title = f"Học sinh đã nộp bài"
        message = f"{instance.student.username} vừa nộp bài thi '{instance.exam.title}'."
        
        create_notification(
            recipients=[instance.exam.created_by],
            title=title,
            message=message,
            notification_type='system'
        )
