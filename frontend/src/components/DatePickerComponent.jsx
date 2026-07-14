import {useRef, useEffect} from 'react';
import Picker from 'react-mobile-picker';

function DatePickerComponent({ label, selected, onChange }) {
    const [firstWord , secondWord] = label.split("-");
    const labelValue = secondWord.charAt(0).toUpperCase() + secondWord.slice(1);
    const pickerClass = firstWord + "-date-option";

    const wrapperRef = useRef(null);
    const isScrollingRef = useRef(false);

    const currentDate = selected && !isNaN(new Date(selected)) ? new Date(selected) : new Date();

    const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const years = Array.from({ length: 16 }, (_, i) => String(2020 + i));

    const selections = {
        month: months[currentDate.getMonth()],
        day: String(currentDate.getDate()).padStart(2, '0'),
        year: String(currentDate.getFullYear())
    };

    const handleValueChange = (newValue) => {
        const monthIndex = months.indexOf(newValue.month);
        const dateStr = `${newValue.year}-${String(monthIndex + 1).padStart(2, '0')}-${newValue.day}`;
        onChange(new Date(dateStr));
    };

    useEffect(() => {
        const handleGlobalWheel = (e) => {
            e.preventDefault();

            if (isScrollingRef.current) return;

            const columnElement = e.target.closest('[data-column]');
            if (!columnElement) return;

            const columnName = columnElement.getAttribute('data-column');
            let optionsArray = [];
            if (columnName === 'month') optionsArray = months;
            if (columnName === 'day') optionsArray = days;
            if (columnName === 'year') optionsArray = years;

            const currentIndex = optionsArray.indexOf(selections[columnName]);
            const direction = e.deltaY > 0 ? 1 : -1;

            let nextIndex = currentIndex + direction;
            if (nextIndex < 0) nextIndex = 0;
            if (nextIndex >= optionsArray.length) nextIndex = optionsArray.length - 1;

            if (nextIndex !== currentIndex) {
                isScrollingRef.current = true;

                const updatedSelection = {
                    ...selections,
                    [columnName]: optionsArray[nextIndex]
                };

                handleValueChange(updatedSelection);

                setTimeout(() => {
                    isScrollingRef.current = false;
                }, 90);
            }
        };

        const wrapper = wrapperRef.current;
        if (wrapper) {
            wrapper.addEventListener('wheel', handleGlobalWheel, { passive: false });
        }

        return () => {
            if (wrapper) {
                wrapper.removeEventListener('wheel', handleGlobalWheel);
            }
        };
    }, [selections]);

    return (
        <div className="date-grouped">
            <p>{labelValue}</p>
            <div ref={wrapperRef} className="wheel-interceptor-wrapper">
                <Picker value={selections} className={pickerClass} id={label} onChange={handleValueChange} height={26}>
                    <Picker.Column name="day">
                        {days.map(d => <Picker.Item key={d} value={d} data-column="day">{d}</Picker.Item>)}
                    </Picker.Column>
                    <Picker.Column name="month">
                        {months.map(m => <Picker.Item key={m} value={m} data-column="month">{m}</Picker.Item>)}
                    </Picker.Column>
                    <Picker.Column name="year">
                        {years.map(y => <Picker.Item key={y} value={y} data-column="year">{y}</Picker.Item>)}
                    </Picker.Column>
                </Picker>
            </div>
        </div>
    );
}

export default DatePickerComponent;