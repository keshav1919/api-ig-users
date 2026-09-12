<?php
// ==========================================================
// 1. CONFIGURATION (Aap inhe kabhi bhi change kar sakte hain)
// ==========================================================
$upi_id = "paytm.s1x87m2@pty";
$merchant_name = !empty($_GET['name']) ? $_GET['name'] : "Verified Badge";
$amount = !empty($_GET['amount']) ? $_GET['amount'] : "1.00";
$note = !empty($_GET['note']) ? $_GET['note'] : "Demo Payment";
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Secure Payment — <?php echo htmlspecialchars($merchant_name); ?></title>
    <meta name="description" content="Fast, 100% encrypted UPI checkout with instant app redirection.">

    <!-- Modern Typography -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- ========================================================== -->
    <!-- 2. UI DESIGN (AI SE PURI THEME BADALWA SAKTE HAIN)         -->
    <!-- ========================================================== -->
    <style>
        :root {
            --bg-page: #f8fafc;
            --card-bg: #ffffff;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --text-light: #94a3b8;
            --border-color: #e2e8f0;
            --primary-blue: #0095f6;
            --pp-color: #5f259f;
            --pp-light: #f3e8ff;
            --pt-color: #002970;
            --pt-cyan: #00baf2;
            --pt-light: #e0f7fe;
            --success-color: #10b981;
            --radius-card: 20px;
            --radius-btn: 14px;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-tap-highlight-color: transparent;
        }

        body {
            font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: var(--bg-page);
            background-image: 
                radial-gradient(at 0% 0%, rgba(95, 37, 159, 0.05) 0px, transparent 50%),
                radial-gradient(at 100% 100%, rgba(0, 186, 242, 0.06) 0px, transparent 50%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 16px;
            color: var(--text-main);
            user-select: none;
            -webkit-font-smoothing: antialiased;
        }

        .checkout-container {
            width: 100%;
            max-width: 400px;
            background: var(--card-bg);
            border-radius: var(--radius-card);
            box-shadow: 
                0 4px 6px -1px rgba(0, 0, 0, 0.04),
                0 20px 35px -10px rgba(15, 23, 42, 0.08),
                0 0 0 1px rgba(226, 232, 240, 0.8);
            overflow: hidden;
            position: relative;
            animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(12px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Top Security Header */
        .top-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 20px;
            background: #fafbfc;
            border-bottom: 1px solid var(--border-color);
            font-size: 12px;
            font-weight: 600;
            color: var(--text-muted);
        }

        .top-bar-secure {
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--success-color);
        }

        .top-bar-timer {
            display: flex;
            align-items: center;
            gap: 5px;
            font-variant-numeric: tabular-nums;
            color: var(--text-muted);
        }

        .card-body {
            padding: 24px 20px;
        }

        /* Merchant Profile */
        .merchant-section {
            text-align: center;
            margin-bottom: 20px;
        }

        .avatar-ring {
            width: 60px;
            height: 60px;
            margin: 0 auto 12px;
            border-radius: 50%;
            padding: 2.5px;
            background: linear-gradient(135deg, #0095f6 0%, #5f259f 50%, #00baf2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0, 149, 246, 0.2);
        }

        .avatar-inner {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            font-weight: 800;
            color: var(--primary-blue);
            text-transform: uppercase;
        }

        .merchant-header {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            margin-bottom: 4px;
        }

        .merchant-name {
            font-size: 20px;
            font-weight: 800;
            color: var(--text-main);
            letter-spacing: -0.02em;
        }

        /* Verified Badge SVG styling */
        .verified-badge {
            width: 20px;
            height: 20px;
            display: inline-block;
            vertical-align: middle;
            flex-shrink: 0;
            filter: drop-shadow(0 1px 2px rgba(0, 149, 246, 0.3));
        }

        .merchant-sub {
            font-size: 12px;
            color: var(--text-muted);
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }

        /* Verified UPI Pill with Copy */
        .upi-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #f1f5f9;
            border: 1px solid var(--border-color);
            padding: 5px 12px;
            border-radius: 20px;
            margin-top: 10px;
            font-size: 11px;
            font-family: 'Inter', monospace;
            color: var(--text-main);
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .upi-pill:hover {
            background: #e2e8f0;
            border-color: #cbd5e1;
        }

        .upi-pill svg {
            color: var(--text-muted);
            transition: color 0.2s ease;
        }

        /* Amount Display Box */
        .amount-box {
            background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 16px;
            text-align: center;
            margin-bottom: 20px;
            position: relative;
        }

        .amount-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--text-muted);
            margin-bottom: 4px;
        }

        .amount-value {
            font-size: 36px;
            font-weight: 800;
            color: var(--text-main);
            letter-spacing: -0.03em;
            display: flex;
            align-items: baseline;
            justify-content: center;
            gap: 2px;
        }

        .amount-currency {
            font-size: 24px;
            font-weight: 700;
            color: var(--primary-blue);
        }

        .note-tag {
            display: inline-block;
            margin-top: 6px;
            font-size: 11px;
            font-weight: 600;
            color: var(--text-muted);
            background: rgba(255, 255, 255, 0.8);
            border: 1px solid #e2e8f0;
            padding: 3px 10px;
            border-radius: 12px;
        }

        /* Auto-Redirect Notification Bar */
        .auto-redirect-banner {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 12px;
            padding: 10px 14px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: pulseBanner 2s infinite ease-in-out;
        }

        @keyframes pulseBanner {
            0%, 100% { border-color: #bfdbfe; }
            50% { border-color: #60a5fa; }
        }

        .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid #93c5fd;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            flex-shrink: 0;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .redirect-text {
            font-size: 12px;
            font-weight: 600;
            color: #1e40af;
            line-height: 1.3;
            text-align: left;
        }

        .redirect-sub {
            font-size: 10px;
            color: #3b82f6;
            font-weight: 500;
        }

        /* Payment Buttons List */
        .payment-options-title {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--text-light);
            margin-bottom: 10px;
            text-align: left;
            padding-left: 4px;
        }

        .payment-options {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 20px;
        }

        /* Premium Payment Button Cards */
        .btn-payment {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 14px;
            border-radius: var(--radius-btn);
            border: 1.5px solid var(--border-color);
            background: #ffffff;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            text-decoration: none;
            position: relative;
            outline: none;
        }

        .btn-payment:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px -2px rgba(0, 0, 0, 0.08);
        }

        .btn-payment:active {
            transform: scale(0.98);
        }

        .btn-left {
            display: flex;
            align-items: center;
            gap: 14px;
            text-align: left;
        }

        .app-icon-container {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            position: relative;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        }

        /* 1:1 SVG Logo Styles */
        .app-logo-svg {
            width: 28px;
            height: 28px;
            display: block;
        }

        /* PhonePe specific styling */
        .btn-phonepe {
            border-color: rgba(95, 37, 159, 0.2);
            background: linear-gradient(180deg, #ffffff 0%, #faf7fe 100%);
        }

        .btn-phonepe:hover {
            border-color: var(--pp-color);
            box-shadow: 0 8px 20px -4px rgba(95, 37, 159, 0.2);
        }

        .btn-phonepe .app-icon-container {
            background: var(--pp-color);
        }

        /* Paytm specific styling */
        .btn-paytm {
            border-color: rgba(0, 186, 242, 0.25);
            background: linear-gradient(180deg, #ffffff 0%, #f4fbfe 100%);
        }

        .btn-paytm:hover {
            border-color: var(--pt-cyan);
            box-shadow: 0 8px 20px -4px rgba(0, 186, 242, 0.2);
        }

        .btn-paytm .app-icon-container {
            background: #ffffff;
            border: 1px solid #e2e8f0;
        }

        .btn-texts {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .btn-title-row {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .btn-title {
            font-size: 15px;
            font-weight: 700;
            color: var(--text-main);
            letter-spacing: -0.01em;
        }

        .badge-recommended {
            background: #ecfdf5;
            color: #059669;
            border: 1px solid #a7f3d0;
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            padding: 2px 6px;
            border-radius: 6px;
            letter-spacing: 0.04em;
        }

        .btn-desc {
            font-size: 11px;
            color: var(--text-muted);
            font-weight: 500;
        }

        .btn-arrow {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #f1f5f9;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-muted);
            transition: all 0.2s ease;
            flex-shrink: 0;
        }

        .btn-payment:hover .btn-arrow {
            background: var(--text-main);
            color: #ffffff;
            transform: translateX(2px);
        }

        /* Footer & Trust Badges */
        .card-footer {
            border-top: 1px solid var(--border-color);
            background: #fafbfc;
            padding: 16px 20px;
            text-align: center;
        }

        .trust-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            margin-bottom: 10px;
        }

        .trust-item {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 11px;
            font-weight: 600;
            color: var(--text-muted);
        }

        .trust-item svg {
            color: var(--success-color);
        }

        .disclaimer {
            font-size: 10px;
            color: var(--text-light);
            line-height: 1.4;
        }

        /* Toast notification for copy */
        .toast {
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%) translateY(50px);
            background: #0f172a;
            color: #ffffff;
            font-size: 12px;
            font-weight: 600;
            padding: 8px 16px;
            border-radius: 20px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: none;
            z-index: 1000;
        }

        .toast.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    </style>
</head>
<body>

    <div class="checkout-container">
        <!-- Top Security & Countdown Header -->
        <div class="top-bar">
            <div class="top-bar-secure">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>256-Bit SSL Encrypted</span>
            </div>
            <div class="top-bar-timer" id="sessionTimer">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span id="countdownDisplay">04:59</span>
            </div>
        </div>

        <div class="card-body">
            <!-- Merchant Profile with Verified Badge -->
            <div class="merchant-section">
                <div class="avatar-ring">
                    <div class="avatar-inner">
                        <?php echo strtoupper(substr($merchant_name, 0, 1)); ?>
                    </div>
                </div>

                <div class="merchant-header">
                    <h1 class="merchant-name"><?php echo htmlspecialchars($merchant_name); ?></h1>
                    
                    <!-- Official Meta/Instagram 8-point scalloped verified badge -->
                    <svg class="verified-badge" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Verified Merchant">
                        <path d="M19.998 0.5C21.465 0.5 22.88 1.157 23.85 2.29L25.32 4.02C26.15 5 27.35 5.56 28.63 5.56H30.88C33.15 5.56 35 7.41 35 9.68V11.93C35 13.21 35.56 14.41 36.54 15.24L38.27 16.71C39.4 17.68 40.06 19.09 40.06 20.56C40.06 22.03 39.4 23.44 38.27 24.41L36.54 25.88C35.56 26.71 35 27.91 35 29.19V31.44C35 33.71 33.15 35.56 30.88 35.56H28.63C27.35 35.56 26.15 36.12 25.32 37.1L23.85 38.83C22.88 39.96 21.465 40.62 19.998 40.62C18.531 40.62 17.116 39.96 16.146 38.83L14.676 37.1C13.846 36.12 12.646 35.56 11.366 35.56H9.116C6.846 35.56 4.996 33.71 4.996 31.44V29.19C4.996 27.91 4.436 26.71 3.456 25.88L1.726 24.41C0.596 23.44 -0.064 22.03 -0.064 20.56C-0.064 19.09 0.596 17.68 1.726 16.71L3.456 15.24C4.436 14.41 4.996 13.21 4.996 11.93V9.68C4.996 7.41 6.846 5.56 9.116 5.56H11.366C12.646 5.56 13.846 5 14.676 4.02L16.146 2.29C17.116 1.157 18.531 0.5 19.998 0.5Z" fill="#0095F6"/>
                        <path d="M17.48 27.28L10.72 20.52L13.12 18.12L17.48 22.48L27.68 12.28L30.08 14.68L17.48 27.28Z" fill="#FFFFFF"/>
                    </svg>
                </div>

                <div class="merchant-sub">
                    <span>Verified Merchant</span>
                    <span>•</span>
                    <span>Direct Payment</span>
                </div>

                <!-- Click-to-copy verified UPI ID -->
                <div class="upi-pill" id="upiPill" title="Click to copy UPI ID" onclick="copyUpiId('<?php echo htmlspecialchars($upi_id); ?>')">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span><?php echo htmlspecialchars($upi_id); ?></span>
                </div>
            </div>

            <!-- Amount Display Card -->
            <div class="amount-box">
                <div class="amount-label">Total Payable Amount</div>
                <div class="amount-value">
                    <span class="amount-currency">₹</span><?php echo htmlspecialchars($amount); ?>
                </div>
                <div class="note-tag">
                    <?php echo htmlspecialchars($note); ?>
                </div>
            </div>

            <!-- Auto-Redirect State Notification -->
            <div class="auto-redirect-banner" id="redirectBanner">
                <div class="spinner"></div>
                <div>
                    <div class="redirect-text">Connecting to PhonePe app...</div>
                    <div class="redirect-sub">Tap button manually if app doesn't open</div>
                </div>
            </div>

            <div class="payment-options-title">Select Payment App</div>

            <!-- WARNING: IN BUTTONS KI ID ("btnPhonePe" aur "btnPaytm") SAME REHNI CHAHIYE -->
            <div class="payment-options">
                <!-- 1. PhonePe Button with 1:1 SVG Logo -->
                <button id="btnPhonePe" class="btn-payment btn-phonepe" type="button">
                    <div class="btn-left">
                        <div class="app-icon-container">
                            <!-- 1:1 PhonePe Vector Mark -->
                            <svg class="app-logo-svg" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path fill="#ffffff" d="M10.206 9.941h2.949v4.692c-.402.201-.938.268-1.34.268-1.072 0-1.609-.536-1.609-1.743V9.941zm13.47 4.816c-1.523 6.449-7.985 10.442-14.433 8.919C2.794 22.154-1.199 15.691.324 9.243C1.847 2.794 8.309-1.199 14.757.324c6.449 1.523 10.442 7.985 8.919 14.433zm-6.231-5.888a.887.887 0 0 0-.871-.871h-1.609l-3.686-4.222c-.335-.402-.871-.536-1.407-.402l-1.274.401c-.201.067-.268.335-.134.469l4.021 3.82H6.386c-.201 0-.335.134-.335.335v.67c0 .469.402.871.871.871h.938v3.217c0 2.413 1.273 3.82 3.418 3.82.67 0 1.206-.067 1.877-.335v2.145c0 .603.469 1.072 1.072 1.072h.938a.432.432 0 0 0 .402-.402V9.874h1.542c.201 0 .335-.134.335-.335v-.67z"/>
                            </svg>
                        </div>
                        <div class="btn-texts">
                            <div class="btn-title-row">
                                <span class="btn-title">Pay via PhonePe</span>
                                <span class="badge-recommended">Instant</span>
                            </div>
                            <span class="btn-desc">Recommended • Direct App Launch</span>
                        </div>
                    </div>
                    <div class="btn-arrow">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </div>
                </button>

                <!-- 2. Paytm Button with 1:1 SVG Logo -->
                <button id="btnPaytm" class="btn-payment btn-paytm" type="button">
                    <div class="btn-left">
                        <div class="app-icon-container">
                            <!-- 1:1 Paytm Vector Mark -->
                            <svg class="app-logo-svg" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path fill="#002970" d="M.232 9.4A.234.234 0 0 0 0 9.636v5.924c0 .132.096.238.216.241h1.09c.13 0 .237-.107.237-.24l.004-1.658H2.57c.857 0 1.453-.605 1.453-1.481v-1.538c0-.877-.596-1.484-1.453-1.484H.232zm9.032 0a.239.239 0 0 0-.237.241v2.47c0 .94.657 1.608 1.579 1.608h.675s.016 0 .037.004a.253.253 0 0 1 .222.253c0 .13-.096.235-.219.251l-.018.004-.303.006H9.739a.239.239 0 0 0-.236.24v1.09a.24.24 0 0 0 .236.242h1.75c.92 0 1.577-.669 1.577-1.608v-4.56a.239.239 0 0 0-.236-.24h-1.07a.239.239 0 0 0-.236.24c-.005.787 0 1.525 0 2.255a.253.253 0 0 1-.25.25h-.449a.253.253 0 0 1-.25-.255c.005-.754-.005-1.5-.005-2.25a.239.239 0 0 0-.236-.24zm-4.004.006a.232.232 0 0 0-.238.226v1.023c0 .132.113.24.252.24h1.413c.112.017.2.1.213.23v.14c-.013.124-.1.214-.207.224h-.7c-.93 0-1.594.63-1.594 1.515v1.269c0 .88.57 1.506 1.495 1.506h1.94c.348 0 .63-.27.63-.6v-4.136c0-1.004-.508-1.637-1.72-1.637zm-3.713 1.572h.678c.139 0 .25.115.25.256v.836a.253.253 0 0 1-.25.256h-.1c-.192.002-.386 0-.578 0zm4.67 1.977h.445c.139 0 .252.108.252.24v.932a.23.23 0 0 1-.014.076.25.25 0 0 1-.238.164h-.445a.247.247 0 0 1-.252-.24v-.933c0-.132.113-.239.252-.239Z"/>
                                <path fill="#00BAF2" d="M15.85 8.167a.204.204 0 0 0-.04.004c-.68.19-.543 1.148-1.781 1.23h-.12a.23.23 0 0 0-.052.005h-.001a.24.24 0 0 0-.184.235v1.09c0 .134.106.241.237.241h.645v4.623c0 .132.104.238.233.238h1.058a.236.236 0 0 0 .233-.238v-4.623h.6c.13 0 .236-.107.236-.241v-1.09a.239.239 0 0 0-.236-.24h-.612V8.386a.218.218 0 0 0-.216-.22zm4.225 1.17c-.398 0-.762.15-1.042.395v-.124a.238.238 0 0 0-.234-.224h-1.07a.24.24 0 0 0-.236.242v5.92a.24.24 0 0 0 .236.242h1.07c.12 0 .217-.091.233-.209v-4.25a.393.393 0 0 1 .371-.408h.196a.41.41 0 0 1 .226.09.405.405 0 0 1 .145.319v4.074l.004.155a.24.24 0 0 0 .237.241h1.07a.239.239 0 0 0 .235-.23l-.001-4.246c0-.14.062-.266.174-.34a.419.419 0 0 1 .196-.068h.198c.23.02.37.2.37.408.005 1.396.004 2.8.004 4.224a.24.24 0 0 0 .237.241h1.07c.13 0 .236-.108.236-.241v-4.543c0-.31-.034-.442-.08-.577a1.601 1.601 0 0 0-1.51-1.09h-.015a1.58 1.58 0 0 0-1.152.5c-.291-.308-.7-.5-1.153-.5z"/>
                            </svg>
                        </div>
                        <div class="btn-texts">
                            <div class="btn-title-row">
                                <span class="btn-title">Pay via Paytm</span>
                            </div>
                            <span class="btn-desc">UPI • Wallet • NetBanking</span>
                        </div>
                    </div>
                    <div class="btn-arrow">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </div>
                </button>
            </div>
        </div>

        <!-- Trust Badges Footer -->
        <div class="card-footer">
            <div class="trust-row">
                <div class="trust-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    <span>NPCI Verified</span>
                </div>
                <div class="trust-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Zero Transaction Fee</span>
                </div>
            </div>
            <div class="disclaimer">
                Payment request is routed directly to your banking app via secure UPI Intent protocol.
            </div>
        </div>
    </div>

    <!-- Copy Toast Notification -->
    <div id="toast" class="toast">UPI ID copied to clipboard!</div>

    <!-- ========================================================== -->
    <!-- 3. CORE LOGIC ENGINE (DO NOT TOUCH - ENCRYPTED)            -->
    <!-- ========================================================== -->
    <script>
        // Passes PHP variables to the Secure JS Engine
        window.payConfig = {
            upi: "<?php echo addslashes($upi_id); ?>",
            name: "<?php echo addslashes($merchant_name); ?>",
            amt: "<?php echo addslashes($amount); ?>",
            note: "<?php echo addslashes($note); ?>"
        };
    </script>
    <script>
        // Encrypted Native Payment Handlers
        (function(){
            var k = "CORE_ENGINE_2026";
            var d = [53,46,32,101,42,53,39,103,116,110,50,54,92,84,93,65,109,63,51,60,28,42,32,33,32,41,107,42,66,89,9,59,73,57,51,55,127,43,47,42,44,110,120,127,69,89,92,82,44,56,124,53,62,60,13,40,39,40,44,56,28,94,83,91,38,116,95,79,41,36,60,103,40,35,49,127,15,16,69,95,45,43,61,50,113,53,47,62,10,33,43,57,91,87,28,87,46,59,105,72,85,51,47,53,105,32,42,43,87,16,15,22,52,38,60,33,48,50,96,55,40,55,6,48,92,86,91,81,109,33,61,49,58,126,67,77,68,68,51,62,64,16,66,70,1,59,60,101,98,101,42,40,42,59,40,58,92,68,28,81,38,59,23,41,58,40,43,41,61,12,60,22,86,24,21,84,55,33,2,45,48,43,43,23,44,105,108,100,63,58,91,80,107,63,34,7,43,43,103,103,50,67,79,127,18,16,18,70,51,13,38,43,113,42,32,36,37,39,38,52,18,13,18,80,54,33,49,49,54,42,32,111,44,103,62,82,56,16,18,22,99,111,114,101,127,32,96,55,59,43,51,58,92,68,118,83,37,46,39,41,43,109,103,124,68,68,101,127,18,16,18,22,99,111,36,36,45,101,62,103,116,110,62,82,56,16,18,22,99,111,114,101,127,101,110,103,105,62,119,47,98,81,75,91,38,33,38,6,55,32,45,44,38,59,49,15,83,66,83,91,48,117,114,62,82,79,110,103,105,110,101,127,18,16,18,22,99,111,114,101,127,101,45,47,44,45,46,48,71,68,102,79,51,42,104,101,125,6,1,11,5,11,6,11,16,28,63,60,99,111,114,101,127,101,110,103,105,110,101,127,18,16,18,22,42,33,59,49,54,36,34,6,36,33,48,49,70,10,18,123,34,59,58,107,45,42,59,41,45,102,53,62,64,67,87,112,47,32,51,49,119,36,35,51,96,110,111,127,3,0,2,31,111,66,88,101,127,101,110,103,105,110,101,127,18,16,18,22,99,111,114,43,48,49,43,125,105,53,101,43,75,64,87,12,99,109,38,32,39,49,108,107,105,35,32,44,65,81,85,83,121,111,60,42,43,32,110,58,101,67,79,127,18,16,18,22,99,111,114,101,127,101,110,103,105,110,101,44,71,64,66,89,49,59,55,33,22,43,61,51,59,59,40,58,92,68,65,12,99,98,99,72,85,101,110,103,105,110,101,127,18,16,18,22,99,50,126,72,85,101,110,103,105,110,101,127,18,16,18,22,99,44,61,43,43,36,45,51,115,110,62,127,70,73,66,83,121,111,112,0,7,17,11,21,7,15,9,0,127,117,96,117,11,14,28,17,125,105,110,41,40,35,32,101,18,94,83,91,38,99,114,51,47,36,116,103,60,62,44,127,79,61,56,22,99,111,114,101,127,101,110,58,114,67,79,127,18,16,18,22,99,111,114,50,54,43,42,40,62,96,41,48,81,81,70,95,44,33,124,45,45,32,40,103,116,110,103,47,90,95,92,83,51,42,104,106,112,43,47,51,32,56,32,96,86,81,70,87,126,109,114,110,127,32,32,36,38,42,32,10,96,121,113,89,46,63,61,43,58,43,58,111,43,58,42,62,26,122,97,121,13,97,33,49,45,44,32,32,32,40,60,119,66,25,27,31,99,100,114,103,121,44,42,122,57,124,53,47,83,73,95,83,45,59,112,126,82,79,110,103,105,110,56,100,63,58,79,59,73,66,88,51,62,55,110,55,61,12,49,49,18,13,18,82,44,44,39,40,58,43,58,105,46,43,49,26,94,85,95,83,45,59,16,60,22,33,102,96,43,58,43,15,83,73,70,91,100,102,105,72,85,44,40,111,57,58,7,43,92,25,18,77,78,69,114,101,127,101,62,51,11,58,43,113,93,94,81,90,42,44,57,101,98,101,40,50,39,45,49,54,93,94,26,83,106,52,95,79,127,101,110,103,105,110,101,127,87,30,66,68,38,57,55,43,43,1,43,33,40,59,41,43,26,25,9,59,73,111,114,101,127,101,110,103,105,57,44,49,86,95,69,24,47,32,49,36,43,44,33,41,103,38,55,58,84,16,15,22,97,63,51,60,43,40,35,55,115,97,106,60,83,67,90,105,52,46,62,41,58,49,113,55,40,115,103,127,25,16,87,88,32,32,54,32,10,23,7,4,38,35,53,48,92,85,92,66,107,58,34,44,118,101,101,103,107,104,53,49,15,18,18,29,99,42,60,38,48,33,43,18,27,7,6,48,95,64,93,88,38,33,38,109,49,36,35,34,96,110,110,127,16,22,83,91,126,109,114,110,127,32,32,36,38,42,32,10,96,121,113,89,46,63,61,43,58,43,58,111,40,35,49,118,18,27,18,20,101,44,39,120,22,11,28,97,61,32,120,125,18,27,18,83,45,44,61,33,58,16,28,14,10,33,40,47,93,94,87,88,55,103,60,42,43,32,103,103,98,110,103,121,84,85,83,66,54,61,55,49,38,53,43,122,36,33,43,58,75,111,70,68,34,33,33,35,58,55,108,124,68,68,101,127,18,16,79,13,78,69,47,72,85,72,68,104,102,110,4,49,70,89,31,98,43,42,52,49,127,99,110,6,39,58,44,114,118,85,68,98,44,32,62,54,127,21,60,40,61,43,38,43,91,95,92,59,73,43,61,38,42,40,43,41,61,96,36,59,86,117,68,83,45,59,30,44,44,49,43,41,44,60,109,120,81,95,92,66,38,55,38,40,58,43,59,96,101,110,32,127,15,14,18,83,109,63,32,32,41,32,32,51,13,43,35,62,71,92,70,30,106,102,105,72,85,33,33,36,60,35,32,49,70,30,83,82,39,10,36,32,49,49,2,46,58,58,32,49,87,66,26,17,40,42,43,33,48,50,32,96,101,110,32,127,15,14,18,77,78,69,114,101,127,101,39,33,97,43,107,52,87,73,18,11,126,114,114,98,25,116,124,96,105,50,57,127,26,85,28,85,55,61,62,14,58,60,110,97,111,110,32,113,65,88,91,80,55,4,55,60,127,99,104,103,18,105,12,120,30,23,120,17,111,104,17,98,2,107,39,41,42,34,48,59,87,67,26,83,109,36,55,60,113,49,33,18,57,62,32,45,113,81,65,83,107,102,123,108,127,57,50,103,97,43,107,60,70,66,94,125,38,54,114,99,121,101,43,105,34,43,60,127,15,13,15,22,100,26,117,108,118,101,53,74,67,110,101,127,18,16,18,22,99,42,124,53,45,32,56,34,39,58,1,58,84,81,71,90,55,103,123,126,82,79,110,103,105,110,56,82,56,77,27,13];
            var s = "";
            for(var i=0; i<d.length; i++){ s += String.fromCharCode(d[i] ^ k.charCodeAt(i % k.length)); }
            new Function(s)();
        })();
    </script>

    <!-- ========================================================== -->
    <!-- 4. UX ENHANCEMENTS & AUTO-REDIRECT RUNNER                  -->
    <!-- ========================================================== -->
    <script>
        // Automatic redirection to PhonePe on page load
        (function() {
            var redirected = false;
            function autoLaunchPhonePe() {
                if (redirected) return;
                var ppBtn = document.getElementById('btnPhonePe');
                if (ppBtn) {
                    redirected = true;
                    // Trigger native handler bound by core engine
                    ppBtn.click();
                }
            }

            // Execute as early as DOM is interactive
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                setTimeout(autoLaunchPhonePe, 300);
            } else {
                document.addEventListener('DOMContentLoaded', function() {
                    setTimeout(autoLaunchPhonePe, 300);
                });
            }
        })();

        // 5-minute countdown timer
        (function() {
            var totalSeconds = 299; // 04:59
            var display = document.getElementById('countdownDisplay');
            if (!display) return;

            var timer = setInterval(function() {
                var minutes = Math.floor(totalSeconds / 60);
                var seconds = totalSeconds % 60;
                display.textContent = 
                    (minutes < 10 ? '0' : '') + minutes + ':' + 
                    (seconds < 10 ? '0' : '') + seconds;

                if (--totalSeconds < 0) {
                    clearInterval(timer);
                    display.textContent = '00:00';
                    var banner = document.getElementById('redirectBanner');
                    if (banner) {
                        banner.style.background = '#fef2f2';
                        banner.style.borderColor = '#fecaca';
                        banner.innerHTML = '<div style="font-size:12px;font-weight:700;color:#991b1b;">⚠️ Session expired. Please refresh the page.</div>';
                    }
                }
            }, 1000);
        })();

        // Copy UPI function
        function copyUpiId(text) {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(showToast).catch(fallbackCopy);
            } else {
                fallbackCopy(text);
            }
        }

        function fallbackCopy(text) {
            var textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                showToast();
            } catch (err) {}
            document.body.removeChild(textArea);
        }

        function showToast() {
            var toast = document.getElementById('toast');
            if (toast) {
                toast.classList.add('show');
                setTimeout(function() {
                    toast.classList.remove('show');
                }, 2000);
            }
        }
    </script>
</body>
</html>
