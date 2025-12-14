import os
import uuid
import shutil
import cloudinary
import cloudinary.uploader
import cloudinary.api
import datetime
import traceback

from pyramid.view import view_config
from pyramid.httpexceptions import HTTPBadRequest, HTTPUnauthorized, HTTPNotFound, HTTPForbidden, HTTPInternalServerError
from pyramid.response import Response
from passlib.hash import bcrypt
from sqlalchemy.exc import DBAPIError

# Import semua model
from ..models import (
    User, Course, Module, Lesson, 
    Assignment, Submission, Enrollment, LessonCompletion
)

# [KONFIGURASI CLOUDINARY]
cloudinary.config( 
  cloud_name = "dmuphj9dt", 
  api_key = "896348251978955", 
  api_secret = "lY7rYjd9xLj61AKf7sWXosDCB8A",
  secure = True
)

# ==========================================
# 0. CORS OPTIONS HANDLER
# ==========================================
@view_config(route_name='register', request_method='OPTIONS')
@view_config(route_name='login', request_method='OPTIONS')
@view_config(route_name='api_login', request_method='OPTIONS')
@view_config(route_name='api_register', request_method='OPTIONS')
@view_config(route_name='courses', request_method='OPTIONS')
@view_config(route_name='course_detail', request_method='OPTIONS') 
@view_config(route_name='modules', request_method='OPTIONS')
@view_config(route_name='lessons', request_method='OPTIONS')
@view_config(route_name='lesson_detail', request_method='OPTIONS') 
@view_config(route_name='assignments', request_method='OPTIONS')
@view_config(route_name='assignment_detail', request_method='OPTIONS') 
@view_config(route_name='submissions', request_method='OPTIONS')
@view_config(route_name='enroll', request_method='OPTIONS')
@view_config(route_name='complete_lesson', request_method='OPTIONS')
@view_config(route_name='api_grade_submission', request_method='OPTIONS')
def options_view(request):
    return Response(body='', status=200, content_type='text/plain')

# ==========================================
# 1. USERS (Login/Register dipindah ke auth.py)
# ==========================================

# --- HAPUS BAGIAN REGISTER DAN LOGIN DARI SINI KARENA SUDAH ADA DI auth.py ---

@view_config(route_name='users', renderer='json', request_method='GET')
def get_users(request):
    users = request.dbsession.query(User).all()
    return {'users': [u.to_dict() for u in users]}

# ==========================================
# 2. COURSES
# ==========================================

@view_config(route_name='courses', renderer='json', request_method='GET')
def get_courses(request):
    courses = request.dbsession.query(Course).all()
    return {'courses': [c.to_dict() for c in courses]}

@view_config(route_name='course_detail', renderer='json', request_method='GET')
def get_course_detail(request):
    course_id = request.matchdict['id']
    course = request.dbsession.query(Course).get(course_id)
    if not course:
        return HTTPNotFound(json_body={'error': 'Course not found'})
    return {'course': course.to_dict()}

@view_config(route_name='instructor_courses', renderer='json', request_method='GET')
def get_instructor_courses(request):
    instructor_id = request.matchdict['id']
    courses = request.dbsession.query(Course).filter_by(instructor_id=instructor_id).all()
    return {'courses': [c.to_dict() for c in courses]}

@view_config(route_name='courses', renderer='json', request_method='POST')
def create_course(request):
    try:
        title = request.POST.get('title')
        description = request.POST.get('description')
        category = request.POST.get('category')
        instructor_id = request.POST.get('instructor_id')
        enrollment_key = request.POST.get('enrollment_key')
        
        input_file = request.POST.get('thumbnail_file')
        thumbnail_url = None
        
        if input_file != 'null' and input_file is not None and hasattr(input_file, 'file'):
            upload_result = cloudinary.uploader.upload(input_file.file, folder="eduplatform/thumbnails")
            thumbnail_url = upload_result.get("secure_url")

        new_course = Course(
            title=title,
            description=description,
            category=category,
            price=0,
            thumbnail_url=thumbnail_url,
            enrollment_key=enrollment_key if enrollment_key and enrollment_key.strip() else None,
            instructor_id=instructor_id
        )
        request.dbsession.add(new_course)
        request.dbsession.flush()
        return {'success': True, 'course': new_course.to_dict()}
    except Exception as e:
        print(f"Error creating course: {e}")
        return HTTPBadRequest(json_body={'error': str(e)})

# ==========================================
# 3. MODULES
# ==========================================

@view_config(route_name='modules', renderer='json', request_method='GET')
def get_modules(request):
    course_id = request.matchdict['course_id']
    modules = request.dbsession.query(Module).filter_by(course_id=course_id).order_by(Module.sort_order).all()
    return {'modules': [m.to_dict() for m in modules]}

@view_config(route_name='modules', renderer='json', request_method='POST')
def create_module(request):
    course_id = request.matchdict['course_id']
    try:
        data = request.json_body
        new_module = Module(
            course_id=course_id,
            title=data['title'],
            sort_order=data.get('sort_order', 0)
        )
        request.dbsession.add(new_module)
        request.dbsession.flush()
        return {'success': True, 'module': new_module.to_dict()}
    except Exception as e:
        return HTTPBadRequest(json_body={'error': str(e)})

# ==========================================
# 4. LESSONS (CRUD LENGKAP)
# ==========================================

@view_config(route_name='lessons', renderer='json', request_method='GET')
def get_lessons(request):
    module_id = request.matchdict['module_id']
    lessons = request.dbsession.query(Lesson).filter_by(module_id=module_id).order_by(Lesson.sort_order).all()
    return {'lessons': [l.to_dict() for l in lessons]}

@view_config(route_name='lesson_detail', renderer='json', request_method='GET')
def get_lesson_detail(request):
    lesson_id = request.matchdict['id']
    lesson = request.dbsession.query(Lesson).get(lesson_id)
    if not lesson:
        return HTTPNotFound(json_body={'error': 'Lesson not found'})
    data = lesson.to_dict()
    data['content_text'] = lesson.content_text 
    return {'lesson': data}

@view_config(route_name='lessons', renderer='json', request_method='POST')
def create_lesson(request):
    module_id = request.matchdict['module_id']
    try:
        title = request.POST.get('title')
        content_text = request.POST.get('content_text')
        video_url = request.POST.get('video_url')
        
        is_preview_raw = request.POST.get('is_preview', 'false')
        is_preview = is_preview_raw.lower() == 'true'
        sort_order = int(request.POST.get('sort_order', 0))

        input_file = request.POST.get('file_material')
        
        if input_file != 'null' and input_file is not None and hasattr(input_file, 'file'):
            upload_result = cloudinary.uploader.upload(
                input_file.file, 
                folder="eduplatform/lessons", 
                resource_type="auto"
            )
            video_url = upload_result.get("secure_url")

        new_lesson = Lesson(
            module_id=module_id,
            title=title,
            content_text=content_text,
            video_url=video_url,
            is_preview=is_preview,
            sort_order=sort_order
        )
        request.dbsession.add(new_lesson)
        request.dbsession.flush()
        return {'success': True, 'lesson': new_lesson.to_dict()}
        
    except Exception as e:
        print(f"Error creating lesson: {e}")
        return HTTPBadRequest(json_body={'error': f"Failed to create lesson: {str(e)}"})

@view_config(route_name='lesson_detail', renderer='json', request_method='POST') 
@view_config(route_name='lesson_detail', renderer='json', request_method='PUT')
def update_lesson(request):
    lesson_id = request.matchdict['id']
    try:
        lesson = request.dbsession.query(Lesson).get(lesson_id)
        if not lesson:
            return HTTPNotFound(json_body={'error': 'Lesson not found'})

        try:
            data = request.json_body
            if 'title' in data: lesson.title = data['title']
            if 'content_text' in data: lesson.content_text = data['content_text']
            if 'video_url' in data: lesson.video_url = data['video_url']
            if 'is_preview' in data: lesson.is_preview = data['is_preview']
        except:
            if request.POST.get('title'): lesson.title = request.POST.get('title')
            if request.POST.get('content_text'): lesson.content_text = request.POST.get('content_text')
            
            input_file = request.POST.get('file_material')
            if input_file != 'null' and input_file is not None and hasattr(input_file, 'file'):
                 upload_result = cloudinary.uploader.upload(
                    input_file.file, 
                    folder="eduplatform/lessons", 
                    resource_type="auto"
                )
                 lesson.video_url = upload_result.get("secure_url")
            elif request.POST.get('video_url'):
                 lesson.video_url = request.POST.get('video_url')

        request.dbsession.add(lesson)
        return {'success': True, 'message': 'Lesson updated', 'lesson': lesson.to_dict()}
    except Exception as e:
        print(f"Update Lesson Error: {e}")
        return HTTPBadRequest(json_body={'error': str(e)})

@view_config(route_name='lesson_detail', renderer='json', request_method='DELETE')
def delete_lesson(request):
    lesson_id = request.matchdict['id']
    try:
        lesson = request.dbsession.query(Lesson).get(lesson_id)
        if not lesson:
            return HTTPNotFound(json_body={'error': 'Lesson not found'})
        
        request.dbsession.delete(lesson)
        return {'success': True, 'message': 'Lesson deleted'}
    except Exception as e:
        return HTTPBadRequest(json_body={'error': str(e)})

# ==========================================
# 5. ASSIGNMENTS (CRUD LENGKAP)
# ==========================================

@view_config(route_name='assignments', renderer='json', request_method='GET')
def get_assignments(request):
    module_id = request.matchdict['module_id']
    assignments = request.dbsession.query(Assignment).filter_by(module_id=module_id).all()
    results = []
    for a in assignments:
        results.append({
            'id': a.id,
            'title': a.title,
            'description': a.description,
            'due_date': str(a.due_date) if a.due_date else None
        })
    return {'assignments': results}

@view_config(route_name='assignment_detail', renderer='json', request_method='GET')
def get_assignment_detail(request):
    assign_id = request.matchdict['id']
    assign = request.dbsession.query(Assignment).get(assign_id)
    if not assign:
        return HTTPNotFound(json_body={'error': 'Assignment not found'})
    return {'assignment': {
        'id': assign.id,
        'title': assign.title,
        'description': assign.description,
        'due_date': str(assign.due_date) if assign.due_date else None,
        'module_id': assign.module_id
    }}

@view_config(route_name='assignments', renderer='json', request_method='POST')
def create_assignment(request):
    module_id = request.matchdict['module_id']
    try:
        data = request.json_body
        new_assign = Assignment(
            module_id=module_id,
            title=data['title'],
            description=data.get('description')
        )
        request.dbsession.add(new_assign)
        request.dbsession.flush()
        return {'success': True, 'assignment_id': new_assign.id}
    except Exception as e:
        return HTTPBadRequest(json_body={'error': str(e)})

@view_config(route_name='assignment_detail', renderer='json', request_method='PUT')
def update_assignment(request):
    assign_id = request.matchdict['id']
    try:
        data = request.json_body
        assign = request.dbsession.query(Assignment).get(assign_id)
        if not assign:
            return HTTPNotFound(json_body={'error': 'Assignment not found'})
        
        if 'title' in data: assign.title = data['title']
        if 'description' in data: assign.description = data['description']
        
        request.dbsession.add(assign)
        return {'success': True, 'message': 'Assignment updated'}
    except Exception as e:
        return HTTPBadRequest(json_body={'error': str(e)})

@view_config(route_name='assignment_detail', renderer='json', request_method='DELETE')
def delete_assignment(request):
    assign_id = request.matchdict['id']
    try:
        assign = request.dbsession.query(Assignment).get(assign_id)
        if not assign:
            return HTTPNotFound(json_body={'error': 'Assignment not found'})
        
        request.dbsession.delete(assign)
        return {'success': True, 'message': 'Assignment deleted'}
    except Exception as e:
        return HTTPBadRequest(json_body={'error': str(e)})

# ==========================================
# 6. SUBMISSIONS & GRADING
# ==========================================

@view_config(route_name='my_submission', renderer='json', request_method='GET')
def get_my_submission(request):
    assignment_id = request.matchdict['assignment_id']
    student_id = request.params.get('student_id')
    if not student_id:
        return HTTPBadRequest(json_body={'error': 'Student ID required'})
    sub = request.dbsession.query(Submission).filter_by(
        assignment_id=assignment_id,
        student_id=student_id
    ).order_by(Submission.submitted_at.desc()).first() 
    if not sub:
        return {'submitted': False}
    return {'submitted': True, 'submission': {
        'id': sub.id,
        'file_url': sub.submission_file_url,
        'text': sub.submission_text,
        'grade': float(sub.grade) if sub.grade is not None else None,
        'feedback': sub.feedback,
        'submitted_at': str(sub.submitted_at)
    }}

@view_config(route_name='submissions', renderer='json', request_method='POST')
def submit_assignment(request):
    try:
        assignment_id = request.matchdict['assignment_id']
        student_id = request.POST.get('student_id')
        submission_text = None
        input_file = request.POST.get('submission_file')
        input_link = request.POST.get('submission_link')
        
        file_url = None
        
        if input_file != 'null' and input_file is not None and hasattr(input_file, 'file'):
            upload_result = cloudinary.uploader.upload(
                input_file.file, 
                folder="eduplatform/submissions",
                resource_type="auto" 
            )
            file_url = upload_result.get("secure_url")
        
        if input_link and input_link.strip():
            if file_url:
                submission_text = input_link
            else:
                file_url = input_link

        new_sub = Submission(
            assignment_id=assignment_id,
            student_id=student_id,
            submission_text=submission_text,
            submission_file_url=file_url 
        )
        request.dbsession.add(new_sub)
        
        return {'success': True, 'message': 'Assignment submitted successfully'}
        
    except Exception as e:
        print(f"Error submitting assignment: {e}")
        return HTTPBadRequest(json_body={'error': str(e)})

@view_config(route_name='submissions', renderer='json', request_method='GET')
def get_assignment_submissions(request):
    assign_id = request.matchdict['assignment_id']
    submissions = request.dbsession.query(Submission).filter_by(assignment_id=assign_id).all()
    
    result = []
    for sub in submissions:
        student_name = sub.student.name if sub.student else "Unknown"
        result.append({
            'id': sub.id,
            'student_name': student_name,
            'submitted_at': str(sub.submitted_at),
            'grade': float(sub.grade) if sub.grade is not None else None,
            'file_url': sub.submission_file_url,
            'text': sub.submission_text,
            'feedback': sub.feedback
        })
    return {'submissions': result}

@view_config(route_name='api_grade_submission', renderer='json', request_method='POST')
@view_config(route_name='api_grade_submission', renderer='json', request_method='PUT')
def grade_submission(request):
    submission_id = request.matchdict['id']
    try:
        data = request.json_body
        grade = data.get('grade')
        feedback = data.get('feedback')

        submission = request.dbsession.query(Submission).get(submission_id)
        if not submission:
            return HTTPNotFound(json_body={'error': 'Submission not found'})

        if grade is not None and grade != "":
            try:
                submission.grade = float(grade)
            except ValueError:
                return HTTPBadRequest(json_body={'error': 'Grade must be a number'})
        else:
            submission.grade = None

        submission.feedback = feedback
        request.dbsession.add(submission)
        return {'success': True, 'message': 'Grade saved'}
    except Exception as e:
        return HTTPBadRequest(json_body={'error': str(e)})

# ==========================================
# 7. ENROLLMENTS & COMPLETIONS
# ==========================================

@view_config(route_name='enroll', renderer='json', request_method='POST')
def enroll_course(request):
    try:
        data = request.json_body
        student_id = data['student_id']
        course_id = data['course_id']
        input_key = data.get('enrollment_key') 

        course = request.dbsession.query(Course).get(course_id)
        if not course:
            return HTTPNotFound(json_body={'error': 'Course not found'})

        if course.enrollment_key:
            if not input_key or input_key != course.enrollment_key:
                return HTTPForbidden(json_body={'error': 'Invalid Enrollment Key'})

        if request.dbsession.query(Enrollment).filter_by(student_id=student_id, course_id=course_id).first():
            return HTTPBadRequest(json_body={'error': 'Already enrolled'})
        
        enrollment = Enrollment(student_id=student_id, course_id=course_id)
        request.dbsession.add(enrollment)
        return {'success': True}
    except Exception as e:
        return HTTPBadRequest(json_body={'error': str(e)})

@view_config(route_name='my_courses', renderer='json', request_method='GET')
def get_my_courses(request):
    student_id = request.matchdict['id']
    user = request.dbsession.query(User).get(student_id)
    if not user:
        return HTTPNotFound(json_body={'error': 'User not found'})
    my_courses_list = []
    for enrollment in user.enrollments:
        my_courses_list.append(enrollment.course.to_dict())
    return {'courses': my_courses_list}

@view_config(route_name='complete_lesson', renderer='json', request_method='POST')
def complete_lesson(request):
    lesson_id = request.matchdict['lesson_id']
    try:
        data = request.json_body
        existing = request.dbsession.query(LessonCompletion).filter_by(
            student_id=data['student_id'], lesson_id=lesson_id
        ).first()
        if existing:
            return {'success': True, 'message': 'Already completed'}
        completion = LessonCompletion(
            student_id=data['student_id'],
            lesson_id=lesson_id
        )
        request.dbsession.add(completion)
        return {'success': True, 'message': 'Lesson marked as complete'}
    except Exception as e:
        return HTTPBadRequest(json_body={'error': str(e)})