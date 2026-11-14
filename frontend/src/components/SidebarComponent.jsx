import {NavLink, useNavigate} from "react-router-dom";
import {useEffect} from "react";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import ThemeIcon from "./icons/ThemeIcon.jsx";
import UserIcon from "./icons/UserIcon.jsx";
import InboxIcon from "./icons/InboxIcon.jsx";
import TasksIcon from "./icons/TasksIcon.jsx";
import ProjectIcon from "./icons/ProjectIcon.jsx";
import SettingsIcon from "./icons/SettingsIcon.jsx";
import LogoutIcon from "./icons/LogoutIcon.jsx";
import {useAuth} from "../context/useAuth.js";
import {useNotifications} from "../context/NotificationContext.jsx";

function SidebarComponent({ isVisible, setIsVisible, isMobile, onMyTasksClick }) {

    const {logoutUser} = useAuth();
    const { unreadCount } = useNotifications();
    const navigate = useNavigate();

    const clearScrollSession = () => {
        sessionStorage.removeItem("notification-scroll-target");
        sessionStorage.removeItem("global_scroll_target");
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        clearScrollSession();
        await logoutUser();
        navigate("/login");
    }

    const toggleSidebar = () => {
        setIsVisible(prev => !prev);
    };
    const iconSize = isMobile ? 34 : 24;

    useEffect(() => {
        const instances = tippy('#sidebar [data-tippy-content]', {
            placement: 'right',
            duration: 150,
        });

        return () => {
            instances.forEach(instance => instance.destroy());
        };
    }, [isVisible, isMobile]);

    const tooltipText = (text) => (!isVisible && !isMobile ? text : undefined);

    return (
        <div id={"sidebar"} className={isVisible ? "expanded" : "collapsed"}>
            {!isMobile && (
                <button onClick={toggleSidebar}
                    data-tippy-content={!isVisible ? "Toggle" : undefined}>
                    <ThemeIcon state={isVisible} size={iconSize} />
                </button>
            )}
            <NavLink to={"/profile"} onClick={clearScrollSession}
                 data-tippy-content={tooltipText("Profile")}>
                <UserIcon size={iconSize}/>
                {!isMobile && isVisible && "Profile"}
            </NavLink>
            <NavLink to={"/inbox"} onClick={clearScrollSession}
                 data-tippy-content={tooltipText("Inbox")} className="sidebar-inbox-link">
                <span className="sidebar-inbox-icon-wrap">
                    <InboxIcon size={iconSize}/>
                    {unreadCount > 0 && (
                        <span className="sidebar-inbox-badge" aria-label={`${unreadCount} unread`}>
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </span>
                {!isMobile && isVisible && "Inbox"}
            </NavLink>
            <NavLink to={"/"}  onClick={(e) => {clearScrollSession(); if (onMyTasksClick) onMyTasksClick(e); }}
                className={ ({ isActive}) => isActive || location.pathname.startsWith('/tasks') ? 'active' : '' }
                data-tippy-content={tooltipText("My Tasks")}>
                <TasksIcon size={iconSize}/>
                {!isMobile && isVisible && "My Tasks"}
            </NavLink>
            <NavLink to={"/projects"} onClick={clearScrollSession}
                 data-tippy-content={tooltipText("Projects")}>
                <ProjectIcon size={iconSize}/>
                {!isMobile && isVisible && "Projects"}
            </NavLink>
            <NavLink to={"/settings"} onClick={clearScrollSession}
                 data-tippy-content={tooltipText("Settings")}>
                <SettingsIcon size={iconSize}/>
                {!isMobile && isVisible && "Settings"}
            </NavLink>
            <NavLink to={"/login"} data-tippy-content={tooltipText("Logout")}
                onClick={handleLogout}>
                <LogoutIcon size={iconSize}/>
                {!isMobile && isVisible && "Logout"}
            </NavLink>
        </div>
    );
}

export default SidebarComponent;