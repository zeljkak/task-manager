import {useState, useEffect, useCallback, useLayoutEffect} from "react";
import {Outlet, useLocation} from "react-router-dom";
import SidebarComponent from "../components/SidebarComponent.jsx";
import {getUsers} from "../services/userService.js";
import {getTaskStatuses} from "../services/taskStatusService.js";
import {getPriorities} from "../services/priorityService.js";
import {getProjects} from "../services/projectService.js";

const checkIsMobile = () => window.innerWidth <= 500 || window.innerHeight <= 400;
const checkIsDraggable = () => window.innerWidth <= 700;

export default function Layout() {
    const location = useLocation();

    const [isVisible, setIsVisible] = useState(() => !checkIsMobile());
    const [isMobile, setIsMobile] = useState(() => checkIsMobile());
    const [isDraggable, setIsDraggable] = useState(() => checkIsDraggable());
    const [resetMyTasksKey, setResetMyTasksKey] = useState(0);

    const [users, setUsers] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [projects, setProjects] = useState([]);
    const [dropdownsLoading, setDropdownsLoading] = useState(true);

    // capture clicks on any element with a `data-scroll-target` attribute
    useEffect(() => {
        const handleGlobalClick = (event) => {
            const targetElement = event.target.closest("[data-scroll-target]");
            if (targetElement) {
                const targetId = targetElement.getAttribute("data-scroll-target") || targetElement.id;
                if (targetId) {
                    sessionStorage.setItem("global_scroll_target", targetId);
                }
            }
        };

        document.addEventListener("click", handleGlobalClick);
        return () => document.removeEventListener("click", handleGlobalClick);
    }, []);

    // restore scroll position when returning or navigating to a route
    useLayoutEffect(() => {
        const targetId = sessionStorage.getItem("global_scroll_target");
        if (!targetId) return;

        let attempts = 0;
        const maxAttempts = 30;

        const interval = setInterval(() => {
            const element = document.getElementById(targetId);
            attempts++;

            if (element) {
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                    inline: "center"
                });
                sessionStorage.removeItem("global_scroll_target");
                clearInterval(interval);
            } else if (attempts >= maxAttempts) {
                // Stop checking if the card was deleted or never loads
                clearInterval(interval);
            }
        }, 100);


        return () => clearInterval(interval);
    }, [location.pathname]);

    // handle window resizing
    useEffect(() => {
        const handleResize = () => {
            const mobile = checkIsMobile();
            setIsMobile(mobile);

            const draggable = checkIsDraggable();
            setIsDraggable(draggable);

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

    // initial load on mount
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
                <Outlet context={{ resetMyTasksKey, triggerTaskRefresh, isMobile, isDraggable, users, statuses,
                    priorities, projects, dropdownsLoading, refreshDropdowns}}/>
            </div>
        </>
    );
}