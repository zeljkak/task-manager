import {useState} from "react";
import {Outlet} from "react-router-dom";
import SidebarComponent from "../components/SidebarComponent.jsx";

export default function Layout() {
    const [isVisible, setIsVisible] = useState(true);

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