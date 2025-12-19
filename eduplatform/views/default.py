import os
import uuid
import shutil
import cloudinary
import cloudinary.uploader
import cloudinary.api
import cloudinary.utils # [PENTING] Tambahkan ini untuk generate signed url
import datetime
import traceback
import requests
import urllib.parse # [PENTING] Untuk parsing URL

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
# 1. CORS OPTIONS HANDLER
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
@view_config(route_name='api_unenroll', request_method='OPTIONS')
@view_config(route_name='complete_lesson', request_method='OPTIONS')
@view_config(route_name='api_grade_submission', request_method='OPTIONS')
@view_config(route_name='student_timeline', request_method='OPTIONS')
def options_view(request):
    return Response(body='', status=200, content_type='text/plain')

# ==========================================
# 2. USERS
# ==========================================

@view_config(route_name='users', renderer='json', request_method='GET')
def get_users(request):
    users = request.dbsession.query(User).all()
    return {'users': [u.to_dict() for u in users]}

# ==========================================
# 3. COURSES
# ==========================================

@view_config(route_name='courses', renderer='json', request_method='GET')
def get_courses(request):
    # Ambil parameter pencarian dari URL (misal: /api/courses?search=python)
    search_query = request.params.get('search')
    
    # Mulai query dasar
    query = request.dbsession.query(Course)
    
    # Jika ada pencarian, filter berdasarkan judul (case-insensitive)
    if search_query:
        # Gunakan ilike agar 'python' cocok dengan 'Python', 'PYTHON', dll.
        query = query.filter(Course.title.ilike(f'%{search_query}%'))
    
    # Urutkan dari yang terbaru (opsional, tapi bagus untuk UX)
    # Pastikan model Course punya kolom id atau created_at, default sort by ID desc
    courses = query.order_by(Course.id.desc()).all()
    
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
# 4. MODULES
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
# 5. LESSONS
# ==========================================
@view_config(route_name='lessons', renderer='json', request_method='GET')
def get_lessons(request):
    try:
        module_id = request.matchdict['module_id']
        
        # Ambil semua lesson berdasarkan module_id, urutkan berdasarkan sort_order
        lessons = request.dbsession.query(Lesson)\
            .filter_by(module_id=module_id)\
            .order_by(Lesson.sort_order)\
            .all()
            
        return {'lessons': [l.to_dict() for l in lessons]}
        
    except Exception as e:
        print(f"Error getting lessons: {e}")
        return {'lessons': []} # Return array kosong agar frontend tidak crash

@view_config(route_name='lesson_detail', renderer='json', request_method='GET')
def get_lesson_detail(request):
    lesson_id = request.matchdict['id']
    # Ambil student_id dari query param (?student_id=...)
    student_id = request.params.get('student_id') 
    
    lesson = request.dbsession.query(Lesson).get(lesson_id)
    if not lesson:
        return HTTPNotFound(json_body={'error': 'Lesson not found'})
    
    data = lesson.to_dict()
    data['content_text'] = lesson.content_text 
    
    # [LOGIKA BARU] Cek status completion
    is_completed = False
    if student_id:
        exists = request.dbsession.query(LessonCompletion).filter_by(
            student_id=student_id, 
            lesson_id=lesson_id
        ).first()
        if exists:
            is_completed = True
            
    data['completed'] = is_completed # Kirim status ke frontend
    
    # Kirim juga info course_id agar frontend bisa load modul/sidebar jika url tidak lengkap
    if lesson.module:
        data['course_id'] = lesson.module.course_id

    return {'lesson': data}


@view_config(route_name='lessons', renderer='json', request_method='POST')
def create_lesson(request):
    module_id = request.matchdict['module_id']
    try:
        try:
            data = request.json_body
        except:
            data = request.POST

        title = data.get('title')
        content_text = data.get('content_text')
        video_url = data.get('video_url')
        
        is_preview_raw = data.get('is_preview', 'false')
        if isinstance(is_preview_raw, bool):
            is_preview = is_preview_raw
        else:
            is_preview = is_preview_raw.lower() == 'true'
            
        sort_order = int(data.get('sort_order', 0))

        input_file = request.POST.get('file_material') if 'file_material' in request.POST else None
        
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
        except:
            data = request.POST

        if data.get('title'): lesson.title = data.get('title')
        if data.get('content_text'): lesson.content_text = data.get('content_text')
        if data.get('video_url'): lesson.video_url = data.get('video_url')
        
        is_preview_raw = data.get('is_preview')
        if is_preview_raw is not None:
             if isinstance(is_preview_raw, bool):
                lesson.is_preview = is_preview_raw
             else:
                lesson.is_preview = is_preview_raw.lower() == 'true'

        input_file = request.POST.get('file_material') if 'file_material' in request.POST else None
        if input_file != 'null' and input_file is not None and hasattr(input_file, 'file'):
                upload_result = cloudinary.uploader.upload(
                input_file.file, 
                folder="eduplatform/lessons", 
                resource_type="auto"
            )
                lesson.video_url = upload_result.get("secure_url")

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
# 6. ASSIGNMENTS
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
            'due_date': str(a.due_date) if a.due_date else None,
            'attachment_url': a.attachment_url,
            'link_url': a.link_url
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
        'attachment_url': assign.attachment_url,
        'link_url': assign.link_url,
        'module_id': assign.module_id
    }}

@view_config(route_name='assignments', renderer='json', request_method='POST')
def create_assignment(request):
    module_id = request.matchdict['module_id']
    try:
        try:
            data = request.json_body
        except:
            data = request.POST

        title = data.get('title')
        description = data.get('description')
        link_url = data.get('link_url')
        
        attachment_url = None
        input_file = request.POST.get('attachment_file') if 'attachment_file' in request.POST else None
        
        if input_file != 'null' and input_file is not None and hasattr(input_file, 'file'):
            upload_result = cloudinary.uploader.upload(
                input_file.file, 
                folder="eduplatform/assignments", 
                resource_type="auto"
            )
            attachment_url = upload_result.get("secure_url")

        due_date_str = data.get('due_date')
        due_date_obj = None
        if due_date_str and due_date_str != 'null':
            try:
                due_date_obj = datetime.datetime.fromisoformat(due_date_str)
            except ValueError:
                pass

        new_assign = Assignment(
            module_id=module_id,
            title=title,
            description=description,
            due_date=due_date_obj,
            attachment_url=attachment_url,
            link_url=link_url
        )
        request.dbsession.add(new_assign)
        request.dbsession.flush()
        return {'success': True, 'assignment_id': new_assign.id}
    except Exception as e:
        print(f"Error create assignment: {e}")
        return HTTPBadRequest(json_body={'error': str(e)})

@view_config(route_name='assignment_detail', renderer='json', request_method='PUT')
@view_config(route_name='assignment_detail', renderer='json', request_method='POST')
def update_assignment(request):
    assign_id = request.matchdict['id']
    try:
        assign = request.dbsession.query(Assignment).get(assign_id)
        if not assign:
            return HTTPNotFound(json_body={'error': 'Assignment not found'})
        
        try:
            data = request.json_body
        except:
            data = request.POST

        if data.get('title'): assign.title = data.get('title')
        if data.get('description'): assign.description = data.get('description')
        if 'link_url' in data: assign.link_url = data.get('link_url')

        if 'due_date' in data:
            val = data.get('due_date')
            if val and val != 'null':
                try:
                    assign.due_date = datetime.datetime.fromisoformat(val)
                except ValueError:
                    pass
            else:
                assign.due_date = None

        input_file = request.POST.get('attachment_file') if 'attachment_file' in request.POST else None
        if input_file != 'null' and input_file is not None and hasattr(input_file, 'file'):
             upload_result = cloudinary.uploader.upload(
                input_file.file, 
                folder="eduplatform/assignments", 
                resource_type="auto"
            )
             assign.attachment_url = upload_result.get("secure_url")

        request.dbsession.add(assign)
        return {'success': True, 'message': 'Assignment updated'}
    except Exception as e:
        print(f"Error update assignment: {e}")
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
# 7. SUBMISSIONS & GRADING
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
# 8. ENROLLMENTS & COMPLETIONS
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

# --- [BARU] FUNGSI UNENROLL ---
# --- TAMBAHKAN KODE INI DI BAGIAN BAWAH ---

@view_config(route_name='api_unenroll', renderer='json', request_method='POST')
def api_unenroll(request):
    try:
        # 1. Ambil data dari Body Request
        payload = request.json_body
        user_id = payload.get('user_id')
        course_id = payload.get('course_id')

        if not user_id or not course_id:
            request.response.status = 400
            return {'status': 'error', 'message': 'User ID dan Course ID wajib ada'}

        # 2. Cari data Enrollment di Database
        session = request.dbsession
        enrollment = session.query(Enrollment).filter_by(user_id=user_id, course_id=course_id).first()

        # 3. Jika ada, Hapus
        if enrollment:
            session.delete(enrollment)
            # Transaction otomatis di-commit oleh Pyramid tm
            return {'status': 'success', 'message': 'Berhasil keluar dari kursus'}
        else:
            request.response.status = 404
            return {'status': 'error', 'message': 'Anda belum terdaftar di kursus ini'}

    except DBAPIError:
        request.response.status = 500
        return {'status': 'error', 'message': 'Database error'}
    except Exception as e:
        request.response.status = 500
        return {'status': 'error', 'message': str(e)}

# ==========================================
# GANTI FUNGSI INI DI default.py
# ==========================================

@view_config(route_name='my_courses', renderer='json', request_method='GET')
def get_my_courses(request):
    student_id = request.matchdict['id']
    user = request.dbsession.query(User).get(student_id)
    if not user:
        return HTTPNotFound(json_body={'error': 'User not found'})
    
    my_courses_list = []
    
    # Ambil waktu sekarang untuk filter deadline yang sudah lewat
    now = datetime.datetime.now()

    for enrollment in user.enrollments:
        course = enrollment.course
        course_data = course.to_dict()

        # --- 1. LOGIKA PROGRES (Tetap Sama) ---
        total_lessons = request.dbsession.query(Lesson)\
            .join(Module)\
            .filter(Module.course_id == course.id)\
            .count()
            
        total_assignments = request.dbsession.query(Assignment)\
            .join(Module)\
            .filter(Module.course_id == course.id)\
            .count()
            
        total_items = total_lessons + total_assignments

        completed_lessons = request.dbsession.query(LessonCompletion)\
            .join(Lesson)\
            .join(Module)\
            .filter(
                LessonCompletion.student_id == student_id,
                Module.course_id == course.id
            ).count()
            
        completed_assignments = request.dbsession.query(Submission.assignment_id)\
            .join(Assignment)\
            .join(Module)\
            .filter(
                Submission.student_id == student_id,
                Module.course_id == course.id
            )\
            .distinct()\
            .count()
            
        completed_items = completed_lessons + completed_assignments
            
        if total_items > 0:
            progress = (completed_items / total_items) * 100
        else:
            progress = 0
            
        course_data['progress'] = round(progress, 1)

        # --- 2. [BARU] LOGIKA DEADLINE TERDEKAT ---
        # Mencari assignment di course ini yang due_date-nya > sekarang (belum lewat)
        # Diurutkan dari yang paling cepat (asc)
        nearest_assignment = request.dbsession.query(Assignment)\
            .join(Module)\
            .filter(
                Module.course_id == course.id,
                Assignment.due_date != None,
                Assignment.due_date > now
            )\
            .order_by(Assignment.due_date.asc())\
            .first()
            
        if nearest_assignment:
            # Kirim dalam format string ISO agar mudah dibaca JS Frontend
            course_data['deadline'] = str(nearest_assignment.due_date)
            # Opsional: Kirim juga nama tugasnya jika ingin ditampilkan detail
            course_data['next_task_title'] = nearest_assignment.title
        else:
            course_data['deadline'] = None

        my_courses_list.append(course_data)
        
    return {'courses': my_courses_list}

# ==========================================
# GANTI FUNGSI INI DI default.py
# ==========================================

@view_config(route_name='student_timeline', renderer='json', request_method='GET')
def get_student_timeline(request):
    student_id = request.matchdict['id']
    
    # Ambil waktu server (naive/tanpa timezone)
    now = datetime.datetime.now() 
    
    # 1. Ambil SEMUA assignment dari course yang diikuti student
    #    Menggunakan .all() untuk memastikan tidak hanya satu
    assignments = request.dbsession.query(Assignment)\
        .join(Module)\
        .join(Course)\
        .join(Enrollment)\
        .filter(Enrollment.student_id == student_id)\
        .filter(Assignment.due_date != None)\
        .order_by(Assignment.due_date.asc())\
        .all()
        
    # 2. Ambil semua submission student ini (untuk cek status submitted)
    submissions = request.dbsession.query(Submission)\
        .filter(Submission.student_id == student_id)\
        .all()
    submitted_ids = {sub.assignment_id for sub in submissions}
    
    timeline_data = []
    
    for assign in assignments:
        is_submitted = assign.id in submitted_ids
        due_date = assign.due_date
        
        # [PENTING] Normalisasi Timezone untuk mencegah TypeError
        # Jika due_date punya info timezone, kita hapus agar sama dengan 'now'
        comparison_date = due_date
        if due_date and due_date.tzinfo is not None:
            comparison_date = due_date.replace(tzinfo=None)
        
        # Hitung sisa hari
        # Jika comparison_date < now, hasilnya negatif (berarti overdue/lewat)
        delta = comparison_date - now
        days_left = delta.days
        
        # Tentukan Status
        status = 'upcoming'
        if is_submitted:
            status = 'submitted'
        elif comparison_date < now:
            status = 'overdue'
        elif 0 <= days_left <= 3:
            status = 'urgent'
            
        # Perbaikan tampilan hari:
        # Jika hari ini deadline, set days_left 0
        if days_left == -1 and delta.seconds > 0: 
             days_left = 0 # Masih hari yang sama tapi jam belum lewat (opsional logic)

        timeline_data.append({
            'id': assign.id,
            'title': assign.title,
            'course_title': assign.module.course.title,
            'module_title': assign.module.title,
            'due_date': str(due_date),
            'status': status,
            'days_left': days_left,
            'course_id': assign.module.course.id
        })
        
    return {'timeline': timeline_data}

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

# ==========================================
# 9. PROXY DOWNLOAD (FIXED 401 ERROR)
# ==========================================
@view_config(route_name='download_proxy')
def download_proxy(request):
    url = request.params.get('url')
    if not url:
        return HTTPBadRequest(json_body={'error': 'URL missing'})
    
    try:
        # 1. PARSING PUBLIC ID DARI URL
        # URL Contoh: https://res.cloudinary.com/.../image/upload/v12345/folder/file.pdf
        path = urllib.parse.urlparse(url).path
        
        # Tentukan resource_type dari URL (image/video/raw)
        resource_type = 'image' # Default PDF biasanya masuk image di Cloudinary
        if '/video/' in path: resource_type = 'video'
        elif '/raw/' in path: resource_type = 'raw'
        
        # Pecah path untuk ambil Public ID
        # Split berdasarkan '/upload/'
        if '/upload/' in path:
            parts = path.split('/upload/')
            right_part = parts[1] # v12345/folder/file.pdf
            
            # Buang version (v12345) jika ada
            segments = right_part.split('/')
            if segments[0].startswith('v') and segments[0][1:].isdigit():
                segments.pop(0)
            
            # Gabungkan sisanya jadi Public ID
            public_id_with_ext = "/".join(segments)
            
            # Pisahkan ekstensi (Cloudinary butuh public_id tanpa ekstensi untuk generate url)
            if '.' in public_id_with_ext:
                public_id, ext = public_id_with_ext.rsplit('.', 1)
            else:
                public_id = public_id_with_ext
                ext = None
                
            # 2. GENERATE SIGNED URL (KUNCI UTAMA)
            # Ini membuat URL baru dengan token keamanan (signature)
            signed_url, options = cloudinary.utils.cloudinary_url(
                public_id,
                resource_type=resource_type,
                format=ext,
                sign_url=True, # Aktifkan signing
                secure=True
            )
            
            # Gunakan URL yang sudah ditandatangani
            target_url = signed_url
        else:
            # Jika format URL aneh, coba pakai apa adanya
            target_url = url

        # 3. REQUEST KE CLOUDINARY
        # Header minimalis agar tidak diblokir
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
        }
        
        r = requests.get(target_url, headers=headers, stream=True)
        r.raise_for_status() # Cek error 401/404
        
        # 4. STREAMING RESPONSE
        filename = url.split('/')[-1].split('?')[0]
        
        response = Response(content_type=r.headers.get('Content-Type'))
        response.content_disposition = f'attachment; filename="{filename}"'
        response.app_iter = r.iter_content(chunk_size=8192)
        
        return response
        
    except Exception as e:
        print(f"Proxy Download Error: {e}")
        return HTTPNotFound(json_body={'error': f'Gagal mengambil file: {str(e)}'})