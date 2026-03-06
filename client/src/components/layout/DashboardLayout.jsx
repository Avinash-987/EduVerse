import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
    const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);

    return (
        <div className="min-h-screen bg-surface">
            <Sidebar />
            <main
                className="transition-all duration-300 pt-16 lg:pt-20 min-h-screen"
                style={{ marginLeft: sidebarOpen ? 260 : 72 }}
            >
                <div className="p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
