import {NavLink} from "react-router-dom";
import ThemeIcon from "./icons/ThemeIcon.jsx";
import UserIcon from "./icons/UserIcon.jsx";
import InboxIcon from "./icons/InboxIcon.jsx";
import TasksIcon from "./icons/TasksIcon.jsx";
import ProjectIcon from "./icons/ProjectIcon.jsx";
import SettingsIcon from "./icons/SettingsIcon.jsx";

function SidebarComponent({ isVisible, setIsVisible, isMobile, onMyTasksClick }) {

    const toggleSidebar = () => {
        setIsVisible(prev => !prev);
    };
    const iconSize = isMobile ? 34 : 24;

    return (
        <div id={"sidebar"} className={isVisible ? "expanded" : "collapsed"}>
            {!isMobile && (
                <button onClick={toggleSidebar}>
                    <ThemeIcon state={isVisible} size={iconSize} />
                </button>
            )}
            <NavLink to={"/profile"}>
                <UserIcon size={iconSize}/>
                {!isMobile && isVisible && "Profile"}
            </NavLink>
            <NavLink to={"/inbox"}>
                <InboxIcon size={iconSize}/>
                {!isMobile && isVisible && "Inbox"}
            </NavLink>
            <NavLink to={"/"} onClick={onMyTasksClick}>
                <TasksIcon size={iconSize}/>
                {!isMobile && isVisible && "My Tasks"}
            </NavLink>
            <NavLink to={"/projects"}>
                <ProjectIcon size={iconSize}/>
                {!isMobile && isVisible && "Projects"}
            </NavLink>
            <NavLink to={"/settings"}>
                <SettingsIcon size={iconSize}/>
                {!isMobile && isVisible && "Settings"}
            </NavLink>
        </div>
    );
}

export default SidebarComponent;