import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { isFileAllowed } from "../utils/fileValidation.js";
import { createProjectAttachment, updateProject, archiveProject, unarchiveProject } from "../services/projectService.js";
import { deleteAttachment } from "../services/attachmentService.js";
import AttachmentIcon from "../components/icons/AttachmentIcon.jsx";
import DeleteIcon from "../components/icons/DeleteIcon.jsx";

function ProjectEditComponent({ project, renderMobileBackButton,
    iconSize, user, syncUpdates}) {

    const [titleError, setTitleError] = useState("");
    const [attachmentError, setAttachmentError] = useState("");
    const [deletingAttachmentId, setDeletingAttachmentId] = useState(null);

    const titleErrorRef = useRef(null);
    const attachmentErrorRef = useRef(null);

    const [projectData, setProjectData] = useState({
        projectName: project?.projectName || "",
        projectDescription: project?.projectDescription || "",
        archived: Boolean(project?.archived),
    });

    const debounceTimeoutRef = useRef(null);
    const lastValidTitleRef = useRef(project?.projectName || "");

    useEffect(() => {
        setProjectData({
            projectName: project?.projectName || "",
            projectDescription: project?.projectDescription || "",
            archived: Boolean(project?.archived),
        });
        lastValidTitleRef.current = project?.projectName || "";
    }, [project]);

    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (titleError && titleErrorRef.current) {
            requestAnimationFrame(() => {
                titleErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            });
        }
    }, [titleError]);

    useEffect(() => {
        if (attachmentError && attachmentErrorRef.current) {
            requestAnimationFrame(() => {
                attachmentErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            });
        }
    }, [attachmentError]);

    const submitProjectUpdate = async (updatedProjectData) => {
        try {
            await updateProject(project.id, {
                projectName: updatedProjectData.projectName,
                projectDescription: updatedProjectData.projectDescription
            });
            await syncUpdates();
        } catch (error) {
            console.error("Failed to update project: ", error);
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        if (name === "projectName" || name === "projectDescription") {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            const propValue = name === "projectName" ? project?.projectName : project?.projectDescription;
            if ((value || "") !== (propValue || "")) {
                const currentData = {
                    ...projectData,
                    [name]: value
                };
                submitProjectUpdate(currentData);
            }
        }
    };

    const handleArchiveToggle = async (e) => {
        const isArchiving = e.target.value === "true";
        setProjectData(prev => ({ ...prev, archived: isArchiving }));

        try {
            if (isArchiving) {
                await archiveProject(project.id);
            } else {
                await unarchiveProject(project.id);
            }
            await syncUpdates();
        } catch (error) {
            console.error("Failed to update archive status:", error);
            setProjectData(prev => ({ ...prev, archived: Boolean(project?.archived) }));
        }
    };

    const handleChange = async (e) => {
        const { name, value: rawValue, files } = e.target;

        if (name === "projectName") {
            if (!rawValue.trim()) {
                setTitleError("Title is required.");

                setProjectData(prev => ({
                    ...prev,
                    projectName: lastValidTitleRef.current
                }));

                setTimeout(() => {
                    setTitleError("");
                }, 3000);

                return;
            }

            lastValidTitleRef.current = rawValue;
            setTitleError("");
        }

        if (name === "attachments") {
            const fileList = [...files];
            if (fileList.length === 0) return;

            const MAX_SIZE = 10 * 1024 * 1024;
            const oversizedFile = fileList.find(file => file.size > MAX_SIZE);
            const invalidFile = fileList.find(file => !isFileAllowed(file));

            if (invalidFile) {
                setAttachmentError(`"${invalidFile.name}" has an invalid file type.`);
                setTimeout(() => setAttachmentError(""), 4000);
                e.target.value = "";
                return;
            }

            if (oversizedFile) {
                setAttachmentError(`"${oversizedFile.name}" exceeds the 10 MB limit.`);
                setTimeout(() => setAttachmentError(""), 4000);
                e.target.value = ""; // Reset input
                return;
            }

            try {
                const attachmentData = new FormData();
                fileList.forEach(file => {
                    attachmentData.append("file", file);
                });

                await createProjectAttachment(project.id, attachmentData);
                setAttachmentError("");
                await syncUpdates();
            } catch (error) {
                console.error("Failed to upload attachments: ", error);
                const serverError = error.response?.data?.message || error.response?.data?.error || "Failed to upload file.";
                setAttachmentError(serverError);
                setTimeout(() => setAttachmentError(""), 4000);
            } finally {
                e.target.value = ""; // Reset input so re-selecting same file works
            }
            return;
        }

        const value = rawValue === "" ? null : rawValue;

        const updatedProjectData = {
            ...projectData,
            [name]: value
        };

        setProjectData(updatedProjectData);

        if (name === "projectName" || name === "projectDescription") {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            debounceTimeoutRef.current = setTimeout(() => {
                submitProjectUpdate(updatedProjectData);
            }, 1000);
        } else {
            await submitProjectUpdate(updatedProjectData);
        }
    };

    const handleAttachmentDelete = async (attachmentId) => {
        try {
            await deleteAttachment(attachmentId);
            await syncUpdates();
        } catch (error) {
            console.error("Failed to delete attachment: ", error);
        }
    };

    return (
        <div className="project-edit">
            <form onSubmit={(e) => e.preventDefault()}>
                <div className="form-title">
                    {renderMobileBackButton()}
                    <h4>
                        <input type="text" name="projectName" onBlur={handleBlur}
                            value={projectData.projectName} onChange={handleChange}
                        />
                    </h4>
                </div>
                {titleError && (
                    <div className="error-message" ref={titleErrorRef}>
                        <p className="error">{titleError}</p>
                    </div>
                )}
                <div className="form-input">
                    <div className="form-element">
                        <textarea name="projectDescription" className="inline-form-element"
                            placeholder="Enter description" value={projectData.projectDescription}
                            onChange={handleChange} onBlur={handleBlur}
                        />
                    </div>
                    <div className="form-element">
                        <label>Status:</label>
                        <select
                            name="archived"
                            value={projectData.archived ? "true" : "false"}
                            onChange={handleArchiveToggle}
                        >
                            <option value="false">Active</option>
                            <option value="true">Archived</option>
                        </select>
                    </div>
                    <div className="form-element attach">
                        <div className="inline-form-element">
                            <p className="attachments-title">Attachments:</p>
                            <label htmlFor={`project-${project.id}-attachment`} className="attachment-label">
                                <AttachmentIcon size={iconSize} />
                            </label>
                            <input type="file" name="attachments" className="attachment-input"
                                accept=".png,.jpg,.jpeg,.gif,.svg,.webp,.pdf,.docx,.txt,.csv,.xlsx,.xls,.pptx"
                                id={`project-${project.id}-attachment`} multiple onChange={handleChange}
                            />
                        </div>
                        {project?.attachments && project?.attachments.length > 0 && (
                            <div className="listed-attachments">
                                {project.attachments.map((file) => {
                                    const isAuthor = Boolean(
                                        user?.id && (
                                            file.createdBy?.id === user.id
                                        )
                                    );
                                    return (
                                        <div key={file.id} className="attachment-chip">
                                            {isAuthor ? (
                                                deletingAttachmentId === file.id ? (
                                                    createPortal(
                                                        <div className="confirmation-overlay">
                                                            <div className="confirmation-div">
                                                                <p>
                                                                    Delete <a href={file.fileUrl} target="_blank"
                                                                              rel="noopener noreferrer"
                                                                              className="file-name">{file.fileName}</a>?
                                                                </p>
                                                                <div className="confirmation-actions">
                                                                    <button type="button" className="positive"
                                                                            onClick={() => {
                                                                                handleAttachmentDelete(file.id);
                                                                                setDeletingAttachmentId(null);
                                                                            }}>
                                                                        Yes
                                                                    </button>
                                                                    <button type="button" className="negative"
                                                                            onClick={() => setDeletingAttachmentId(null)}>
                                                                        No
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>,
                                                        document.getElementById("content") || document.body
                                                    )
                                                ) : (
                                                    <>
                                                        <button type="button"
                                                                onClick={() => setDeletingAttachmentId(file.id)}>
                                                            <DeleteIcon size={iconSize}/>
                                                        </button>
                                                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer"
                                                           className="file-name">
                                                            {file.fileName}
                                                        </a>
                                                    </>
                                                )
                                            ) : (
                                                <>
                                                    <span className={"attachment-icon-wrapper"}><AttachmentIcon size={iconSize}/></span>
                                                    <a href={file.fileUrl} target="_blank" rel="noopener noreferrer"
                                                       className="file-name">
                                                        {file.fileName}
                                                    </a>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {attachmentError && (
                            <div className="error-message" ref={attachmentErrorRef}>
                                <p className="error">{attachmentError}</p>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}

export default ProjectEditComponent;