function ProfileComponent({ user }) {
    return (
        <div className={"user-data"}>
            <p>First Name</p>
            <p className={"first-name"}>
                {user.firstName}
            </p><br />
            <p>Last Name</p>
            <p className={"last-name"}>
                {user.lastName}
            </p><br />
            <p>Email</p>
            <p className={"email"}>
                {user.email}
            </p><br />
            <p>Join Date</p>
            <p className={"created-at"}>
                {user.createdAt}
            </p>
        </div>
    );
}

export default ProfileComponent;