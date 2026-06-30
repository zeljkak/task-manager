function TaskFilterComponent({ text, onChange }) {
    return (
        <div className= {"task-filter"}>
            <input className={"text-filter"}
                   placeholder={"Search"} value={text}
                   onChange={(e) => onChange(e.target.value)} />


        </div>
    );
}

export default TaskFilterComponent;