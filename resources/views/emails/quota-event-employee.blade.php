@extends('emails.layouts.mb')

@section('content')
    <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#0f172a;">
        Hello {{ $recipientName }},
    </p>
    <p style="margin:0 0 16px;">
        {{ $eventBody }}
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;background-color:#eff6ff;border-radius:14px;border:1px solid #bfdbfe;">
        <tr>
            <td style="padding:20px 22px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#1d4ed8;">
                    Quota Event
                </p>
                <p style="margin:0;font-size:18px;font-weight:700;color:#1e3a8a;">
                    {{ $eventTitle }}
                </p>
            </td>
        </tr>
    </table>
@endsection

@section('cta')
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
        <tr>
            <td align="center" style="border-radius:999px;background-color:#2563eb;">
                <a href="{{ $ctaUrl }}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">
                    Open my quota
                </a>
            </td>
        </tr>
    </table>
@endsection

@section('footer')
        Automated update from MB Refreshment for your quota activity.
@endsection
