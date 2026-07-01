import {useState} from "react";
import {Outlet} from "react-router-dom";
import SidebarComponent from "../components/SidebarComponent.jsx";

export default function Layout() {
    const [isVisible, setIsVisible] = useState(true);
    const [resetMyTasksKey, setResetMyTasksKey] = useState(0);
    const onMyTasksClick = () => {
        setResetMyTasksKey(prev => prev + 1);
    };

    return (
        <><SidebarComponent
            isVisible={isVisible}
            setIsVisible={setIsVisible}
            onMyTasksClick={onMyTasksClick}
        />

        <div id="content">
            <Outlet context={{ resetMyTasksKey }}/>
        </div></>
    );
}