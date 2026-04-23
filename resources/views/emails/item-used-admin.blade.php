@extends('emails.layouts.mb')

@section('content')
    <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#0f172a;">
        Hello,
    </p>
    <p style="margin:0 0 16px;">
        An employee has just <strong style="color:#0f172a;">used part of their quota</strong> (ordered / recorded an item).
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;background-color:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;">
        <tr>
            <td style="padding:20px 22px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                        <td style="padding-bottom:12px;border-bottom:1px solid #e2e8f0;">
                            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;">Employee</p>
                            <p style="margin:6px 0 0;font-size:17px;font-weight:700;color:#0f172a;">{{ $employeeName }}</p>
                            <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Code: {{ $employeeCode }}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-top:14px;">
                            <p style="margin:0 0 6px;font-size:13px;color:#475569;"><strong>Item</strong> · {{ $itemName }}</p>
                            <p style="margin:0 0 6px;font-size:13px;color:#475569;"><strong>Plan</strong> · {{ $planTitle }}</p>
                            <p style="margin:0 0 6px;font-size:13px;color:#475569;"><strong>Quantity used</strong> · {{ $quantity }}</p>
                            <p style="margin:0;font-size:13px;color:#047857;"><strong>Remaining on this line</strong> · {{ $remainingQty }}</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
@endsection

@section('cta')
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
        <tr>
            <td align="center" style="border-radius:999px;background-color:#0d9488;">
                <a href="{{ $ctaUrl }}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">
                    Open admin dashboard
                </a>
            </td>
        </tr>
    </table>
@endsection

@section('footer')
        Automated notification from MB Refreshment when an employee records quota usage.
@endsection
