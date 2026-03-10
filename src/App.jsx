import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Schedule from './components/Schedule'
import Students from './components/Students'
import Attendance from './components/Attendance'
import Learning from './components/Learning'
import Login from './components/Login'
import { studentAPI, classAPI } from './api'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const [currentView, setView] = useState('dashboard');
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [authUser, setAuthUser] = useState(null);

    useEffect(() => {
        // Load user from localStorage immediately
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setAuthUser(JSON.parse(savedUser));
        }
    }, []);

    useEffect(() => {
        if (authUser) {
            fetchStudents();
        }
    }, [authUser]);

    const fetchAppData = async () => {
        try {
            const stuRes = await studentAPI.getAll();
            setStudents(stuRes.data);

            // Lấy danh sách Lớp nếu không phải Học sinh
            if (authUser.role !== 'Student') {
                const clsRes = await classAPI.getAll();
                setClasses(clsRes.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
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

    const renderContent = () => {
        switch (currentView) {
            case 'dashboard':
                return <Dashboard setView={setView} authUser={authUser} students={students} classes={classes} />;
            case 'schedule':
                return <Schedule authUser={authUser} />;
            case 'students':
                return (
                    <Students
                        students={students}
                        classes={classes}
                        onAddStudent={handleAddStudent}
                        onDeleteStudent={handleDeleteStudent}
                    />
                );
            case 'attendance':
                return <Attendance students={students} classes={classes} />;
            case 'learning':
                return <Learning authUser={authUser} classes={classes} />;
            default:
                return <Dashboard authUser={authUser} students={students} classes={classes} />;
        }
    };

    if (!authUser) {
        return (
            <>
                <Login setAuthUser={setAuthUser} />
                <ToastContainer position="bottom-right" autoClose={3000} />
            </>
        );
    }

    return (
        <div className="app-container">
            <Sidebar currentView={currentView} setView={setView} authUser={authUser} setAuthUser={setAuthUser} />
            <main className="main-content">
                {renderContent()}
            </main>
            <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
    )
}

export default App
