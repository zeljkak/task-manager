import CreateIcon from "./icons/CreateIcon.jsx";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import {useEffect, useState} from "react";
import CreateProjectComponent from "./CreateProjectComponent.jsx";
import CreateTaskComponent from "./CreateTaskComponent.jsx";

function CreateButtonComponent ({ isMobile, type }) {
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
                <CreateProjectComponent onClose={() => setOpen(false)} />
            )}

            {open && type === "task" && (
                <CreateTaskComponent onClose={() => setOpen(false)} />
            )}
        </>
    );
};

export default CreateButtonComponent;