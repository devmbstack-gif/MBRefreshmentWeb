@extends('emails.layouts.mb')

@section('content')
    <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#0f172a;">
        Hello,
    </p>
    <p style="margin:0 0 16px;">
        An employee has submitted a <strong style="color:#0f172a;">meal order request</strong> that needs your approval before quota and stock are applied.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;background-color:#fffbeb;border-radius:14px;border:1px solid #fde68a;">
        <tr>
            <td style="padding:20px 22px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                        <td style="padding-bottom:12px;border-bottom:1px solid #fde68a;">
                            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#92400e;">Employee</p>
                            <p style="margin:6px 0 0;font-size:17px;font-weight:700;color:#0f172a;">{{ $employeeName }}</p>
                            <p style="margin:4px 0 0;font-size:13px;color:#78716c;">Code: {{ $employeeCode }}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-top:14px;">
                            <p style="margin:0 0 6px;font-size:13px;color:#475569;"><strong>Meal / item</strong> · {{ $itemName }}</p>
                            <p style="margin:0 0 6px;font-size:13px;color:#475569;"><strong>Quantity</strong> · {{ $quantity }}</p>
                            <p style="margin:0 0 6px;font-size:13px;color:#475569;"><strong>Plan</strong> · {{ $planTitle }}</p>
                            <p style="margin:0;font-size:13px;color:#b45309;"><strong>Status</strong> · Pending approval</p>
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
                    Review meal orders
                </a>
            </td>
        </tr>
    </table>
@endsection

@section('footer')
        Automated notification from MB Refreshment when a meal order awaits approval.
@endsection
