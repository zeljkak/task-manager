import {useEffect, useRef, useState} from "react";
import DatePickerComponent from "./DatePickerComponent.jsx";
import BackIcon from "./icons/BackIcon.jsx";

function ProjectFilterComponent({ text, users, selectedCreatedBefore,
        selectedCreatedAfter, selectedUserId, onChange, onUserSelect,
        onCreatedBeforeSelect, onCreatedAfterSelect, isMobile }) {

    const [isMainOpen, setIsMainOpen] = useState(false);
    const [activeSubMenu, setActiveSubMenu] = useState(null);

    const filterRef = useRef(null);

    const selectedBeforeDate = selectedCreatedBefore ? new Date(selectedCreatedBefore) : null;
    const selectedAfterDate = selectedCreatedAfter ? new Date(selectedCreatedAfter) : null;

    const iconSize = isMobile ? 34 : 24;

    useEffect(() => {
        function handleClickOutside(event) {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsMainOpen(false);
                setActiveSubMenu(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleMainFilter = () => {
        setIsMainOpen(!isMainOpen);
        if (isMainOpen) setActiveSubMenu(null);
    };

    const toggleSubMenu = (menuName) => {
        setActiveSubMenu(activeSubMenu === menuName ? null : menuName);
    };

    const renderMobileBackButton = () => {
        if (!isMobile) return null;
        return (
            <button type="button" className="submenu-back-button"
                onClick={() => setActiveSubMenu(null)}>
                <BackIcon size={iconSize} />
            </button>
        );
    };

    return (
        <div className={"projects-filter"} ref={filterRef}>
            <div className={`filter-button-container ${isMainOpen ? 'open' : ''}`}>
                <button type={"button"} className={"filter-button"} onClick={toggleMainFilter}>
                    Filter
                </button>
                <div className={"filter-options"}>
                    <div className={`created-by-container ${activeSubMenu === 'creator' ? 'open' : ''}`}>
                        <button type="button" className="created-by-filter"
                            onClick={() => toggleSubMenu('creator')}>
                            Creator
                        </button>
                        <div className="created-by-options">
                            {renderMobileBackButton()}
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
                    <div className={`created-date-container ${activeSubMenu === 'createdDate' ? 'open' : ''}`}>
                        <button type="button" className="created-date-filter"
                            onClick={() => toggleSubMenu('createdDate')}>Created
                        </button>
                        <div className="created-date-options">
                            {renderMobileBackButton()}
                            <button key={""} type="button"
                                 className={"created-date-option no-option"}
                                 onClick={() => [onCreatedBeforeSelect(""), onCreatedAfterSelect("")]}>Clear
                            </button>
                            <DatePickerComponent label={"created-before"}
                                 selected={selectedBeforeDate && !isNaN(selectedBeforeDate.getTime()) ? selectedBeforeDate : null}
                                 onChange={(date) => onCreatedBeforeSelect(date)}
                            />
                            <DatePickerComponent label={"created-after"}
                                 selected={selectedAfterDate && !isNaN(selectedAfterDate.getTime()) ? selectedAfterDate : null}
                                 onChange={(date) => onCreatedAfterSelect(date)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <input className={"text-filter"} name={"text-filter"}
                   placeholder={"Search"} value={text}
                   onChange={(e) => onChange(e.target.value)}
            />
            <div className={"clear-all-container"}>
                <button key={"clear-all"} type="button"
                        className={"clear-filter"}
                        onClick={() => [onChange(""), onUserSelect(""),
                            onCreatedBeforeSelect(""), onCreatedAfterSelect("")
                        ]}>
                        Clear All
                </button>
            </div>
        </div>
    );
}

export default ProjectFilterComponent;