@extends('emails.layouts.mb')

@section('content')
    <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#0f172a;">
        Hello {{ $recipientName }},
    </p>
    <p style="margin:0 0 16px;">
        Great news — you have been added to a refreshment month plan. Here are the details:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;background-color:#f0fdf4;border-radius:14px;border:1px solid #bbf7d0;">
        <tr>
            <td style="padding:20px 22px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#047857;">
                    Plan
                </p>
                <p style="margin:0;font-size:18px;font-weight:700;color:#064e3b;">
                    {{ $planTitle }}
                </p>
                <p style="margin:14px 0 0;font-size:13px;color:#166534;">
                    <strong style="color:#065f46;">Active through</strong><br>
                    <span style="font-size:15px;font-weight:600;color:#14532d;">{{ $planEndsAt }}</span>
                </p>
            </td>
        </tr>
    </table>
    <p style="margin:0;color:#475569;">
        Sign in to your account to view your quota, see included items, and record when you use them.
    </p>
@endsection

@section('cta')
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
        <tr>
            <td align="center" style="border-radius:999px;background-color:#059669;">
                <a href="{{ $ctaUrl }}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">
                    Open my quota
                </a>
            </td>
        </tr>
    </table>
@endsection

@section('footer')
        This message was sent because an administrator assigned you to a plan in MB Refreshment.
        If you were not expecting this email, you can ignore it or contact your administrator.
@endsection
