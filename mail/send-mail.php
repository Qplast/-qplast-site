<?php
/**
 * Q Plast — form mail handler
 * -----------------------------------------------------------------
 * فایل روی هاست cPanel/PHP آپلود می‌شود (مثلاً در ریشه‌ی سایت یا
 * پوشه‌ی /mail/) و از طریق fetch() با متد POST از فرم‌های contact.html
 * و inquiry.html صدا زده می‌شود. جایگزین رویکرد mailto: می‌شود —
 * ایمیل واقعاً از سمت سرور با تابع mail() ارسال می‌گردد.
 *
 * پیش‌نیاز: هاست باید mail() فعال داشته باشد (اکثر هاست‌های اشتراکی
 * ایرانی این را دارند). برای جلوگیری از افتادن در اسپم، توصیه می‌شود
 * SPF/DKIM دامنه qplast.ir در تنظیمات DNS/cPanel فعال باشد.
 */

// ---------- تنظیمات ----------
$toAddress   = 'info@qplast.ir';
$fromAddress = 'no-reply@qplast.ir'; // باید روی همین دامنه باشد؛ آدرس بازدیدکننده در Reply-To می‌رود
$fromName    = 'Q Plast Website';
$allowedOrigins = [
  'https://qplast.ir',
  'https://www.qplast.ir',
];

// ---------- هدرهای پایه ----------
header('Content-Type: application/json; charset=utf-8');

// CORS ساده — فقط دامنه‌ی خودمان مجاز است
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
  header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'method_not_allowed']);
  exit;
}

// ---------- خواندن ورودی (JSON یا form-urlencoded) ----------
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
  $data = $_POST;
}

function clean($v) {
  $v = is_string($v) ? trim($v) : '';
  // حذف کاراکترهایی که برای header injection استفاده می‌شوند
  $v = str_replace(["\r", "\n"], ' ', $v);
  return $v;
}

// ---------- هانی‌پات ضد اسپم ----------
// فرم باید یک فیلد مخفی به نام "website" داشته باشد که کاربر واقعی
// هرگز پرش نمی‌کند؛ ربات‌ها معمولاً همه‌ی فیلدها را پر می‌کنند.
if (!empty($data['website'])) {
  // به ربات پاسخ موفق بده ولی چیزی ارسال نکن (گمراه‌کننده برای اسپم‌بات)
  echo json_encode(['ok' => true]);
  exit;
}

$type = clean($data['type'] ?? 'contact'); // "contact" | "inquiry"

$name  = clean($data['name'] ?? '');
$email = clean($data['email'] ?? '');

if ($name === '' || $email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422);
  echo json_encode(['ok' => false, 'error' => 'invalid_input']);
  exit;
}

if ($type === 'inquiry') {
  $company  = clean($data['company'] ?? '');
  $phone    = clean($data['phone'] ?? '');
  $family   = clean($data['family'] ?? '');
  $volume   = clean($data['volume'] ?? '');
  $quantity = clean($data['quantity'] ?? '');
  $message  = is_string($data['message'] ?? '') ? trim($data['message']) : '';

  $subject = 'Quote request — ' . ($company !== '' ? $company : $name);

  $bodyLines = [
    'Name: ' . $name,
    'Company: ' . ($company !== '' ? $company : '-'),
    'Email: ' . $email,
    'Phone: ' . ($phone !== '' ? $phone : '-'),
    'Collection: ' . ($family !== '' ? $family : '-'),
    'Volume: ' . ($volume !== '' ? $volume . ' ml' : '-'),
    'Qty: ' . ($quantity !== '' ? $quantity : '-'),
    '',
    'Message:',
    ($message !== '' ? $message : '-'),
  ];
} else {
  $subject = clean($data['subject'] ?? '');
  $message = is_string($data['message'] ?? '') ? trim($data['message']) : '';

  if ($message === '') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'invalid_input']);
    exit;
  }

  $subject = $subject !== '' ? $subject : ('Contact — ' . $name);

  $bodyLines = [
    'Name: ' . $name,
    'Email: ' . $email,
    '',
    'Subject: ' . ($subject !== '' ? $subject : '-'),
    '',
    'Message:',
    $message,
  ];
}

$body = implode("\n", $bodyLines);

// ---------- ارسال ایمیل ----------
$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$encodedFromName = '=?UTF-8?B?' . base64_encode($fromName) . '?=';

$headers  = "From: {$encodedFromName} <{$fromAddress}>\r\n";
$headers .= "Reply-To: {$name} <{$email}>\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

$sent = @mail($toAddress, $encodedSubject, $body, $headers);

if ($sent) {
  echo json_encode(['ok' => true]);
} else {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'send_failed']);
}
