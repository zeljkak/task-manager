function FilterComponent({ element, text, onChange }) {
    return (
        <div className= {[element, "filter"].join("-")}>
            <input className={"text-filter"}
                   placeholder={"Search"} value={text}
                   onChange={(e) => onChange(e.target.value)} />

        </div>
    );
}

export default FilterComponent;