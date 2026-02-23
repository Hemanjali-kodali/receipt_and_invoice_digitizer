import sys
import json
import re
import os
import pytesseract

# Windows: set Tesseract path if not on PATH
# Download installer: https://github.com/UB-Mannheim/tesseract/wiki
_WIN_TESSERACT = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
if os.name == 'nt' and os.path.exists(_WIN_TESSERACT):
    pytesseract.pytesseract.tesseract_cmd = _WIN_TESSERACT


def extract_text_from_image(file_path):
    from PIL import Image
    img = Image.open(file_path)
    return pytesseract.image_to_string(img)


def extract_text_from_pdf(file_path):
    from pdf2image import convert_from_path
    pages = convert_from_path(file_path)
    text = ''
    for page in pages:
        text += pytesseract.image_to_string(page) + '\n'
    return text


# ─── HELPERS ────────────────────────────────────────────────────────────────

def _find(pattern, text, group=1, flags=re.IGNORECASE):
    m = re.search(pattern, text, flags)
    return m.group(group).strip() if m else None

def _find_amount(pattern, text):
    val = _find(pattern, text)
    if val:
        return val.replace(',', '').lstrip('$£€₹ ')
    return None

def _detect_currency(text):
    if re.search(r'₹|Rs\.?|INR', text):
        return 'INR'
    if re.search(r'£', text):
        return 'GBP'
    if re.search(r'€', text):
        return 'EUR'
    return 'USD'

def _detect_doc_type(text):
    t = text.lower()
    invoice_score = sum([
        bool(re.search(r'invoice', t)),
        bool(re.search(r'bill\s+to|billed\s+to', t)),
        bool(re.search(r'purchase\s+order|p\.?o\.?\s+no', t)),
        bool(re.search(r'gstin|tax\s+id|vat\s+no', t)),
        bool(re.search(r'due\s+date|payment\s+terms', t)),
    ])
    receipt_score = sum([
        bool(re.search(r'receipt', t)),
        bool(re.search(r'cashier|clerk', t)),
        bool(re.search(r'transaction\s+id|txn\s+id', t)),
        bool(re.search(r'change\s+due|amount\s+tendered', t)),
        bool(re.search(r'thank\s+you\s+for\s+(your\s+)?(?:shopping|purchase|visit)', t)),
    ])
    return 'invoice' if invoice_score >= receipt_score else 'receipt'


# ─── LINE ITEMS ─────────────────────────────────────────────────────────────

def _extract_line_items(text):
    items = []
    # Pattern: description  qty  unit_price  total  (columns separated by 2+ spaces)
    pattern = re.findall(
        r'^(.{3,50}?)\s{2,}(\d+(?:\.\d+)?)\s{2,}[\$£€₹]?\s*(\d[\d,]*\.\d{2})\s{2,}[\$£€₹]?\s*(\d[\d,]*\.\d{2})',
        text, re.MULTILINE
    )
    for m in pattern[:20]:
        items.append({
            'description': m[0].strip(),
            'quantity':    m[1],
            'unitPrice':   m[2].replace(',', ''),
            'total':       m[3].replace(',', ''),
        })

    if not items:
        # Simpler fallback: description  qty  price
        pattern2 = re.findall(
            r'^(.{3,50}?)\s{2,}(\d+)\s{2,}[\$£€₹]?\s*(\d[\d,]*\.\d{2})',
            text, re.MULTILINE
        )
        for m in pattern2[:20]:
            items.append({
                'description': m[0].strip(),
                'quantity':    m[1],
                'unitPrice':   m[2].replace(',', ''),
                'total':       None,
            })

    return items if items else None


# ─── INVOICE FIELDS ─────────────────────────────────────────────────────────

def extract_invoice_fields(text):
    data = {}

    # ── Basic Information ──
    data['invoiceNumber'] = _find(
        r'invoice\s*(?:no\.?|num(?:ber)?|#)?\s*[:\-]?\s*([A-Z0-9][\w\-/]{1,30})', text)
    data['invoiceDate'] = _find(
        r'(?:invoice\s+date|date\s+of\s+invoice|bill\s+date)\s*[:\-]?\s*'
        r'(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}'
        r'|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s*\d{4})', text)
    if not data['invoiceDate']:
        data['invoiceDate'] = _find(r'\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b', text)
    data['dueDate'] = _find(
        r'due\s+date\s*[:\-]?\s*'
        r'(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}'
        r'|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s*\d{4})', text)
    data['purchaseOrderNumber'] = _find(
        r'(?:purchase\s+order|p\.?o\.?)\s*(?:no\.?|num(?:ber)?|#)?\s*[:\-]?\s*([A-Z0-9][\w\-/]{1,20})', text)
    data['paymentTerms'] = _find(
        r'payment\s+terms?\s*[:\-]?\s*([^\n]{3,40})', text)

    # ── Seller / Vendor Details ──
    lines = [l.strip() for l in text.split('\n') if l.strip() and len(l.strip()) > 2]
    data['vendorName'] = lines[0] if lines else None
    data['vendorAddress'] = _find(
        r'(?:from|sold\s+by|vendor\s+address|our\s+address)\s*[:\-]?\s*([^\n]{5,80})', text)
    data['vendorPhone'] = _find(
        r'(?:ph(?:one)?|tel(?:ephone)?|mob(?:ile)?|contact)\s*[:\-]?\s*([\+\d\s\-\(\)]{7,20})', text)
    data['vendorEmail'] = _find(r'[\w\.\-]+@[\w\.\-]+\.[a-zA-Z]{2,}', text, group=0)
    data['vendorGSTIN'] = _find(
        r'\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b', text)
    data['vendorTaxId'] = _find(
        r'(?:tax\s*id|ein|tin|pan)\s*[:\-]?\s*([A-Z0-9\-]{5,20})', text)

    # ── Buyer Details ──
    data['customerName'] = _find(
        r'(?:bill(?:ed)?\s+to|sold\s+to|customer\s+name|client\s+name)\s*[:\-]?\s*([^\n]{2,60})', text)
    data['billingAddress'] = _find(
        r'(?:billing\s+address|bill\s+to\s+address)\s*[:\-]?\s*([^\n]{5,80})', text)
    data['shippingAddress'] = _find(
        r'(?:ship(?:ping)?\s+(?:to|address)|deliver(?:y)?\s+(?:to|address))\s*[:\-]?\s*([^\n]{5,80})', text)
    data['buyerGSTIN'] = _find(
        r'(?:buyer|customer|client)\s+gstin\s*[:\-]?\s*'
        r'([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})', text)

    # ── Tax Details ──
    data['cgst'] = _find_amount(
        r'CGST\s*(?:@\s*[\d\.]+\s*%\s*)?\s*[:\-]?\s*[\$£€₹]?\s*(\d[\d,]*(?:\.\d{1,2})?)', text)
    data['sgst'] = _find_amount(
        r'SGST\s*(?:@\s*[\d\.]+\s*%\s*)?\s*[:\-]?\s*[\$£€₹]?\s*(\d[\d,]*(?:\.\d{1,2})?)', text)
    data['igst'] = _find_amount(
        r'IGST\s*(?:@\s*[\d\.]+\s*%\s*)?\s*[:\-]?\s*[\$£€₹]?\s*(\d[\d,]*(?:\.\d{1,2})?)', text)
    data['taxPercentage'] = _find(r'(?:tax|gst|vat)\s*@?\s*([\d\.]+)\s*%', text)
    data['totalTax'] = _find_amount(
        r'(?:total\s+tax|tax\s+total)\s*[:\-]?\s*[\$£€₹]?\s*(\d[\d,]*(?:\.\d{1,2})?)', text)

    # ── Totals ──
    data['subtotal'] = _find_amount(
        r'(?:sub\s*total|subtotal)\s*[:\-]?\s*[\$£€₹]?\s*(\d[\d,]*\.\d{2})', text)
    data['discount'] = _find_amount(
        r'(?:discount|less)\s*[:\-]?\s*[\$£€₹]?\s*(\d[\d,]*(?:\.\d{1,2})?)', text)
    data['grandTotal'] = _find_amount(
        r'(?:grand\s+total|total\s+amount|net\s+total|total\s+due|amount\s+due|total)\s*[:\-]?\s*[\$£€₹]?\s*(\d[\d,]*\.\d{2})', text)
    data['amountPaid'] = _find_amount(
        r'(?:amount\s+paid|paid\s+amount|amount\s+received)\s*[:\-]?\s*[\$£€₹]?\s*(\d[\d,]*(?:\.\d{1,2})?)', text)
    data['balanceDue'] = _find_amount(
        r'(?:balance\s+due|balance\s+payable|amount\s+outstanding)\s*[:\-]?\s*[\$£€₹]?\s*(\d[\d,]*(?:\.\d{1,2})?)', text)

    # ── Line Items ──
    items = _extract_line_items(text)
    if items:
        data['lineItems'] = items

    data['currency'] = _detect_currency(text)
    return {k: v for k, v in data.items() if v is not None}


# ─── RECEIPT FIELDS ─────────────────────────────────────────────────────────

def extract_receipt_fields(text):
    data = {}

    # ── Store Information ──
    lines = [l.strip() for l in text.split('\n') if l.strip() and len(l.strip()) > 2]
    data['storeName'] = lines[0] if lines else None
    data['storeAddress'] = _find(
        r'(?:store\s+address|address)\s*[:\-]?\s*([^\n]{5,80})', text)
    if not data['storeAddress'] and len(lines) > 1:
        data['storeAddress'] = lines[1]
    data['storePhone'] = _find(
        r'(?:ph(?:one)?|tel(?:ephone)?|mob(?:ile)?|contact|call\s+us)\s*[:\-]?\s*([\+\d\s\-\(\)]{7,20})', text)

    # ── Transaction Details ──
    data['receiptNumber'] = _find(
        r'(?:receipt\s*(?:no\.?|num(?:ber)?|#)|rcpt\s*#?)\s*[:\-]?\s*([A-Z0-9][\w\-]{1,20})', text)
    data['transactionId'] = _find(
        r'(?:transaction\s*(?:id|no\.?|#)|txn\s*(?:id|#?)|trans\s*(?:id|no))\s*[:\-]?\s*([A-Z0-9][\w\-]{3,30})', text)
    data['date'] = _find(r'\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b', text)
    data['time'] = _find(r'\b(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)\b', text)
    data['cashierName'] = _find(
        r'(?:cashier|served\s+by|operator|clerk|staff)\s*[:\-]?\s*([A-Za-z][A-Za-z\s\.]{1,30})', text)

    # ── Purchased Items ──
    items = _extract_line_items(text)
    if items:
        data['items'] = items

    # ── Payment Details ──
    data['subtotal'] = _find_amount(
        r'(?:sub\s*total|subtotal)\s*[:\-]?\s*[\$£€₹]?\s*(\d[\d,]*\.\d{2})', text)
    data['tax'] = _find_amount(
        r'(?:tax|vat|gst|cgst|sgst|igst)\s*[:\-]?\s*[\$£€₹]?\s*(\d[\d,]*(?:\.\d{1,2})?)', text)
    data['discount'] = _find_amount(
        r'(?:discount|savings|you\s+saved)\s*[:\-]?\s*[\$£€₹]?\s*(\d[\d,]*(?:\.\d{1,2})?)', text)
    data['totalAmount'] = _find_amount(
        r'(?:grand\s+total|total\s+amount|total\s+due|net\s+total|total)\s*[:\-]?\s*[\$£€₹]?\s*(\d[\d,]*\.\d{2})', text)
    data['paymentMethod'] = _find(
        r'\b(cash|credit\s+card|debit\s+card|upi|net\s+banking|bank\s+transfer|cheque|check|paytm|gpay|phonepe|neft|rtgs)\b', text)
    data['amountTendered'] = _find_amount(
        r'(?:amount\s+tendered|cash\s+(?:given|paid|tendered))\s*[:\-]?\s*[\$£€₹]?\s*(\d[\d,]*(?:\.\d{1,2})?)', text)
    data['changeDue'] = _find_amount(
        r'(?:change\s+due|change\s+returned|change)\s*[:\-]?\s*[\$£€₹]?\s*(\d[\d,]*(?:\.\d{1,2})?)', text)

    data['currency'] = _detect_currency(text)
    return {k: v for k, v in data.items() if v is not None}


# ─── MAIN PARSE ─────────────────────────────────────────────────────────────

def parse_fields(text):
    doc_type = _detect_doc_type(text)
    fields = extract_invoice_fields(text) if doc_type == 'invoice' else extract_receipt_fields(text)
    fields['documentType'] = doc_type
    fields['rawText'] = text

    # ── Normalized aliases so existing frontend fields always resolve ──
    fields['vendor']        = fields.get('vendorName') or fields.get('storeName')
    fields['total']         = fields.get('grandTotal') or fields.get('totalAmount')
    fields['date']          = fields.get('invoiceDate') or fields.get('date')
    fields['invoiceNumber'] = fields.get('invoiceNumber') or fields.get('receiptNumber')

    # Strip None aliases
    fields = {k: v for k, v in fields.items() if v is not None}
    return fields


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'success': False, 'error': 'No file path provided'}))
        sys.exit(1)

    file_path = sys.argv[1]
    ext = os.path.splitext(file_path)[1].lower()

    try:
        if ext == '.pdf':
            text = extract_text_from_pdf(file_path)
        else:
            text = extract_text_from_image(file_path)

        data = parse_fields(text)
        print(json.dumps({'success': True, 'data': data}))
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))
