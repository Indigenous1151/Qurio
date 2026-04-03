import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class EmailService:


    def __init__(self):
        self.__email = os.getenv("SMTP_EMAIL")
        self.__password = os.getenv("SMTP_PASSWORD")
        self.__smtp_host = os.getenv("SMTP_HOST")
        self.__smtp_port = os.getenv("SMTP_PORT")
    

    def send_friend_request_email(self, receiver_email: str, sender_username: str, sender_id: str, receiver_id: str) -> bool:
        try:
            msg = MIMEMultipart()
            msg['From'] = self.__email
            msg['To'] = receiver_email
            msg['Subject'] = f"{sender_username} wants to be your friend on Qurio!"

            body = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #638F77;">Friend Request on Qurio!</h2>
                <p><strong>{sender_username}</strong> has sent you a friend request on Qurio.</p>
                <div style="margin: 30px 0;">
                    <a href="http://localhost:5001/friend/accept-email?sender_id={sender_id}&receiver_id={receiver_id}" 
                       style="background-color: #638F77; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-right: 10px;">
                        Accept
                    </a>
                    <a href="http://localhost:5001/friend/decline-email?sender_id={sender_id}&receiver_id={receiver_id}"
                       style="background-color: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                        Decline
                    </a>
                </div>
                <p style="color: #888; font-size: 12px;">- The Qurio Team</p>
            </div>
            """

            msg.attach(MIMEText(body, 'html'))

            server = smtplib.SMTP(self.__smtp_host, self.__smtp_port)
            server.starttls()
            server.login(self.__email, self.__password)
            server.sendmail(self.__email, receiver_email, msg.as_string())
            server.quit()

            print(f"Email sent to {receiver_email}")
            return True

        except Exception as e:
            print(f"Error sending email: {e}")
            return False