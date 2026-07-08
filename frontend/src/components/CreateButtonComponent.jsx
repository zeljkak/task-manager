import CreateIcon from "./icons/CreateIcon.jsx";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import {useEffect} from "react";

function CreateButtonComponent ({ isMobile, type }) {
    const title = "New " + type;
    const iconSize = isMobile ? 34 : 24;

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
        <div className={"create-button-container"}>
            <button className={"create-button"}
                    data-tippy-content={!isMobile ? title : undefined} >
                <CreateIcon size={iconSize}/>
            </button>
        </div>
    );
};

export default CreateButtonComponent;