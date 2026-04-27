@extends('emails.layouts.mb')

@section('content')
    <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#0f172a;">
        Hello {{ $recipientName }},
    </p>
    <p style="margin:0 0 16px;">
        Admin has replied to your {{ $requestType }}.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;background-color:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;">
        <tr>
            <td style="padding:20px 22px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#475569;">
                    Subject
                </p>
                <p style="margin:0 0 14px;font-size:18px;font-weight:700;color:#0f172a;">
                    {{ $subjectLine }}
                </p>
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#475569;">
                    Reply
                </p>
                <p style="margin:0;color:#334155;white-space:pre-wrap;">{{ $replyBody }}</p>
            </td>
        </tr>
    </table>
@endsection

@section('cta')
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
        <tr>
            <td align="center" style="border-radius:999px;background-color:#0d9488;">
                <a href="{{ $ctaUrl }}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">
                    Open issue center
                </a>
            </td>
        </tr>
    </table>
@endsection

@section('footer')
        This message was sent because admin replied to your feedback in MB Refreshment.
@endsection
