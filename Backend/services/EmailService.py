import resend
import os

class EmailService:
    def __init__(self):
        resend.api_key = os.getenv("RESEND_API_KEY")

    def send_friend_request_email(self, receiver_email: str, sender_username: str, sender_id: str, receiver_id: str) -> bool:
        try:
            resend.Emails.send({
                "from": "Qurio <onboarding@resend.dev>",
                "to": receiver_email,
                "subject": f"{sender_username} wants to be your friend on Qurio!",
                "html": f"""
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #638F77;">Friend Request on Qurio!</h2>
                        <p><strong>{sender_username}</strong> has sent you a friend request on Qurio.</p>
                        <div style="margin: 30px 0;">
                            <a href="http://localhost:5000/friend/accept-email?sender_id={sender_id}&receiver_id={receiver_id}" 
                            style="background-color: #638F77; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-right: 10px;">
                                Accept
                            </a>
                            <a href="http://localhost:5000/friend/decline-email?sender_id={sender_id}&receiver_id={receiver_id}"
                            style="background-color: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                                Decline
                            </a>
                        </div>
                        <p style="color: #888; font-size: 12px;">- The Qurio Team</p>
                    </div>
                """
            })
            print(f"Email sent to {receiver_email}")
            return True
        except Exception as e:
            print(f"Error sending email: {e}")
            return False