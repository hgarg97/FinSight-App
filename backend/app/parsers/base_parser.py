"""Abstract base class for all financial document parsers."""

from abc import ABC, abstractmethod
from typing import List

from ..schemas.transaction import TransactionCreate


class BaseParser(ABC):
    """All parsers must implement *parse* and return a list of TransactionCreate."""

    @abstractmethod
    def parse(self, file_path: str, user_id: str) -> List[TransactionCreate]:
        """Parse *file_path* and return extracted transactions for *user_id*."""
        ...
