import {useState, useEffect} from "react";
import {Outlet} from "react-router-dom";
import SidebarComponent from "../components/SidebarComponent.jsx";

export default function Layout() {
    const [isVisible, setIsVisible] = useState(
        () => window.innerWidth > 500
    );
    const [isMobile, setIsMobile] = useState(
        () => window.innerWidth <= 500
    );
    const [resetMyTasksKey, setResetMyTasksKey] = useState(0);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 500;

            setIsMobile(mobile);

            if (mobile) {
                setIsVisible(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const onMyTasksClick = () => {
        setResetMyTasksKey(prev => prev + 1);
    };

    return (
        <><SidebarComponent
            isVisible={isVisible}
            setIsVisible={setIsVisible}
            isMobile={isMobile}
            onMyTasksClick={onMyTasksClick}
        />

        <div id="content">
            <Outlet context={{ resetMyTasksKey }}/>
        </div></>
    );
}