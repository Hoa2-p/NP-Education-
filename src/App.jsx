import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Students from './components/Students'
import Attendance from './components/Attendance'
import Learning from './components/Learning'
import { studentAPI } from './api'

function App() {
    const [currentView, setView] = useState('dashboard');
    const [students, setStudents] = useState([]);

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

    const renderContent = () => {
        switch (currentView) {
            case 'dashboard':
                return <Dashboard />;
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
        <div className="app-container" style={{ flexDirection: 'row' }}>
            <Sidebar currentView={currentView} setView={setView} />
            <main style={{ flex: 1, overflowY: 'auto', background: 'var(--background)' }}>
                {renderContent()}
            </main>
        </div>
    )
}

export default App
