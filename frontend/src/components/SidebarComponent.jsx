import {NavLink} from "react-router-dom";
import ThemeIcon from "./icons/ThemeIcon.jsx";
import UserIcon from "./icons/UserIcon.jsx";
import InboxIcon from "./icons/InboxIcon.jsx";
import TasksIcon from "./icons/TasksIcon.jsx";
import ProjectIcon from "./icons/ProjectIcon.jsx";
import SettingsIcon from "./icons/SettingsIcon.jsx";

function SidebarComponent({ isVisible, setIsVisible, onMyTasksClick }) {

    const toggleSidebar = () => {
        setIsVisible(prev => !prev);
    };

    return (
        <div id={"sidebar"} className={isVisible ? "expanded" : "collapsed"}>
            <button onClick={toggleSidebar}>
                <ThemeIcon state={isVisible} size={24}/>
            </button>
            <NavLink to={"/profile"}>
                <UserIcon size={24}/>
                {isVisible && "Profile"}
            </NavLink>
            <NavLink to={"/inbox"}>
                <InboxIcon size={24}/>
                {isVisible && "Inbox"}
            </NavLink>
            <NavLink to={"/"} onClick={onMyTasksClick}>
                <TasksIcon size={24}/>
                {isVisible && "My Tasks"}
            </NavLink>
            <NavLink to={"/projects"}>
                <ProjectIcon size={24}/>
                {isVisible && "Projects"}
            </NavLink>
            <NavLink to={"/settings"}>
                <SettingsIcon size={24}/>
                {isVisible && "Settings"}
            </NavLink>
        </div>
    );
}

export default SidebarComponent;