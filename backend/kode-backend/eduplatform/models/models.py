from sqlalchemy import (
    Column,
    Integer,
    Text,
    String,
    ForeignKey,
    DateTime,
    Boolean,
    Numeric,
    func,
)
from sqlalchemy.orm import relationship
from .meta import Base

# 1. Tabel Users
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(Text, nullable=False)
    email = Column(Text, unique=True, nullable=False)
    password = Column(Text, nullable=False)
    # Role: 'admin', 'instructor', 'student'
    role = Column(String(20), nullable=False, default='student')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relasi
    courses_taught = relationship("Course", back_populates="instructor")
    enrollments = relationship("Enrollment", back_populates="student")
    submissions = relationship("Submission", back_populates="student")
    lesson_completions = relationship("LessonCompletion", back_populates="student")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role
        }

# 2. Tabel Courses
class Course(Base):
    __tablename__ = 'courses'
    id = Column(Integer, primary_key=True)
    instructor_id = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'))
    title = Column(Text, nullable=False)
    description = Column(Text)
    category = Column(String(100))
    thumbnail_url = Column(Text)
    price = Column(Numeric(10, 2), default=0)
    # [BARU] Enrollment Key (Optional)
    enrollment_key = Column(Text, nullable=True) 
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relasi
    instructor = relationship("User", back_populates="courses_taught")
    modules = relationship("Module", back_populates="course", cascade="all, delete")
    enrollments = relationship("Enrollment", back_populates="course")

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'price': float(self.price) if self.price else 0,
            'thumbnail_url': self.thumbnail_url,
            'instructor_name': self.instructor.name if self.instructor else None,
            # Kita kirim info apakah kursus ini dikunci atau tidak (True/False)
            # Jangan kirim kuncinya mentah-mentah ke frontend demi keamanan!
            'is_locked': bool(self.enrollment_key) 
        }

# 3. Tabel Enrollments
class Enrollment(Base):
    __tablename__ = 'enrollments'
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    course_id = Column(Integer, ForeignKey('courses.id', ondelete='CASCADE'))
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relasi
    student = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

# 4. Tabel Modules
class Module(Base):
    __tablename__ = 'modules'
    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey('courses.id', ondelete='CASCADE'))
    title = Column(Text, nullable=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relasi
    course = relationship("Course", back_populates="modules")
    lessons = relationship("Lesson", back_populates="module", cascade="all, delete")
    assignments = relationship("Assignment", back_populates="module", cascade="all, delete")

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'sort_order': self.sort_order,
            'lessons': [l.to_dict() for l in self.lessons]
        }

# 5. Tabel Lessons
class Lesson(Base):
    __tablename__ = 'lessons'
    id = Column(Integer, primary_key=True)
    module_id = Column(Integer, ForeignKey('modules.id', ondelete='CASCADE'))
    title = Column(Text, nullable=False)
    content_text = Column(Text)
    video_url = Column(Text)
    attachment_url = Column(Text)
    sort_order = Column(Integer, default=0)
    is_preview = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relasi
    module = relationship("Module", back_populates="lessons")
    completions = relationship("LessonCompletion", back_populates="lesson")

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'video_url': self.video_url,
            'is_preview': self.is_preview
        }

# 6. Tabel Assignments
class Assignment(Base):
    __tablename__ = 'assignments'
    id = Column(Integer, primary_key=True)
    module_id = Column(Integer, ForeignKey('modules.id', ondelete='CASCADE'))
    title = Column(Text, nullable=False)
    description = Column(Text)
    due_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relasi
    module = relationship("Module", back_populates="assignments")
    submissions = relationship("Submission", back_populates="assignment")

# 7. Tabel Submissions
class Submission(Base):
    __tablename__ = 'submissions'
    id = Column(Integer, primary_key=True)
    assignment_id = Column(Integer, ForeignKey('assignments.id', ondelete='CASCADE'))
    student_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    submission_file_url = Column(Text)
    submission_text = Column(Text)
    grade = Column(Numeric(5, 2))
    feedback = Column(Text)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    graded_at = Column(DateTime(timezone=True))

    # Relasi
    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User", back_populates="submissions")

# 8. Tabel Lesson Completions
class LessonCompletion(Base):
    __tablename__ = 'lesson_completions'
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    lesson_id = Column(Integer, ForeignKey('lessons.id', ondelete='CASCADE'))
    completed_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relasi
    student = relationship("User", back_populates="lesson_completions")
    lesson = relationship("Lesson", back_populates="completions")