import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from config import (
    EMAIL_FROM,
    ENVIRONMENT,
    FRONTEND_URL,
    SMTP_HOST,
    SMTP_PASSWORD,
    SMTP_PORT,
    SMTP_USE_TLS,
    SMTP_USER,
)

logger = logging.getLogger(__name__)


def enviar_email_recuperacao(email_destino: str, token: str) -> bool:
    """
    Envia o link de recuperação por e-mail.

    Em modo development sem SMTP configurado, apenas loga o link (não envia).
    Retorna True se o e-mail foi enviado (ou logado em dev), False em caso de erro.
    """
    link = f"{FRONTEND_URL}/redefinir-senha?token={token}"

    if ENVIRONMENT == "development" and not SMTP_HOST:
        logger.warning(
            "[DEV] Link de recuperação de senha (nenhum e-mail enviado): %s", link
        )
        return True

    if not SMTP_HOST:
        logger.error(
            "SMTP não configurado. Defina SMTP_HOST no .env para enviar e-mails."
        )
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "CheckAI — Recuperação de senha"
    msg["From"] = EMAIL_FROM
    msg["To"] = email_destino

    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Recuperação de senha — CheckAI</h2>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        <p>
          <a href="{link}"
             style="background:#4f46e5;color:#fff;padding:10px 20px;
                    border-radius:6px;text-decoration:none;display:inline-block;">
            Redefinir minha senha
          </a>
        </p>
        <p>Ou copie e cole este endereço no seu navegador:</p>
        <p style="word-break:break-all;color:#4f46e5;">{link}</p>
        <p><small>Este link expira em 1 hora. Se você não solicitou a
        recuperação, ignore este e-mail.</small></p>
      </body>
    </html>
    """

    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        if SMTP_USE_TLS:
            server = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT)
        else:
            server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
            server.starttls()

        if SMTP_USER and SMTP_PASSWORD:
            server.login(SMTP_USER, SMTP_PASSWORD)

        server.sendmail(EMAIL_FROM, email_destino, msg.as_string())
        server.quit()
        logger.info("E-mail de recuperação enviado para %s", email_destino)
        return True

    except smtplib.SMTPException as exc:
        logger.error("Falha SMTP ao enviar e-mail de recuperação: %s", exc)
        return False
