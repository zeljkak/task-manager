import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function ProjectFilterComponent({ text, users, selectedCreatedBefore, selectedCreatedAfter, selectedUserId, onChange, onUserSelect, onCreatedBeforeSelect, onCreatedAfterSelect }) {
    const selectedBeforeDate = selectedCreatedBefore ? new Date(selectedCreatedBefore) : null;
    const selectedAfterDate = selectedCreatedAfter ? new Date(selectedCreatedAfter) : null;

    return (
        <div className= {"project-filter"}>
            <input className={"text-filter"} name={"text-filter"}
                   placeholder={"Search"} value={text}
                   onChange={(e) => onChange(e.target.value)} />
            <div className={"created-by-container"}>
                <button type="button"
                        className="created-by-filter">
                    Creator
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
            <div className={"created-date-container"}>
                <button type="button"
                    className="created-date-filter">
                Created
                </button>
                <div className="created-date-options">
                    <button key={""} type="button"
                            className={"created-date-option no-option"}
                            onClick={() => [onCreatedBeforeSelect(""), onCreatedAfterSelect("")]}>Clear
                    </button>
                    <div className={"date-grouped"}>
                        <label htmlFor={"created-before"}>Before</label>
                        <DatePicker className={"created-date-option"}
                            id={"created-before"}
                            selected={selectedBeforeDate && !isNaN(selectedBeforeDate) ? selectedBeforeDate : null}
                            onChange={(date) => onCreatedBeforeSelect(date)}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="yyyy-MM-dd"
                        />
                    </div>
                    <div className={"date-grouped"}>
                        <label htmlFor={"created-after"}>After</label>
                        <DatePicker className={"created-date-option"}
                            id={"created-after"}
                            selected={selectedAfterDate && !isNaN(selectedAfterDate) ? selectedAfterDate : null}
                            onChange={(date) => onCreatedAfterSelect(date)}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="yyyy-MM-dd"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProjectFilterComponent;