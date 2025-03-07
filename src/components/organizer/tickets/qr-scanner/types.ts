
export interface ScanResult {
  ticketId: string;
  eventId: string;
  ticketType: string;
  userName: string;
  isValid: boolean;
  message: string;
  isCheckedIn: boolean;
}

export interface QrCodeScannerProps {
  onSuccess?: (ticketId: string, eventId: string) => void;
  eventId?: string;
}
