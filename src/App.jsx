import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Schedule from './components/Schedule'
import Students from './components/Students'
import Attendance from './components/Attendance'
import Learning from './components/Learning'
import Login from './components/Login'
import ForgotPassword from './components/auth/ForgotPassword'
import CheckEmail from './components/auth/CheckEmail'
import ResetPassword from './components/auth/ResetPassword'
import { studentAPI } from './api'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const [currentView, setView] = useState('dashboard');
    const [students, setStudents] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        try {
            return !!localStorage.getItem('np_edu_auth');
        } catch {
            return false;
        }
    });
    // authPage: 'login' | 'forgot' | 'checkEmail' | 'reset'
    const [authPage, setAuthPage] = useState('login');
    const [forgotEmail, setForgotEmail] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await studentAPI.getAll();
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const handleAddStudent = async (student) => {
        try {
            const response = await studentAPI.create(student);
            setStudents([...students, response.data]);
        } catch (error) {
            console.error('Error adding student:', error);
        }
    };

    const handleDeleteStudent = async (id) => {
        if (confirm('Bạn có chắc chắn muốn xóa học viên này không?')) {
            try {
                await studentAPI.delete(id);
                setStudents(students.filter(s => s.id !== id));
            } catch (error) {
                console.error('Lỗi khi xóa học viên:', error);
            }
        }
    };

    const handleLogin = () => {
        setIsAuthenticated(true);
        setAuthPage('login');
    };

    const handleLogout = () => {
        localStorage.removeItem('np_edu_auth');
        setIsAuthenticated(false);
        setAuthPage('login');
        setForgotEmail('');
    };

    // Render the correct auth page
    if (!isAuthenticated) {
        if (authPage === 'forgot') {
            return (
                <>
                    <ForgotPassword
                        onBack={() => setAuthPage('login')}
                        onEmailSent={(email) => { setForgotEmail(email); setAuthPage('checkEmail'); }}
                    />
                    <ToastContainer position="bottom-right" autoClose={3000} />
                </>
            );
        }
        if (authPage === 'checkEmail') {
            return (
                <>
                    <CheckEmail
                        email={forgotEmail}
                        onBack={() => setAuthPage('login')}
                    />
                    <ToastContainer position="bottom-right" autoClose={3000} />
                </>
            );
        }
        if (authPage === 'reset') {
            return (
                <>
                    <ResetPassword onSuccess={() => setAuthPage('login')} />
                    <ToastContainer position="bottom-right" autoClose={3000} />
                </>
            );
        }
        // Default: login
        return (
            <>
                <Login
                    onLogin={handleLogin}
                    onForgotPassword={() => setAuthPage('forgot')}
                />
                <ToastContainer position="bottom-right" autoClose={3000} />
            </>
        );
    }

    const renderContent = () => {
        switch (currentView) {
            case 'dashboard':
                return <Dashboard setView={setView} />;
            case 'schedule':
                return <Schedule />;
            case 'students':
                return (
                    <Students
                        students={students}
                        onAddStudent={handleAddStudent}
                        onDeleteStudent={handleDeleteStudent}
                    />
                );
            case 'attendance':
                return <Attendance students={students} />;
            case 'learning':
                return <Learning />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="app-container">
            <Sidebar currentView={currentView} setView={setView} onLogout={handleLogout} />
            <main className="main-content">
                {renderContent()}
            </main>
            <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
    )
}

export default App