import ThemeIcon from "./icons/ThemeIcon.jsx";
import UserIcon from "./icons/UserIcon.jsx";
import InboxIcon from "./icons/InboxIcon.jsx";
import TasksIcon from "./icons/TasksIcon.jsx";
import ProjectIcon from "./icons/ProjectIcon.jsx";
import SettingsIcon from "./icons/SettingsIcon.jsx";

function SidebarComponent({ isVisible, setIsVisible }) {

    const toggleSidebar = () => {
        setIsVisible(prev => !prev);
    };

    return (
        <div id={"sidebar"} className={isVisible ? "expanded" : "collapsed"}>
            <button onClick={toggleSidebar}>
                <ThemeIcon state={isVisible} size={24}/>
            </button>
            <a href={"#"}>
                <UserIcon size={24}/>
                {isVisible && "Profile"}
            </a>
            <a href={"#"}>
                <InboxIcon size={24}/>
                {isVisible && "Inbox"}
            </a>
            <a href={"#"}>
                <TasksIcon size={24}/>
                {isVisible && "My Tasks"}
            </a>
            <a href={"#"}>
                <ProjectIcon size={24}/>
                {isVisible && "Projects"}
            </a>
            <a href={"#"}>
                <SettingsIcon size={24}/>
                {isVisible && "Settings"}
            </a>
        </div>
    );
}

export default SidebarComponent;