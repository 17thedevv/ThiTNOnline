import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from submissions.models import Submission
from exams.models import Exam

print("Checking submission ID 1:")

try:
    submission = Submission.objects.get(id=1)
    print(f"Submission ID: {submission.id}")
    print(f"Exam ID: {submission.exam.id}")
    print(f"Student: {submission.student.username}")
    print(f"Score: {submission.score}")
    print(f"Submitted at: {submission.submitted_at}")
    
    exam = submission.exam
    print(f"Exam title: {exam.title}")
    print(f"Exam class: {exam.exam_class}")
    print(f"Exam class ID: {exam.exam_class.id if exam.exam_class else 'None'}")
    
except Submission.DoesNotExist:
    print("Submission ID 1 does not exist")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
