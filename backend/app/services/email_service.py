from flask_mail import Message
from backend.app.extensions.mail import mail
from backend.config import Config
from backend.app.exceptions.http_exceptions import ServiceUnavailableError
import textwrap

class EmailService:

    @staticmethod
    def send_verification_email(user, token):
        try:

            verify_url = (
                f"{Config.BASE_URL}/auth/verify-email/"
                f"{token}"
            )

            msg = Message(
                subject="Verify your account",
                recipients=[user.email]
            )

            msg.body = textwrap.dedent(f"""\
                Welcome to Task Manager!
        
                Click the link below to verify your account:
        
                {verify_url}
            """)

            mail.send(msg)

        except Exception as e:
            raise ServiceUnavailableError("Email service unavailable") from e


    @staticmethod
    def send_password_reset_email(user, token):
        try:

            verify_url = (
                f"{Config.FRONTEND_URL}/reset-password/"
                f"{token}"
            )

            msg = Message(
                subject="Reset your password",
                recipients=[user.email]
            )

            msg.body = textwrap.dedent(f"""\
                Hello!
    
                Click the link below to reset your password for Task Manager:
    
                {verify_url}
            """)

            mail.send(msg)

        except Exception as e:
            raise ServiceUnavailableError("Email service unavailable") from e


    @staticmethod
    def send_restore_account_email(user, token):
        try:

            verify_url = (
                f"{Config.FRONTEND_URL}/restore-account/"
                f"{token}"
            )

            msg = Message(
                subject="Restore your account",
                recipients=[user.email]
            )

            msg.body = textwrap.dedent(f"""\
                Hello!
    
                Click the link below to restore your Task Manager account:
    
                {verify_url}
            """)

            mail.send(msg)

        except Exception as e:
            raise ServiceUnavailableError("Email service unavailable") from e
