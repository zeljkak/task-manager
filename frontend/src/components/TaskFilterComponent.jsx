function TaskFilterComponent({ text, users, selectedAssigneeId, selectedFollowerId, onChange, onAssigneeSelect, onFollowerSelect }) {
    return (
        <div className= {"task-filter"}>
            <input className={"text-filter"} name={"text-filter"}
                   placeholder={"Search"} value={text}
                   onChange={(e) => onChange(e.target.value)} />
            <div className={"assigned-to-container"}>
                <button type="button" className={"assigned-to-filter"}>
                    Assignees
                </button>
                <div className={"assigned-to-options"}>
                    <button key={""} type="button"
                            className={"assigned-to-option no-option"}
                            onClick={() => onAssigneeSelect("")}>Clear
                    </button>
                    {users.map(user => (
                        <button key={user.id} type="button"
                                className={user.id === selectedAssigneeId
                                ? "assigned-to-option active"
                                : "assigned-to-option"}
                                onClick={() => onAssigneeSelect(user.id)}>
                            {user.firstName} {user.lastName}
                        </button>
                    ))}
                </div>
            </div>
            <div className={"followed-by-container"}>
                <button type="button" className={"followed-by-filter"}>
                    Followers
                </button>
                <div className={"followed-by-options"}>
                    <button key={""} type="button"
                            className={"followed-by-option no-option"}
                            onClick={() => onFollowerSelect("")}>Clear
                    </button>
                    {users.map(user => (
                        <button key={user.id} type="button"
                                className={user.id === selectedFollowerId
                                ? "followed-by-option active"
                                : "followed-by-option"}
                                onClick={() => onFollowerSelect(user.id)}>
                            {user.firstName} {user.lastName}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TaskFilterComponent;