import {useState} from "react";
import SidebarComponent from "../components/SidebarComponent.jsx";
import {Outlet, useLocation} from "react-router-dom";

export default function Layout() {
    const [isVisible, setIsVisible] = useState(true);

    const location = useLocation();

    return (
        <><SidebarComponent
            isVisible={isVisible}
            setIsVisible={setIsVisible}
        />

        <div id="content">
            <Outlet />
        </div></>
    );
}