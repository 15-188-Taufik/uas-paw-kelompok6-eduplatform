from pyramid.events import NewRequest

# --- FUNGSI TAMBAHAN UNTUK CORS ---
def add_cors_headers_response_callback(event):
    def cors_headers(request, response):
        response.headers.update({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST,GET,DELETE,PUT,OPTIONS',
            'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '1728000',
        })
    event.request.add_response_callback(cors_headers)

def includeme(config):
    # Aktifkan CORS Subscriber
    config.add_subscriber(add_cors_headers_response_callback, NewRequest)

    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_route('home', '/')
    
    # --- 1. USERS & AUTH ---
    config.add_route('register', '/api/register')
    config.add_route('login', '/api/login')
    
    # Route Legacy untuk kompatibilitas
    config.add_route('api_register', '/api/register')
    config.add_route('api_login', '/api/login')
    
    config.add_route('users', '/api/users')
    config.add_route('user_detail', '/api/users/{id}')
    
    # --- 2. COURSES ---
    config.add_route('courses', '/api/courses')
    config.add_route('course_detail', '/api/courses/{id}')
    config.add_route('instructor_courses', '/api/instructors/{id}/courses')
    
    # --- 3. MODULES ---
    config.add_route('modules', '/api/courses/{course_id}/modules') 
    
    # --- 4. LESSONS ---
    config.add_route('lessons', '/api/modules/{module_id}/lessons')
    config.add_route('lesson_detail', '/api/lessons/{id}')
    
    # --- 5. ASSIGNMENTS ---
    config.add_route('assignments', '/api/modules/{module_id}/assignments')
    config.add_route('assignment_detail', '/api/assignments/{id}')
    
    # --- 6. SUBMISSIONS ---
    # REVISI: Menggunakan satu route konsisten 'submissions'
    # URL ini menangani GET (lihat list - Instructor) dan POST (kirim tugas - Student)
    config.add_route('submissions', '/api/assignments/{assignment_id}/submissions')
    
    config.add_route('my_submission', '/api/assignments/{assignment_id}/my_submission')
    config.add_route('api_grade_submission', '/api/submissions/{id}/grade')

    # --- 7. ENROLLMENTS ---
    config.add_route('enroll', '/api/enroll')
    config.add_route('my_courses', '/api/students/{id}/courses')
    
    # --- 8. COMPLETIONS ---
    config.add_route('complete_lesson', '/api/lessons/{lesson_id}/complete')

    # --- 9. INSTRUCTOR & UI ---
    config.add_route('api_instructor_dashboard', '/api/instructor/dashboard')
    config.add_route('instructor_grading_ui', '/instructor/assignments/{id}/grading')