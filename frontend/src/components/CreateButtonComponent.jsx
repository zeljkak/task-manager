import CreateIcon from "./icons/CreateIcon.jsx";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import {useEffect, useState} from "react";
import CreateProjectComponent from "./CreateProjectComponent.jsx";
import CreateTaskComponent from "./CreateTaskComponent.jsx";

function CreateButtonComponent ({ isMobile, type, statuses, projects, priorities, users, onCreated }) {
    const title = "New " + type;
    const iconSize = isMobile ? 34 : 24;
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const instances = tippy('.create-button-container [data-tippy-content]', {
            placement: 'bottom',
            duration: 150,
        });

        return () => {
            instances.forEach(instance => instance.destroy());
        };
    }, [isMobile, type]);

    return (
        <>
            <div className={"create-button-container"}>
                <button className={"create-button"}
                        data-tippy-content={!isMobile ? title : undefined}
                        onClick={() => setOpen(true)}>
                    <CreateIcon size={iconSize}/>
                </button>
            </div>
            {open && type === "project" && (
                <div className={"modal-overlay"}>
                    <CreateProjectComponent onClose={() => setOpen(false)}
                        onCreated={onCreated} isMobile={isMobile} />
                </div>
            )}

            {open && type === "task" && (
                <div className={"modal-overlay"}>
                    <CreateTaskComponent onClose={() => setOpen(false)} users={users}
                         statuses={statuses} projects={projects} priorities={priorities}
                         onCreated={onCreated} isMobile={isMobile} />
                </div>
            )}
        </>
    );
};

export default CreateButtonComponent;