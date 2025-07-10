import {
    LayoutDashboard, Settings, User, Home,
    FilePlus,
    Search,
    LogOut
} from "lucide-react";

const Sidebar = () => {
    return (
        <div className="h-screen w-20 bg-[#1a102c] text-white flex flex-col items-center py-6 shadow-lg">
            <div className="mb-10">
                <img
                    src="/logo.svg" // Replace with your actual logo image path
                    alt="Logo"
                    className="w-10 h-10 border border-gray-700 rounded-md p-1"
                />
            </div>
            {/* 🔗 Icon Navigation */}
            <nav className="flex flex-col gap-6">
                <a href="#" className="hover:bg-[#ff5010] p-2 rounded-full transition-colors">
                    <LayoutDashboard className="w-6 h-6" />
                </a>
                <a href="#" className="hover:bg-[#ff5010] p-2 rounded-full transition-colors">
                    <Home className="w-6 h-6" />
                </a>
                <a href="#" className="hover:bg-[#ff5010] p-2 rounded-full transition-colors">
                    <Settings className="w-6 h-6" />
                </a>
                <a href="#" className="hover:bg-[#ff5010] p-2 rounded-full transition-colors">
                    <User className="w-6 h-6" />
                </a>
                <a href="#" className="hover:bg-[#ff5010] p-2 rounded-full transition-colors">
                    <FilePlus className="w-6 h-6" />
                </a>
                <a href="#" className="hover:bg-[#ff5010] p-2 rounded-full transition-colors">
                    <Search className="w-6 h-6" />
                </a>
                <a href="#" className="hover:bg-[#ff5010] p-2 rounded-full transition-colors">
                    <LogOut className="w-6 h-6" />
                </a>
            </nav>
        </div>
    );
};

export default Sidebar;
