import {useEffect, useState} from "react";

function CreateProjectComponent({ onClose }) {
    useEffect(() => {
        function handleClickOutside(event) {
            const clickedInsideForm = event.target.closest('.create-form');

            if (!clickedInsideForm) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div className={"create-form card"}>
            <form action={"post"}>
                <h4>New project</h4>
                <div className={"form-input"}>
                    <div className={"form-element"}>
                        <label htmlFor={"new-project-name"}>Name:</label>
                        <input name={"project-name"} id={"new-project-name"} placeholder={"Enter name"} />
                    </div>
                    <div className={"form-element"}>
                        <label htmlFor={"new-project-description"}>Description:</label>
                        <textarea name={"project-description"} id={"new-project-description"} placeholder={"Enter description"} />
                    </div>
                    <div className={"form-element inline-form-element"}>
                        <label htmlFor={"new-project-attachment"} className={"attachment-label"}>Attachments:</label>
                        <input type={"file"} id={"new-project-attachment"} />
                    </div>
                </div>
                <button type={"submit"}>Create</button>
            </form>
        </div>
    );
}

export default CreateProjectComponent;