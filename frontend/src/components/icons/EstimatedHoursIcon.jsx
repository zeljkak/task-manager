import EstimatedHoursSvg from "../../assets/icons/estimated-hours.svg?react";
function EstimatedHoursIcon() {
    const commonProps = {
        width: 18,
        height: 18,
        style: { marginRight: "6px", marginBottom: "3px", verticalAlign: "middle" }
    };

    return <EstimatedHoursSvg {...commonProps} />;

}

export default EstimatedHoursIcon;