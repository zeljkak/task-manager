import AttachmentSvg from "../../assets/icons/attachment.svg?react";

function AttachmentIcon({ size }) {
    const commonProps = {
        width: size,
        height: size,
        style: { marginRight: "6px", marginBottom: "3px", verticalAlign: "middle" }
    };

    return <AttachmentSvg {...commonProps} />;

}

export default AttachmentIcon;