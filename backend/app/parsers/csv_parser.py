"""CSV parser for common bank/credit-card export formats."""

import csv
import io
import logging
import re
from datetime import date, datetime
from typing import List, Optional

from .base_parser import BaseParser
from .normalizer import normalize_merchant
from ..schemas.transaction import TransactionCreate

logger = logging.getLogger(__name__)

# ── Column name hints ──────────────────────────────────────────────────────────
_DATE_HINTS = {"date", "trans date", "transaction date", "post date", "posted date",
               "value date", "effective date"}
_DESC_HINTS = {"description", "merchant", "memo", "name", "payee", "details",
               "transaction description", "narration", "particulars"}
_AMOUNT_HINTS = {"amount", "transaction amount", "net amount", "value"}
_DEBIT_HINTS = {"debit", "withdrawals", "withdrawal", "charges", "charge", "payment"}
_CREDIT_HINTS = {"credit", "deposits", "deposit", "credits"}
_CATEGORY_HINTS = {"category", "type", "transaction type", "spending category"}

# ── Date format attempts ───────────────────────────────────────────────────────
_DATE_FORMATS = [
    "%m/%d/%Y", "%Y-%m-%d", "%m/%d/%y", "%d/%m/%Y",
    "%m-%d-%Y", "%d-%m-%Y", "%Y/%m/%d",
    "%b %d, %Y", "%d %b %Y", "%B %d, %Y",
]

# Rows that are totals/summaries — skip them
_SKIP_ROW_RE = re.compile(
    r"^\s*(total|grand total|balance|opening|closing|subtotal|beginning)\b",
    re.I,
)


def _detect_encoding(path: str) -> str:
    try:
        import chardet  # type: ignore
        with open(path, "rb") as f:
            raw = f.read(32768)
        result = chardet.detect(raw)
        return result.get("encoding") or "utf-8"
    except ImportError:
        return "utf-8"


def _header_key(header: str) -> str:
    return header.strip().lower().replace("_", " ").replace("-", " ")


def _find_col(headers: List[str], hints: set[str]) -> Optional[int]:
    for i, h in enumerate(headers):
        if _header_key(h) in hints:
            return i
    # partial match
    for i, h in enumerate(headers):
        key = _header_key(h)
        if any(hint in key for hint in hints):
            return i
    return None


def _parse_date(raw: str) -> Optional[date]:
    raw = raw.strip()
    for fmt in _DATE_FORMATS:
        try:
            return datetime.strptime(raw, fmt).date()
        except ValueError:
            continue
    return None


def _parse_amount(raw: str) -> Optional[float]:
    """Parse amount from common formats: -1,234.56 / (1,234.56) / 1.234,56"""
    s = raw.strip()
    if not s or s in ("-", "–", ""):
        return None
    negative = False
    if s.startswith("(") and s.endswith(")"):
        negative = True
        s = s[1:-1]
    if s.startswith("-"):
        negative = True
        s = s[1:]
    # Strip currency symbols and commas
    s = re.sub(r"[£€$¥₹,\s]", "", s)
    try:
        value = float(s)
        return -value if negative else value
    except ValueError:
        return None


class CSVParser(BaseParser):
    """Parses common bank-exported CSV files into TransactionCreate objects."""

    def parse(self, file_path: str, user_id: str) -> List[TransactionCreate]:
        encoding = _detect_encoding(file_path)
        transactions: List[TransactionCreate] = []

        with open(file_path, encoding=encoding, errors="replace", newline="") as fh:
            # Sniff dialect
            sample = fh.read(4096)
            fh.seek(0)
            try:
                dialect = csv.Sniffer().sniff(sample)
            except csv.Error:
                dialect = csv.excel

            reader = csv.reader(fh, dialect)
            headers: Optional[List[str]] = None

            for row_num, row in enumerate(reader, start=1):
                if not any(cell.strip() for cell in row):
                    continue  # blank row

                if headers is None:
                    # Treat first non-empty row as header
                    headers = row
                    date_col = _find_col(headers, _DATE_HINTS)
                    desc_col = _find_col(headers, _DESC_HINTS)
                    amount_col = _find_col(headers, _AMOUNT_HINTS)
                    debit_col = _find_col(headers, _DEBIT_HINTS)
                    credit_col = _find_col(headers, _CREDIT_HINTS)
                    category_col = _find_col(headers, _CATEGORY_HINTS)

                    if date_col is None or desc_col is None:
                        # Can't parse without date and description
                        logger.warning(
                            "CSV: could not identify date/description columns in %s",
                            file_path,
                        )
                        return []
                    continue

                # Skip summary rows
                raw_desc = row[desc_col].strip() if desc_col < len(row) else ""
                if _SKIP_ROW_RE.match(raw_desc):
                    continue

                raw_date = row[date_col].strip() if date_col < len(row) else ""
                txn_date = _parse_date(raw_date)
                if txn_date is None:
                    logger.debug("Row %d: unparseable date '%s', skipping", row_num, raw_date)
                    continue

                if not raw_desc:
                    continue

                # Amount resolution
                amount: Optional[float] = None
                if amount_col is not None and amount_col < len(row):
                    amount = _parse_amount(row[amount_col])

                if amount is None and debit_col is not None and credit_col is not None:
                    debit_raw = row[debit_col].strip() if debit_col < len(row) else ""
                    credit_raw = row[credit_col].strip() if credit_col < len(row) else ""
                    debit_val = _parse_amount(debit_raw)
                    credit_val = _parse_amount(credit_raw)
                    if debit_val and abs(debit_val) > 0:
                        amount = -abs(debit_val)
                    elif credit_val and abs(credit_val) > 0:
                        amount = abs(credit_val)

                if amount is None:
                    logger.debug("Row %d: could not parse amount, skipping", row_num)
                    continue

                category_raw = ""
                if category_col is not None and category_col < len(row):
                    category_raw = row[category_col].strip()

                merchant = normalize_merchant(raw_desc)
                txn_type = "income" if amount > 0 else "expense"

                try:
                    transactions.append(
                        TransactionCreate(
                            date=txn_date,
                            merchant=merchant,
                            amount_total=abs(amount),
                            transaction_type=txn_type,
                            category=category_raw or None,
                        )
                    )
                except Exception as exc:
                    logger.warning("Row %d: schema error — %s", row_num, exc)

        return transactions
