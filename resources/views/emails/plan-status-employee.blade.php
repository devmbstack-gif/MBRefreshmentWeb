@extends('emails.layouts.mb')

@section('content')
    <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#0f172a;">
        Hello {{ $recipientName }},
    </p>
    <p style="margin:0 0 16px;">
        {{ $introText }}
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;background-color:#fff7ed;border-radius:14px;border:1px solid #fed7aa;">
        <tr>
            <td style="padding:20px 22px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#c2410c;">
                    Plan
                </p>
                <p style="margin:0;font-size:18px;font-weight:700;color:#7c2d12;">
                    {{ $planTitle }}
                </p>
                <p style="margin:14px 0 0;font-size:13px;color:#9a3412;">
                    {{ $detailText }}
                </p>
            </td>
        </tr>
    </table>
    <p style="margin:0;color:#475569;">
        Open your account to view your latest available quota and notifications.
    </p>
@endsection

@section('cta')
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
        <tr>
            <td align="center" style="border-radius:999px;background-color:#ea580c;">
                <a href="{{ $ctaUrl }}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">
                    Open my quota
                </a>
            </td>
        </tr>
    </table>
@endsection

@section('footer')
        This message was sent because a quota plan status changed in MB Refreshment.
@endsection
