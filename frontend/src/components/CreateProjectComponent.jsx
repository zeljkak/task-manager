import {useEffect, useState} from "react";
import {createProject, createProjectAttachment} from "../services/projectService.js";
import BackIcon from "./icons/BackIcon.jsx";

function CreateProjectComponent({ onClose, onCreated, isMobile }) {
    const [projectData, setProjectData] = useState({
        projectName: "",
        projectDescription: "",
    });

    const [attachments, setAttachments] = useState([]);

    const iconSize = isMobile ? 34 : 24;

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

    const renderMobileBackButton = () => {
        if (!isMobile) return null;
        return (
            <button type="button" className="submenu-back-button"
                onClick={onClose}>
                <BackIcon size={iconSize} />
            </button>
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const projectResponse = await createProject(projectData);
            const createdProject = projectResponse.data.project;

            if (attachments.length > 0) {
                const attachmentData = new FormData();
                attachments.forEach(file => {
                    attachmentData.append("file", file);
                });

                await createProjectAttachment(
                    createdProject.id,
                    attachmentData
                );
            }

            onCreated();
            onClose();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className={"create-form card"}>
            <form onSubmit={handleSubmit}>
                <div className={"form-title"}>
                    {renderMobileBackButton()}
                    <h4>New project</h4>
                </div>
                <div className={"form-input"}>
                    <div className={"form-element"}>
                        <label htmlFor={"new-project-name"}>Name:</label>
                        <input name={"project-name"} id={"new-project-name"}
                           placeholder={"Enter name"} value={projectData.projectName}
                           onChange={(e) =>
                               setProjectData(prev => ({
                                   ...prev,
                                   projectName: e.target.value
                               }))
                           }
                        />
                    </div>
                    <div className={"form-element"}>
                        <label htmlFor={"new-project-description"}>Description:</label>
                        <textarea name={"project-description"} id={"new-project-description"}
                           placeholder={"Enter description"} value={projectData.projectDescription}
                           onChange={(e) =>
                               setProjectData(prev => ({
                                   ...prev,
                                   projectDescription: e.target.value
                               }))
                           }
                        />
                    </div>
                    <div className={"form-element inline-form-element"}>
                        <label htmlFor={"new-project-attachment"} className={"attachment-label"}>Attachments:</label>
                        <input type={"file"} id={"new-project-attachment"} multiple
                        onChange={(e) => setAttachments([...e.target.files])} />
                    </div>
                </div>
                <button type={"submit"}>Create</button>
            </form>
        </div>
    );
}

export default CreateProjectComponent;