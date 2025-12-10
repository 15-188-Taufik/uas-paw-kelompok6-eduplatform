from pyramid.view import view_config
from sqlalchemy.orm import joinedload
from sqlalchemy import func
from ..models import Course, Module, Assignment, Submission

@view_config(route_name='api_instructor_dashboard', renderer='json', request_method='GET')
def api_instructor_dashboard(request):
    # Hardcode user sementara
    current_instructor_id = 1 
    
    # 1. Query Courses + Modules + Assignments
    courses = request.dbsession.query(Course)\
        .options(joinedload(Course.modules).joinedload(Module.assignments))\
        .filter(Course.instructor_id == current_instructor_id)\
        .order_by(Course.created_at.desc())\
        .all()

    # 2. Hitung Ungraded Counts
    ungraded_query = request.dbsession.query(
        Submission.assignment_id, func.count(Submission.id)
    ).join(Assignment).join(Module).join(Course)\
    .filter(Course.instructor_id == current_instructor_id)\
    .filter(Submission.grade == None)\
    .group_by(Submission.assignment_id).all()
    
    ungraded_map = {row[0]: row[1] for row in ungraded_query}

    # 3. Serialisasi ke Dictionary (JSON Ready)
    # Kita buat struktur data manual agar rapi di frontend
    courses_data = []
    for c in courses:
        modules_data = []
        for m in c.modules:
            assignments_data = []
            for a in m.assignments:
                assignments_data.append({
                    'id': a.id,
                    'title': a.title,
                    'due_date': a.due_date.isoformat() if a.due_date else None,
                    'needs_grading_count': ungraded_map.get(a.id, 0)
                })
            
            modules_data.append({
                'id': m.id,
                'title': m.title,
                'assignments': assignments_data
            })

        courses_data.append({
            'id': c.id,
            'title': c.title,
            'category': c.category,
            'price': float(c.price) if c.price else 0,
            'modules': modules_data
        })

    return {
        'instructor_name': 'Taufik Hidayat',
        'courses': courses_data
    }