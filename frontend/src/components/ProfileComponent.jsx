function ProfileComponent({ user }) {
    return (
        <div className={"user-data"}>
            <h2>First Name</h2>
            <p className={"first-name"}>
                {user.firstName}
            </p><br />
            <h2>Last Name</h2>
            <p className={"last-name"}>
                {user.lastName}
            </p><br />
            <h2>Email</h2>
            <p className={"email"}>
                {user.email}
            </p><br />
            <h2>Join Date</h2>
            <p className={"created-at"}>
                {new Date(user.createdAt).toLocaleDateString("en-GB").replaceAll("/", ".").concat(".")}
            </p>
        </div>
    );
}

export default ProfileComponent;