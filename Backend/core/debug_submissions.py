import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from submissions.models import Submission
from exams.models import Exam

print("Checking submissions for class ID 6:")

# Check all submissions
all_submissions = Submission.objects.all()
print(f"Total submissions: {all_submissions.count()}")

for sub in all_submissions:
    print(f"  - ID: {sub.id}, Exam: {sub.exam.id}, Class: {sub.exam.exam_class.id if sub.exam.exam_class else 'None'}, Student: {sub.student.username}")

# Check submissions specifically for class 6
class_6_submissions = Submission.objects.filter(exam__exam_class_id=6)
print(f"\nSubmissions for class 6: {class_6_submissions.count()}")

for sub in class_6_submissions:
    print(f"  - ID: {sub.id}, Exam: {sub.exam.id}, Student: {sub.student.username}")
    try:
        exam_class = sub.exam.exam_class
        print(f"    Exam class: {exam_class}")
    except Exception as e:
        print(f"    Error accessing exam class: {e}")
