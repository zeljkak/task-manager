import {useEffect, useState} from "react";
import DatePickerComponent from "./DatePickerComponent.jsx";

function CreateTaskComponent({ onClose, statuses, projects, priorities }) {
    const [dueDate, setDueDate] = useState(new Date());

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
                <h4>New task</h4>
                <div className={"form-input"}>
                    <div className={"form-element"}>
                        <label htmlFor={"new-task-title"}>Title:</label>
                        <input name={"task-title"} id={"new-task-title"} placeholder={"Enter title"} />
                    </div>
                    <div className={"form-element"}>
                        <label htmlFor={"new-task-description"} className={"inline-form-element"}>Description:</label>
                        <textarea name={"task-description"} className={"inline-form-element"} id={"new-task-description"} placeholder={"Enter description"} />
                    </div>
                    <div className={"form-element inline-form-element"}>
                        <label htmlFor={"assignee-new-task"}>Assignee:</label>
                        <select name={"assignee"}
                            id={"assignee-new-task"} defaultValue={""}>
                            <option value={""}></option>
                        </select>
                    </div>
                    <div className={"form-element inline-form-element"}>
                        <label htmlFor={"task-status-new-task"}>Task status:</label>
                        <select name={"status"}
                            id={"task-status-new-task"} defaultValue={""}>
                            <option value={""}>Choose task status</option>
                        </select>
                    </div>
                    <div className={"form-element inline-form-element"}>
                        <label htmlFor={"priority-new-task"}>Priority:</label>
                        <select name={"priority"}
                            id={"priority-new-task"} defaultValue={""}>
                            <option value={""}>Choose priority</option>
                        </select>
                    </div>
                    <div className={"form-element inline-form-element"}>
                        <label htmlFor={"project-new-task"}>Project:</label>
                        <select name={"project"}
                            id={"project-new-task"} defaultValue={""}>
                            <option value={""}>Choose project</option>
                        </select>
                    </div>
                    <div className={"form-element inline-form-element"}>
                        <label htmlFor={"estimated-hours-new-task"}>Estimated hours:</label>
                        <select name={"estimated-hours"}
                            id={"estimated-hours-new-task"} defaultValue={""}>
                            <option value={""}>Choose estimated hours</option>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                            <option value={6}>6</option>
                            <option value={7}>7</option>
                            <option value={8}>8</option>
                        </select>
                    </div>
                    <div className={"form-element inline-form-element"}>
                        <p>Due date:</p>
                        <DatePickerComponent label={"due-before"}
                             selected={dueDate}
                             onChange={(date) => {setDueDate(date)}}
                        />
                    </div>
                    <div className={"form-element inline-form-element"}>
                        <label htmlFor={"new-task-attachment"} className={"attachment-label"}>Attachments:</label>
                        <input type={"file"} id={"new-task-attachment"} />
                    </div>
                </div>
                <button type={"submit"}>Create</button>
            </form>
        </div>
    );
}


export default CreateTaskComponent;