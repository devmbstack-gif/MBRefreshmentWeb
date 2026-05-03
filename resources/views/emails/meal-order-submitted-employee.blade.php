@extends('emails.layouts.mb')

@section('content')
    <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#0f172a;">
        Hello {{ $recipientName }},
    </p>
    <p style="margin:0 0 16px;">
        {{ $eventBody }}
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;background-color:#ecfdf5;border-radius:14px;border:1px solid #a7f3d0;">
        <tr>
            <td style="padding:20px 22px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#047857;">
                    Meal request
                </p>
                <p style="margin:0;font-size:18px;font-weight:700;color:#065f46;">
                    {{ $itemName }} × {{ $quantity }}
                </p>
                <p style="margin:10px 0 0;font-size:13px;color:#475569;">
                    You will be notified when an administrator approves or rejects this request.
                </p>
            </td>
        </tr>
    </table>
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
        Automated update from MB Refreshment for your meal request.
@endsection
