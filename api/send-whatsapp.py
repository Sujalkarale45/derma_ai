"""
/api/send-whatsapp.py
======================
Vercel Serverless Function — sends WhatsApp notifications
to both doctor and patient via Twilio API.

POST /api/send-whatsapp
Body:
  {
    patient_phone:  string   (E.164 e.g. "+919876543210"),
    doctor_phone:   string,
    patient_name:   string,
    doctor_name:    string,
    slot_datetime:  string   (ISO 8601),
    meet_link:      string
  }

Returns:
  { patient_sent: bool, doctor_sent: bool }

Environment variables needed (set in Vercel dashboard):
  TWILIO_ACCOUNT_SID         — from Twilio Console
  TWILIO_AUTH_TOKEN          — from Twilio Console
  TWILIO_WHATSAPP_FROM       — e.g. "whatsapp:+14155238886"
"""

import json
import os
import re
from datetime import datetime
from http.server import BaseHTTPRequestHandler


# ─── Helpers ──────────────────────────────────────────────────────────────────

PHONE_RE = re.compile(r"^\+[1-9]\d{9,14}$")

def _validate_phone(phone: str) -> bool:
    return bool(PHONE_RE.match(phone.replace(" ", "").replace("-", "")))


def _clean_phone(phone: str) -> str:
    """Normalise phone to E.164 format."""
    cleaned = phone.replace(" ", "").replace("-", "")
    if not cleaned.startswith("+"):
        cleaned = "+" + cleaned
    return cleaned


def _format_dt(iso: str) -> str:
    """'Wednesday, 16 April 2026 at 10:00 AM IST'"""
    dt = datetime.fromisoformat(iso)
    return dt.strftime("%A, %d %B %Y at %I:%M %p") + " IST"


DIVIDER = "---------------------------"


def _patient_message(doctor_name: str, slot_iso: str, meet_link: str) -> str:
    lines = [
        DIVIDER,
        "*DERMA AI - Appointment Confirmation*",
        DIVIDER,
        "",
        "Your video consultation has been successfully scheduled.",
        "",
        "*Appointment Details*",
        "Doctor: " + doctor_name,
        "Date: " + _format_dt(slot_iso),
        "",
        "*Google Meet Link*",
        meet_link,
        "",
        "*Instructions*",
        "- Please join the meeting at the scheduled time using the link above",
        "- Ensure that your camera and microphone are enabled prior to joining",
        "- Kindly be available a few minutes in advance to avoid any delays",
        "",
        DIVIDER,
        "DERMA AI - Skin Care, Anywhere",
        DIVIDER,
    ]
    return "\n".join(lines)


def _doctor_message(doctor_name: str, patient_name: str, slot_iso: str, meet_link: str) -> str:
    lines = [
        DIVIDER,
        "*DERMA AI - New Appointment*",
        DIVIDER,
        "",
        "Hello " + doctor_name + ",",
        "",
        "A patient has scheduled a video consultation with you.",
        "",
        "*Appointment Details*",
        "Patient: " + patient_name,
        "Date: " + _format_dt(slot_iso),
        "",
        "*Google Meet Link*",
        meet_link,
        "",
        "*Instructions*",
        "- Please join the meeting at the scheduled time using the link above",
        "- The patient's AI scan report is available in your consultation dashboard",
        "- Kindly be available a few minutes in advance to avoid any delays",
        "",
        DIVIDER,
        "DERMA AI - Telemedicine Platform",
        DIVIDER,
    ]
    return "\n".join(lines)


def _send(account_sid: str, auth_token: str, from_number: str, to_phone: str, body: str) -> bool:
    """
    Sends a WhatsApp message via Twilio.
    Returns True on success.
    """
    try:
        from twilio.rest import Client
        client  = Client(account_sid, auth_token)
        message = client.messages.create(
            from_=from_number,
            to=f"whatsapp:{to_phone}",
            body=body,
        )
        print(f"[Twilio] Sent to {to_phone} | SID: {message.sid}")
        return True
    except Exception as e:
        print(f"[Twilio] Error sending to {to_phone}: {e}")
        return False


# ─── JSON response helper ─────────────────────────────────────────────────────

def _json_response(h, status: int, data: dict) -> None:
    body = json.dumps(data).encode("utf-8")
    h.send_response(status)
    h.send_header("Content-Type", "application/json")
    h.send_header("Content-Length", str(len(body)))
    h.send_header("Access-Control-Allow-Origin", "*")
    h.end_headers()
    h.wfile.write(body)


# ─── Vercel Handler ───────────────────────────────────────────────────────────

class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_POST(self):
        # ── Read body ─────────────────────────────────────────────────────────
        try:
            length = int(self.headers.get("Content-Length", 0))
            body   = self.rfile.read(length)
            data   = json.loads(body)
        except Exception:
            return _json_response(self, 400, {"error": "Invalid JSON body"})

        # ── Validate ──────────────────────────────────────────────────────────
        required = ["patient_phone", "doctor_phone", "patient_name",
                    "doctor_name", "slot_datetime", "meet_link"]
        missing  = [f for f in required if not data.get(f)]
        if missing:
            return _json_response(self, 400, {"error": f"Missing: {', '.join(missing)}"})

        patient_phone = _clean_phone(data["patient_phone"])
        doctor_phone  = _clean_phone(data["doctor_phone"])

        if not _validate_phone(patient_phone):
            return _json_response(self, 400, {"error": f"Invalid patient phone: {patient_phone}"})
        if not _validate_phone(doctor_phone):
            return _json_response(self, 400, {"error": f"Invalid doctor phone: {doctor_phone}"})

        # ── Twilio credentials ────────────────────────────────────────────────
        account_sid  = os.environ.get("TWILIO_ACCOUNT_SID", "")
        auth_token   = os.environ.get("TWILIO_AUTH_TOKEN",  "")
        from_number  = os.environ.get("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")

        if not account_sid or not auth_token:
            return _json_response(self, 500, {
                "error": "Twilio credentials not configured in environment"
            })

        # ── Send messages ─────────────────────────────────────────────────────
        patient_sent = _send(
            account_sid, auth_token, from_number,
            patient_phone,
            _patient_message(data["doctor_name"], data["slot_datetime"], data["meet_link"]),
        )

        doctor_sent = _send(
            account_sid, auth_token, from_number,
            doctor_phone,
            _doctor_message(data["doctor_name"], data["patient_name"], data["slot_datetime"], data["meet_link"]),
        )

        return _json_response(self, 200, {
            "patient_sent": patient_sent,
            "doctor_sent":  doctor_sent,
        })

    def log_message(self, *args):
        pass
