from flask_mail import Message
from app.extensions.mail import mail
from config import Config

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
