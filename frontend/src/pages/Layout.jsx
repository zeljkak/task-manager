import {useState, useEffect, useCallback} from "react";
import {Outlet} from "react-router-dom";
import SidebarComponent from "../components/SidebarComponent.jsx";
import {getUsers} from "../services/userService.js";
import {getTaskStatuses} from "../services/taskStatusService.js";
import {getPriorities} from "../services/priorityService.js";
import {getProjects} from "../services/projectService.js";

export default function Layout() {
    const [isVisible, setIsVisible] = useState(
        () => window.innerWidth > 500 && window.innerHeight > 400
    );
    const [isMobile, setIsMobile] = useState(
        () => window.innerWidth <= 500 && window.innerHeight <= 400
    );
    const [resetMyTasksKey, setResetMyTasksKey] = useState(0);

    const [users, setUsers] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [projects, setProjects] = useState([]);
    const [dropdownsLoading, setDropdownsLoading] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 500 || window.innerHeight <= 400;
            setIsMobile(mobile);

            if (mobile) {
                setIsVisible(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const refreshDropdowns = useCallback(async () => {
        try {
            const [usersRes, statusesRes, prioritiesRes, projectsRes] = await Promise.all([
                getUsers(),
                getTaskStatuses(),
                getPriorities(),
                getProjects()
            ]);

            setUsers(usersRes.data.users || []);
            setStatuses(statusesRes.data.taskStatuses || []);
            setPriorities(prioritiesRes.data.priorities || []);
            setProjects(projectsRes.projects || []);
        } catch (err) {
            console.error("Failed to refresh shared options:", err);
        } finally {
            setDropdownsLoading(false);
        }
    }, []);

    // Initial load on mount
    useEffect(() => {
        refreshDropdowns();
    }, [refreshDropdowns]);

    const triggerTaskRefresh = () => {
        setResetMyTasksKey(prev => prev + 1);
    };

    return (
        <>
            <SidebarComponent
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                isMobile={isMobile}
                onMyTasksClick={triggerTaskRefresh}
            />

            <div id="content">
                <Outlet context={{ resetMyTasksKey, triggerTaskRefresh, isMobile, users, statuses,
                    priorities, projects, dropdownsLoading, refreshDropdowns}}/>
            </div>
        </>
    );
}