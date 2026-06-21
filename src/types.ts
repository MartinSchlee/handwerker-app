export interface Kunde {
  id: number;
  firma?: string;
  ansprechpartner: string;
  email: string;
}

export interface Position {
  id: number;
  typ: 'MATERIAL' | 'ARBEITSZEIT';
  bezeichnung: string;
  menge: number;
  einheit: string;
  einzelpreisNetto: number;
}

export interface Kostenvoranschlag {
  id: string;
  status: 'ENTWURF' | 'GESENDET' | 'ANGENOMMEN' | 'ABGELEHNT';
  kunde: Kunde;
  positionen: Position[];
  steuerSatzProzent: number;
}

// Hier exakt an calculator.ts & pdfGenerator.ts angepasst:
export interface KalkulationsErgebnis {
  positionenBrutto: { id: number; brutto: number }[];
  nettoSumme: number;
  steuerSumme: number;
  bruttoSumme: number;
}