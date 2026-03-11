import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from submissions.models import Submission
from exams.models import Exam
from classes.models import Class

print("Fixing exams without class...")

# Find exams without class
exams_without_class = Exam.objects.filter(exam_class__isnull=True)
print(f"Found {exams_without_class.count()} exams without class")

for exam in exams_without_class:
    print(f"  - Exam ID: {exam.id}, Title: {exam.title}")
    
    # Option 1: Delete orphaned submissions
    Submission.objects.filter(exam=exam).delete()
    print(f"    Deleted submissions for this exam")
    
    # Option 2: Or assign to a default class (uncomment if preferred)
    # default_class = Class.objects.first()
    # if default_class:
    #     exam.exam_class = default_class
    #     exam.save()
    #     print(f"    Assigned to class: {default_class.name}")

print("Fix completed!")
