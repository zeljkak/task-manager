import {NavLink} from "react-router-dom";
import {useEffect} from "react";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
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
            <NavLink to={"/profile"} data-tippy-content={tooltipText("Profile")}>
                <UserIcon size={iconSize}/>
                {!isMobile && isVisible && "Profile"}
            </NavLink>
            <NavLink to={"/inbox"} data-tippy-content={tooltipText("Inbox")}>
                <InboxIcon size={iconSize}/>
                {!isMobile && isVisible && "Inbox"}
            </NavLink>
            <NavLink to={"/"} onClick={onMyTasksClick}
                data-tippy-content={tooltipText("My Tasks")}>
                <TasksIcon size={iconSize}/>
                {!isMobile && isVisible && "My Tasks"}
            </NavLink>
            <NavLink to={"/projects"} data-tippy-content={tooltipText("Projects")}>
                <ProjectIcon size={iconSize}/>
                {!isMobile && isVisible && "Projects"}
            </NavLink>
            <NavLink to={"/settings"} data-tippy-content={tooltipText("Settings")}>
                <SettingsIcon size={iconSize}/>
                {!isMobile && isVisible && "Settings"}
            </NavLink>
        </div>
    );
}

export default SidebarComponent;