from .models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()


def create_notification(recipients, title, message, notification_type='system', exam=None, class_obj=None):
    """
    Tạo thông báo cho nhiều người nhận
    
    Args:
        recipients: List of User objects hoặc user IDs
        title: Tiêu đề thông báo
        message: Nội dung thông báo
        notification_type: Loại thông báo (exam_new, class_new, exam_result, class_joined, system)
        exam: Exam object (optional)
        class_obj: Class object (optional)
    """
    notifications = []
    
    for recipient in recipients:
        # Nếu là ID, lấy User object
        if isinstance(recipient, int):
            try:
                recipient = User.objects.get(id=recipient)
            except User.DoesNotExist:
                continue
        
        notification = Notification.objects.create(
            recipient=recipient,
            title=title,
            message=message,
            notification_type=notification_type,
            exam=exam,
            class_obj=class_obj
        )
        notifications.append(notification)
    
    return notifications


def create_exam_notification(exam, class_students=None):
    """
    Tạo thông báo khi có bài kiểm tra mới
    
    Args:
        exam: Exam object
        class_students: List of Student objects (optional, sẽ lấy từ exam.exam_class nếu không cung cấp)
    """
    if class_students is None and exam.exam_class:
        class_students = exam.exam_class.students.all()
    
    if not class_students:
        return []
    
    title = f"Bài kiểm tra mới: {exam.title}"
    message = f"Lớp {exam.exam_class.name} vừa đăng bài kiểm tra '{exam.title}'. Thời gian làm bài: {exam.duration} phút."
    
    return create_notification(
        recipients=class_students,
        title=title,
        message=message,
        notification_type='exam_new',
        exam=exam
    )


def create_class_notification(class_obj, new_students=None):
    """
    Tạo thông báo khi có học sinh mới tham gia lớp
    
    Args:
        class_obj: Class object
        new_students: List of Student objects vừa tham gia
    """
    if not new_students:
        return []
    
    title = f"Đã tham gia lớp mới"
    message = f"Bạn đã được thêm vào lớp {class_obj.name}."
    
    return create_notification(
        recipients=new_students,
        title=title,
        message=message,
        notification_type='class_joined',
        class_obj=class_obj
    )


def create_result_notification(exam, student, score=None):
    """
    Tạo thông báo khi có kết quả bài thi
    
    Args:
        exam: Exam object
        student: Student object
        score: Điểm số (optional)
    """
    title = f"Kết quả bài thi: {exam.title}"
    
    if score is not None:
        message = f"Kết quả bài thi '{exam.title}' đã có. Điểm của bạn: {score}/{exam.questions.count() * 1}."
    else:
        message = f"Kết quả bài thi '{exam.title}' đã được công bố."
    
    return create_notification(
        recipients=[student],
        title=title,
        message=message,
        notification_type='exam_result',
        exam=exam
    )
