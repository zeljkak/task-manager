import {useState} from "react";
import SidebarComponent from "../components/SidebarComponent.jsx";
import {Outlet, useLocation} from "react-router-dom";

export default function Layout() {
    const [isVisible, setIsVisible] = useState(true);

    const location = useLocation();
    const isHome = location.pathname === "/";
    const isProjects = location.pathname === "/projects";


    return (
        <><SidebarComponent
            isVisible={isVisible}
            setIsVisible={setIsVisible}
        />

        <div id="content" className={isHome ? "all-tasks" : isProjects ? "all-projects" : ""}>
            <Outlet />
        </div></>
    );
}