import smtplib

from email.mime.text import MIMEText

from email.mime.multipart import MIMEMultipart

import random

import os

from dotenv import load_dotenv

load_dotenv()

EMAIL_ADDRESS = os.getenv(
    "EMAIL_ADDRESS"
)

EMAIL_PASSWORD = os.getenv(
    "EMAIL_PASSWORD"
)


# =========================================
# GENERATE OTP
# =========================================

def generate_otp():

    return str(
        random.randint(100000, 999999)
    )


# =========================================
# SEND EMAIL OTP
# =========================================

def send_verification_email(

    receiver_email,

    otp

):

    subject = "EyeBot AI - Email Verification"

    body = f"""

Your EyeBot AI verification code is:

{otp}

Enter this OTP to verify your account.

This OTP expires soon.

"""

    msg = MIMEMultipart()

    msg["From"] = EMAIL_ADDRESS

    msg["To"] = receiver_email

    msg["Subject"] = subject

    msg.attach(
        MIMEText(body, "plain")
    )

    server = smtplib.SMTP(
        "smtp.gmail.com",
        587
    )

    server.starttls()

    server.login(

        EMAIL_ADDRESS,

        EMAIL_PASSWORD
    )

    server.sendmail(

        EMAIL_ADDRESS,

        receiver_email,

        msg.as_string()
    )

    server.quit()