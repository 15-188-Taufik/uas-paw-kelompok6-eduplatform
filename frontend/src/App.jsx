import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CourseDetailPage from './pages/CourseDetailPage';
import MyCoursesPage from './pages/MyCoursesPage';
import LessonPage from './pages/LessonPage';
import AssignmentPage from './pages/AssignmentPage';
import InstructorDashboard from './pages/InstructorDashboard';
import CreateCoursePage from './pages/CreateCoursePage';
import ManageCoursePage from './pages/ManageCoursePage';
import GradingPage from './pages/GradingPage';
import StudentDashboard from './pages/StudentDashboard';
import InstructorCoursesPage from './pages/InstructorCoursesPage';
import TimelinePage from './pages/TimelinePage';

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ marginTop: '5px', paddingBottom: '50px' }}>
        <Routes>
          <Route path="/grading/:assignmentId" element={<GradingPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/course/:id" element={<CourseDetailPage />} />
          <Route path="/my-courses" element={<MyCoursesPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/lesson/:id" element={<LessonPage />} />
          <Route path="/assignment/:id" element={<AssignmentPage />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/instructor-dashboard" element={<InstructorDashboard />} />
          <Route path="/create-course" element={<CreateCoursePage />} />
          <Route path="/instructor-courses" element={<InstructorCoursesPage />} />
          <Route path="/manage-course/:id" element={<ManageCoursePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;