import EstimatedHoursSvg from "../../assets/icons/estimated-hours.svg?react";

function EstimatedHoursIcon({ size }) {
    const commonProps = {
        width: size,
        height: size,
        style: { marginRight: "6px", marginBottom: "3px", verticalAlign: "middle" }
    };

    return <EstimatedHoursSvg {...commonProps} />;

}

export default EstimatedHoursIcon;