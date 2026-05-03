@extends('emails.layouts.mb')

@section('content')
    <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#0f172a;">
        Hello {{ $recipientName }},
    </p>
    <p style="margin:0 0 16px;">
        Your meal request for <strong style="color:#0f172a;">{{ $itemName }}</strong> (quantity {{ $quantity }}) was <strong style="color:#b91c1c;">not approved</strong>. Nothing has been deducted from your quota or stock for this request.
    </p>
    @if(isset($reason) && trim((string) $reason) !== '')
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;background-color:#fef2f2;border-radius:14px;border:1px solid #fecaca;">
            <tr>
                <td style="padding:18px 20px;">
                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#991b1b;">Note from admin</p>
                    <p style="margin:0;font-size:14px;color:#7f1d1d;line-height:1.55;">{{ $reason }}</p>
                </td>
            </tr>
        </table>
    @endif
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
        Automated update from MB Refreshment regarding your meal request.
@endsection
