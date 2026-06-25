import InboxSvg from "../../assets/icons/inbox.svg?react";

function InboxIcon({ size }) {
    const commonProps = {
        width: size,
        height: size,
        style: { marginRight: "6px", marginBottom: "3px", verticalAlign: "middle" }
    };

    return <InboxSvg {...commonProps} />;

}

export default InboxIcon;