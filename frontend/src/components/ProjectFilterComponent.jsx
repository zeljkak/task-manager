function ProjectFilterComponent({ text, users, selectedUserId, onChange, onUserSelect }) {
    return (
        <div className= {"project-filter"}>
            <input className={"text-filter"} name={"text-filter"}
                   placeholder={"Search"} value={text}
                   onChange={(e) => onChange(e.target.value)} />
            <div className={"created-by-container"}>
                <button type="button"
                        className="created-by-filter">
                    Created By
                </button>
                <div className="created-by-options">
                    <button key={""} type="button"
                            className={"created-by-option no-option"}
                            onClick={() => onUserSelect("")}>Clear
                    </button>
                    {users.map(user => (
                        <button key={user.id} type="button"
                                className={user.id === selectedUserId
                            ? "created-by-option active"
                            : "created-by-option"}
                                onClick={() => onUserSelect(user.id)}
                        >{user.firstName} {user.lastName}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ProjectFilterComponent;