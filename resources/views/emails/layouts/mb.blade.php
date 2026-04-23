<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>{{ $emailTitle ?? 'MB Refreshment' }}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#ecfdf5;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#ecfdf5;">
    <tr>
        <td align="center" style="padding:32px 16px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #d1fae5;box-shadow:0 10px 40px rgba(5,150,105,0.12);">
                <tr>
                    <td style="background-color:#059669;padding:28px 36px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                                <td style="font-family:Georgia,'Times New Roman',Times,serif;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">
                                    MB Refreshment
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-top:8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:500;color:rgba(255,255,255,0.92);">
                                    {{ $headerLine }}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding:36px 36px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.65;color:#334155;">
                        @yield('content')
                    </td>
                </tr>
                <tr>
                    <td style="padding:0 36px 32px;">
                        @yield('cta')
                    </td>
                </tr>
                <tr>
                    <td style="padding:24px 36px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
                        <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;line-height:1.6;color:#64748b;">
                            @yield('footer')
                        </p>
                    </td>
                </tr>
            </table>
            <p style="margin:20px 0 0;font-family:sans-serif;font-size:11px;color:#94a3b8;">
                &copy; {{ date('Y') }} {{ config('app.name') }}
            </p>
        </td>
    </tr>
</table>
</body>
</html>
