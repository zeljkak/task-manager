import {useEffect, useState} from "react";
import DatePickerComponent from "./DatePickerComponent.jsx";
import {createTask, createTaskAttachment} from "../services/taskService.js";
import BackIcon from "./icons/BackIcon.jsx";

function CreateTaskComponent({ onClose, statuses, projects, priorities, users, onCreated, isMobile }) {
    const [taskData, setTaskData] = useState({
        title: "",
        description: "",
        assignedToId: "",
        statusId: "",
        priorityId: "",
        projectId: "",
        estimatedHours: "",
        dueDate: "",
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
            const taskResponse = await createTask(taskData);
            const createdTask = taskResponse.data.task;

            if (attachments.length > 0) {
                const attachmentData = new FormData();
                attachments.forEach(file => {
                    attachmentData.append("file", file);
                });

                await createTaskAttachment(
                    createdTask.id,
                    attachmentData
                );
            }

            onCreated();
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className={"create-form card"}>
            <form onSubmit={handleSubmit}>
                <div className={"form-title"}>
                    {renderMobileBackButton()}
                    <h4>New task</h4>
                </div>
                <div className={"form-input"}>
                    <div className={"form-element"}>
                        <label htmlFor={"new-task-title"}>Title:</label>
                        <input name={"task-title"} id={"new-task-title"}
                            placeholder={"Enter title"} value={taskData.title}
                            onChange={(e) =>
                                setTaskData(prev => ({
                                    ...prev,
                                    title: e.target.value
                                }))
                            }
                        />
                    </div>
                    <div className={"form-element"}>
                        <label htmlFor={"new-task-description"} className={"inline-form-element"}>Description:</label>
                        <textarea name={"task-description"} className={"inline-form-element"}
                            id={"new-task-description"} placeholder={"Enter description"} value={taskData.description}
                            onChange={(e) =>
                                setTaskData(prev => ({
                                    ...prev,
                                    description: e.target.value
                                }))
                            }
                        />
                    </div>
                    <div className={"form-element inline-form-element"}>
                        <label htmlFor={"assignee-new-task"}>Assignee:</label>
                        <select name={"assignee"} id={"assignee-new-task"}
                            value={taskData.assignedToId}
                            onChange={(e) =>
                                setTaskData(prev => ({
                                    ...prev,
                                    assignedToId: e.target.value ? Number(e.target.value) : ""
                                }))
                            }
                        >
                            <option value={""}>Choose assignee</option>
                            {users.map(user => {
                              return (
                                  <option value={user.id} key={user.id}>{user.firstName} {user.lastName}</option>
                              );
                            })}
                        </select>
                    </div>
                    <div className={"form-element inline-form-element"}>
                        <label htmlFor={"task-status-new-task"}>Task status:</label>
                        <select name={"status"} id={"task-status-new-task"}
                            value={taskData.statusId}
                            onChange={(e) =>
                                setTaskData(prev => ({
                                    ...prev,
                                    statusId: e.target.value ? Number(e.target.value) : ""
                                }))
                            }
                        >
                            <option value={""}>Choose task status</option>
                            {statuses.map(status => {
                              return (
                                  <option value={status.id} key={status.id}>{status.status.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}</option>
                              );
                            })}
                        </select>
                    </div>
                    <div className={"form-element inline-form-element"}>
                        <label htmlFor={"priority-new-task"}>Priority:</label>
                        <select name={"priority"} id={"priority-new-task"}
                            value={taskData.priorityId}
                            onChange={(e) =>
                                setTaskData(prev => ({
                                    ...prev,
                                    priorityId: e.target.value ? Number(e.target.value) : ""
                                }))
                            }
                        >
                            <option value={""}>Choose priority</option>
                            {priorities.map(priority => {
                              return (
                                  <option value={priority.id} key={priority.id}>{priority.level.charAt(0).toUpperCase() + priority.level.slice(1)}</option>
                              );
                            })}
                        </select>
                    </div>
                    <div className={"form-element inline-form-element"}>
                        <label htmlFor={"project-new-task"}>Project:</label>
                        <select name={"project"} id={"project-new-task"}
                            value={taskData.projectId}
                            onChange={(e) =>
                                setTaskData(prev => ({
                                    ...prev,
                                    projectId: e.target.value ? Number(e.target.value) : ""
                                }))
                            }
                        >
                            <option value={""}>Choose project</option>
                            {projects.map(project => {
                              return (
                                  <option value={project.id} key={project.id}>{project.projectName}</option>
                              );
                            })}
                        </select>
                    </div>
                    <div className={"form-element inline-form-element"}>
                        <label htmlFor={"estimated-hours-new-task"}>Estimated hours:</label>
                        <select name={"estimated-hours"} id={"estimated-hours-new-task"}
                            value={taskData.estimatedHours}
                            onChange={(e) =>
                                setTaskData(prev => ({
                                    ...prev,
                                    estimatedHours: e.target.value ? Number(e.target.value) : ""
                                }))
                            }
                        >
                            <option value={""}>Choose estimated hours</option>
                            <option value={1} key={1}>1</option>
                            <option value={2} key={2}>2</option>
                            <option value={3} key={3}>3</option>
                            <option value={4} key={4}>4</option>
                            <option value={5} key={5}>5</option>
                            <option value={6} key={6}>6</option>
                            <option value={7} key={7}>7</option>
                            <option value={8} key={8}>8</option>
                        </select>
                    </div>
                    <div className={"form-element inline-form-element"}>
                        <p>Due date:</p>
                        <DatePickerComponent label={"due-before"}
                            selected={taskData.dueDate}
                            onChange={(date) =>
                                setTaskData(prev => ({
                                    ...prev,
                                    dueDate: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                                }))
                            }
                        />
                    </div>
                    <div className={"form-element inline-form-element"}>
                        <label htmlFor={"new-task-attachment"} className={"attachment-label"}>Attachments:</label>
                        <input type={"file"} id={"new-task-attachment"} multiple
                        onChange={(e) => setAttachments([...e.target.files])} />
                    </div>
                </div>
                <button type={"submit"}>Create</button>
            </form>
        </div>
    );
}


export default CreateTaskComponent;