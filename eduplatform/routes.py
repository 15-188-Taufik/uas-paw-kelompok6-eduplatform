def includeme(config):
    # Catatan: CORS dan Configurator utama sudah ada di __init__.py
    # Jadi di sini kita fokus mendaftarkan URL saja.

    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_route('home', '/')
    
    # --- 1. USERS & AUTH ---
    config.add_route('register', '/api/register')
    config.add_route('login', '/api/login')
    config.add_route('users', '/api/users')
    
    # Route Legacy (Biar aman kalau ada kode lama yang panggil nama ini)
    config.add_route('api_register', '/api/register')
    config.add_route('api_login', '/api/login')
    
    config.add_route('user_detail', '/api/users/{id}')
    
    # --- 2. COURSES ---
    config.add_route('courses', '/api/courses')
    # Alias untuk menjaga kompatibilitas nama route
    config.add_route('api_courses', '/api/courses') 
    
    config.add_route('course_detail', '/api/courses/{id}')
    config.add_route('api_course_detail', '/api/courses/{id}') # Alias
    config.add_route('course_students', '/api/courses/{id}/students')
    config.add_route('instructor_courses', '/api/instructors/{id}/courses')
    
    # --- 3. MODULES ---
    config.add_route('modules', '/api/courses/{course_id}/modules') 
    config.add_route('module_detail', '/api/modules/{id}') 

    # --- 4. LESSONS ---
    config.add_route('lessons', '/api/modules/{module_id}/lessons')
    config.add_route('lesson_detail', '/api/lessons/{id}')
    
    # --- 5. ASSIGNMENTS ---
    config.add_route('assignments', '/api/modules/{module_id}/assignments')
    config.add_route('assignment_detail', '/api/assignments/{id}')
    
    # --- 6. SUBMISSIONS ---
    config.add_route('submissions', '/api/assignments/{assignment_id}/submissions')
    config.add_route('my_submission', '/api/assignments/{assignment_id}/my_submission')
    config.add_route('api_grade_submission', '/api/submissions/{id}/grade')

    # --- 7. ENROLLMENTS ---
    config.add_route('enroll', '/api/enroll')
    config.add_route('api_enroll', '/api/enroll') # Alias jaga-jaga
    
    # [PERBAIKAN UTAMA DI SINI] 
    # Nama route harus 'api_unenroll' sesuai yang ada di views/default.py
    config.add_route('api_unenroll', '/api/unenroll') 
    
    config.add_route('my_courses', '/api/students/{id}/courses')
    config.add_route('student_timeline', '/api/students/{id}/timeline')
    
    # --- 8. COMPLETIONS ---
    config.add_route('complete_lesson', '/api/lessons/{lesson_id}/complete')

    # --- 9. INSTRUCTOR & UI ---
    config.add_route('api_instructor_dashboard', '/api/instructor/dashboard')
    config.add_route('instructor_grading_ui', '/instructor/assignments/{id}/grading')

    # --- 10. UTILITIES ---
    config.add_route('download_proxy', '/api/proxy_download')