import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, List
from abc import ABC, abstractmethod
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Optional imports for different providers
try:
    import sendgrid
    from sendgrid.helpers.mail import Mail, Email, To, Content
    SENDGRID_AVAILABLE = True
except ImportError:
    SENDGRID_AVAILABLE = False

try:
    import boto3
    from botocore.exceptions import ClientError
    AWS_SES_AVAILABLE = True
except ImportError:
    AWS_SES_AVAILABLE = False

logger = logging.getLogger(__name__)

class EmailProvider(ABC):
    """Abstract base class for email providers"""
    
    @abstractmethod
    async def send_email(self, to_email: str, subject: str, html_content: str, text_content: str = None) -> bool:
        pass

class SMTPEmailProvider(EmailProvider):
    """SMTP Email Provider"""
    
    def __init__(self, smtp_server: str, smtp_port: int, username: str, password: str, use_tls: bool = True):
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.username = username
        self.password = password
        self.use_tls = use_tls
        self.executor = ThreadPoolExecutor(max_workers=3)
    
    def _send_smtp_email(self, to_email: str, subject: str, html_content: str, text_content: str = None) -> bool:
        """Send email using SMTP (blocking operation)"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.username
            msg['To'] = to_email
            
            # Add text content
            if text_content:
                text_part = MIMEText(text_content, 'plain')
                msg.attach(text_part)
            
            # Add HTML content
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Send email
            if self.use_tls:
                server = smtplib.SMTP(self.smtp_server, self.smtp_port)
                server.starttls()
            else:
                server = smtplib.SMTP_SSL(self.smtp_server, self.smtp_port)
            
            server.login(self.username, self.password)
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    async def send_email(self, to_email: str, subject: str, html_content: str, text_content: str = None) -> bool:
        """Send email asynchronously using thread pool"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            self.executor, 
            self._send_smtp_email, 
            to_email, 
            subject, 
            html_content, 
            text_content
        )

class SendGridEmailProvider(EmailProvider):
    """SendGrid Email Provider"""
    
    def __init__(self, api_key: str, from_email: str):
        if not SENDGRID_AVAILABLE:
            raise ImportError("SendGrid package not installed. Run: pip install sendgrid")
        
        self.sg = sendgrid.SendGridAPIClient(api_key=api_key)
        self.from_email = from_email
    
    async def send_email(self, to_email: str, subject: str, html_content: str, text_content: str = None) -> bool:
        """Send email using SendGrid"""
        try:
            from_email = Email(self.from_email)
            to_email = To(to_email)
            
            if text_content:
                content = Content("text/plain", text_content)
                mail = Mail(from_email, to_email, subject, content)
                mail.add_content(Content("text/html", html_content))
            else:
                content = Content("text/html", html_content)
                mail = Mail(from_email, to_email, subject, content)
            
            response = self.sg.client.mail.send.post(request_body=mail.get())
            
            if response.status_code >= 200 and response.status_code < 300:
                logger.info(f"Email sent successfully to {to_email}")
                return True
            else:
                logger.error(f"SendGrid error: {response.status_code} - {response.body}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to send email via SendGrid to {to_email}: {str(e)}")
            return False

class AWSESEmailProvider(EmailProvider):
    """AWS SES Email Provider"""
    
    def __init__(self, region_name: str, from_email: str, aws_access_key_id: str = None, aws_secret_access_key: str = None):
        if not AWS_SES_AVAILABLE:
            raise ImportError("boto3 package not installed. Run: pip install boto3")
        
        session_kwargs = {'region_name': region_name}
        if aws_access_key_id and aws_secret_access_key:
            session_kwargs.update({
                'aws_access_key_id': aws_access_key_id,
                'aws_secret_access_key': aws_secret_access_key
            })
        
        self.ses_client = boto3.client('ses', **session_kwargs)
        self.from_email = from_email
    
    async def send_email(self, to_email: str, subject: str, html_content: str, text_content: str = None) -> bool:
        """Send email using AWS SES"""
        try:
            destination = {'ToAddresses': [to_email]}
            message = {
                'Subject': {'Data': subject, 'Charset': 'UTF-8'},
                'Body': {}
            }
            
            if text_content:
                message['Body']['Text'] = {'Data': text_content, 'Charset': 'UTF-8'}
            
            message['Body']['Html'] = {'Data': html_content, 'Charset': 'UTF-8'}
            
            response = self.ses_client.send_email(
                Source=self.from_email,
                Destination=destination,
                Message=message
            )
            
            logger.info(f"Email sent successfully to {to_email}. MessageId: {response['MessageId']}")
            return True
            
        except ClientError as e:
            logger.error(f"AWS SES error: {e.response['Error']['Message']}")
            return False
        except Exception as e:
            logger.error(f"Failed to send email via AWS SES to {to_email}: {str(e)}")
            return False

class EmailService:
    """Main Email Service that manages different providers"""
    
    def __init__(self):
        self.provider: Optional[EmailProvider] = None
        self.from_email = os.getenv("EMAIL_FROM")
        self._initialize_provider()
    
    def _initialize_provider(self):
        """Initialize email provider based on environment variables"""
        email_provider = os.getenv("EMAIL_PROVIDER", "smtp").lower()
        
        try:
            if email_provider == "sendgrid":
                api_key = os.getenv("SENDGRID_API_KEY")
                if not api_key:
                    raise ValueError("SENDGRID_API_KEY environment variable required")
                self.provider = SendGridEmailProvider(api_key, self.from_email)
                logger.info("Initialized SendGrid email provider")
                
            elif email_provider == "aws_ses":
                region = os.getenv("AWS_REGION", "us-east-1")
                aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
                aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
                self.provider = AWSESEmailProvider(region, self.from_email, aws_access_key_id, aws_secret_access_key)
                logger.info("Initialized AWS SES email provider")
                
            elif email_provider == "smtp":
                smtp_server = os.getenv("SMTP_SERVER")
                smtp_port = int(os.getenv("SMTP_PORT", "587"))
                smtp_username = os.getenv("SMTP_USERNAME")
                smtp_password = os.getenv("SMTP_PASSWORD")
                use_tls = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
                
                if not all([smtp_server, smtp_username, smtp_password]):
                    raise ValueError("SMTP configuration incomplete")
                
                self.provider = SMTPEmailProvider(smtp_server, smtp_port, smtp_username, smtp_password, use_tls)
                logger.info("Initialized SMTP email provider")
                
            else:
                raise ValueError(f"Unknown email provider: {email_provider}")
                
        except Exception as e:
            logger.error(f"Failed to initialize email provider: {str(e)}")
            self.provider = None
    
    async def send_email(self, to_email: str, subject: str, html_content: str, text_content: str = None) -> bool:
        """Send email using configured provider"""
        if not self.provider:
            logger.error("No email provider configured")
            return False
        
        if not to_email or not subject or not html_content:
            logger.error("Missing required email parameters")
            return False
        
        return await self.provider.send_email(to_email, subject, html_content, text_content)
    
    async def send_verification_email(self, to_email: str, verification_token: str, user_name: str = None) -> bool:
        """Send email verification email"""
        verification_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/verify-email?token={verification_token}"
        
        subject = "Verify Your Email - LeetSpace"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }}
                .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to LeetSpace!</h1>
                </div>
                <div class="content">
                    <p>Hello {user_name or 'there'},</p>
                    <p>Thank you for signing up for LeetSpace! To complete your registration, please verify your email address by clicking the button below:</p>
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="{verification_url}" class="button">Verify Email Address</a>
                    </p>
                    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #2563eb;">{verification_url}</p>
                    <p>This verification link will expire in 24 hours for security reasons.</p>
                    <p>If you didn't create an account with LeetSpace, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                    <p>© 2024 LeetSpace. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Welcome to LeetSpace!
        
        Hello {user_name or 'there'},
        
        Thank you for signing up for LeetSpace! To complete your registration, please verify your email address by visiting this link:
        
        {verification_url}
        
        This verification link will expire in 24 hours for security reasons.
        
        If you didn't create an account with LeetSpace, you can safely ignore this email.
        
        © 2024 LeetSpace. All rights reserved.
        """
        
        return await self.send_email(to_email, subject, html_content, text_content)
    
    async def send_password_reset_email(self, to_email: str, reset_token: str, user_name: str = None) -> bool:
        """Send password reset email"""
        reset_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token={reset_token}"
        
        subject = "Reset Your Password - LeetSpace"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 30px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }}
                .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }}
                .warning {{ background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Hello {user_name or 'there'},</p>
                    <p>We received a request to reset your password for your LeetSpace account. If you made this request, click the button below to reset your password:</p>
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="{reset_url}" class="button">Reset Password</a>
                    </p>
                    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #dc2626;">{reset_url}</p>
                    <div class="warning">
                        <strong>⚠️ Security Notice:</strong>
                        <ul>
                            <li>This link will expire in 1 hour for security reasons</li>
                            <li>If you didn't request this reset, please ignore this email</li>
                            <li>Your current password will remain unchanged until you create a new one</li>
                        </ul>
                    </div>
                </div>
                <div class="footer">
                    <p>© 2024 LeetSpace. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Password Reset Request - LeetSpace
        
        Hello {user_name or 'there'},
        
        We received a request to reset your password for your LeetSpace account. If you made this request, visit this link to reset your password:
        
        {reset_url}
        
        Security Notice:
        - This link will expire in 1 hour for security reasons
        - If you didn't request this reset, please ignore this email
        - Your current password will remain unchanged until you create a new one
        
        © 2024 LeetSpace. All rights reserved.
        """
        
        return await self.send_email(to_email, subject, html_content, text_content)

# Create singleton instance
email_service = EmailService()