import UserSvg from "../../assets/icons/user.svg?react";
function UserIcon() {
    const commonProps = {
        width: 18,
        height: 18,
        style: { marginRight: "6px", marginBottom: "3px", verticalAlign: "middle" }
    };

    return <UserSvg {...commonProps} />;

}

export default UserIcon;