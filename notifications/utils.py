import logging

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification
from .serializers import NotificationSerializer

logger = logging.getLogger(__name__)


def create_notification(recipient, notification_type, title, message, link=None, sender=None, data=None):
    """
    Create a notification (DB write) and best-effort push via WebSocket.

    The DB write is the source of truth — recipients will always see this
    notification the next time their client polls /api/v1/notifications/.
    The WebSocket push is a "live update" optimization that fails silently
    if Redis / the channel layer is unavailable.
    """
    notification = Notification.objects.create(
        recipient=recipient,
        sender=sender,
        notification_type=notification_type,
        title=title,
        message=message,
        link=link,
        data=data
    )

    # Best-effort real-time push. Never let a transport problem (Redis down,
    # channel layer not configured, etc.) break the caller — the row is saved.
    try:
        send_notification_to_user(recipient.id, notification)
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "Notification %s saved but WebSocket push failed: %s",
            notification.id, exc,
        )

    return notification


def send_notification_to_user(user_id, notification):
    """
    Send notification to a specific user via WebSocket.

    Raises if the channel layer can't deliver. Callers that don't care about
    transport failures should wrap this in try/except (see create_notification).
    """
    channel_layer = get_channel_layer()
    if channel_layer is None:
        # No CHANNEL_LAYERS configured — skip silently.
        return

    if isinstance(notification, Notification):
        serializer = NotificationSerializer(notification)
        notification_data = serializer.data
    else:
        notification_data = notification

    async_to_sync(channel_layer.group_send)(
        f'notifications_{user_id}',
        {
            'type': 'notification_message',
            'notification': notification_data
        }
    )


# Specific notification helper functions

def notify_account_approved(user):
    """Notify user that their account was approved"""
    return create_notification(
        recipient=user,
        notification_type='account',
        title='Account Approved',
        message='Your account has been approved! You can now access all features.',
        link='/dashboard'
    )


def notify_account_declined(user):
    """Notify user that their account was declined"""
    return create_notification(
        recipient=user,
        notification_type='account',
        title='Account Declined',
        message='Your account verification was declined. Please contact support for more information.',
        link='/profile'
    )


def notify_appointment_created(appointment, recipient):
    """Notify about new appointment"""
    return create_notification(
        recipient=recipient,
        sender=appointment.farmer if hasattr(appointment, 'farmer') else None,
        notification_type='appointment',
        title='New Appointment Request',
        message=f'You have a new appointment request for {appointment.appointment_date}.',
        link=f'/appointments',
        data={'appointment_id': appointment.id}
    )


def notify_appointment_confirmed(appointment, recipient):
    """Notify that appointment was confirmed"""
    return create_notification(
        recipient=recipient,
        notification_type='appointment',
        title='Appointment Confirmed',
        message=f'Your appointment for {appointment.appointment_date} has been confirmed.',
        link=f'/appointments',
        data={'appointment_id': appointment.id}
    )


def notify_transfer_request(transfer, recipient):
    """Notify about profile transfer request"""
    return create_notification(
        recipient=recipient,
        sender=transfer.sender if hasattr(transfer, 'sender') else None,
        notification_type='transfer',
        title='New Transfer Request',
        message=f'You have received a new profile transfer request.',
        link='/profile-transfer/receiver/requests',
        data={'transfer_id': transfer.id}
    )


def notify_transfer_approved(transfer, recipient):
    """Notify that transfer was approved"""
    return create_notification(
        recipient=recipient,
        notification_type='transfer',
        title='Transfer Approved',
        message='Your profile transfer request has been approved.',
        link='/profile-transfer/farmer/sent',
        data={'transfer_id': transfer.id}
    )


def notify_insurance_claim_submitted(claim, recipient):
    """Notify about insurance claim submission"""
    return create_notification(
        recipient=recipient,
        notification_type='insurance',
        title='Insurance Claim Submitted',
        message='Your insurance claim has been submitted and is under review.',
        link='/insurance/farmer/track-claim',
        data={'claim_id': claim.id}
    )


def notify_insurance_claim_approved(claim, recipient):
    """Notify that insurance claim was approved"""
    return create_notification(
        recipient=recipient,
        notification_type='insurance',
        title='Insurance Claim Approved',
        message=f'Your insurance claim has been approved!',
        link='/insurance/farmer/track-claim',
        data={'claim_id': claim.id}
    )


def notify_friend_request(friend_request, recipient):
    """Notify about new friend request"""
    return create_notification(
        recipient=recipient,
        sender=friend_request.sender if hasattr(friend_request, 'sender') else None,
        notification_type='friend',
        title='New Friend Request',
        message=f'{friend_request.sender.full_name or friend_request.sender.username} sent you a friend request.',
        link='/friends/requests',
        data={'friend_request_id': friend_request.id}
    )


def notify_message_received(message, recipient):
    """Notify about new message"""
    return create_notification(
        recipient=recipient,
        sender=message.sender if hasattr(message, 'sender') else None,
        notification_type='message',
        title='New Message',
        message=f'You have a new message from {message.sender.full_name or message.sender.username}.',
        link='/messages',
        data={'message_id': message.id}
    )
