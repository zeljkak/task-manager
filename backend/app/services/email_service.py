from flask_mail import Message
from backend.app.extensions.mail import mail
from backend.config import Config

class EmailService:

    @staticmethod
    def send_verification_email(user):

        verify_url = (
            f"{Config.BASE_URL}/auth/verify-email/"
            f"{user.verification_token}"
        )

        msg = Message(
            subject="Verify your account",
            recipients=[user.email]
        )

        msg.body = f"""
        Welcome!

        Click the link below to verify your account:

        {verify_url}
        """

        mail.send(msg)


    @staticmethod
    def send_password_reset_email(user):
        verify_url = (
            f"{Config.FRONTEND_URL}/reset-password/"
            f"{user.verification_token}"
        )

        msg = Message(
            subject="Reset your password",
            recipients=[user.email]
        )

        msg.body = f"""
                Hello!

                Click the link below to reset your password:

                {verify_url}
                """

        mail.send(msg)


    @staticmethod
    def send_restore_account_email(user):
        verify_url = (
            f"{Config.BASE_URL}/auth/restore-account/"
            f"{user.verification_token}"
        )

        msg = Message(
            subject="Restore your account",
            recipients=[user.email]
        )

        msg.body = f"""
            Hello!

            Click the link below to restore your account:

            {verify_url}
            """

        mail.send(msg)
