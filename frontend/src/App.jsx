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
import ManageCoursePage from './pages/ManageCoursePage'; // <--- Import Ini
import GradingPage from './pages/GradingPage'; // Sesuaikan path

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ marginTop: '20px', paddingBottom: '50px' }}>
        <Routes>
          <Route path="/grading/:assignmentId" element={<GradingPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/course/:id" element={<CourseDetailPage />} />
          <Route path="/my-courses" element={<MyCoursesPage />} />
          <Route path="/lesson/:id" element={<LessonPage />} />
          <Route path="/assignment/:id" element={<AssignmentPage />} />
          
          <Route path="/instructor-dashboard" element={<InstructorDashboard />} />
          <Route path="/create-course" element={<CreateCoursePage />} />
          
          {/* Halaman Kelola Kursus */}
          <Route path="/manage-course/:id" element={<ManageCoursePage />} /> {/* <--- Tambah Ini */}
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;