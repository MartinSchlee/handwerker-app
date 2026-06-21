import { Kostenvoranschlag, KalkulationsErgebnis } from './types';

// Hilfsfunktion zum kaufmännischen Runden auf 2 Nachkommastellen
function rundeAufZweiStellen(betrag: number): number {
  return Math.round((betrag + Number.EPSILON) * 100) / 100;
}

export function kalkuliereKV(kv: Kostenvoranschlag): KalkulationsErgebnis {
  // 1. Netto-Summe aller Positionen berechnen
  const nettoSumme = kv.positionen.reduce((summe, pos) => {
    const positionsGesamt = pos.menge * pos.einzelpreisNetto;
    return summe + positionsGesamt;
  }, 0);

  // 2. Steuer berechnen
  const steuerBetrag = (nettoSumme * kv.steuerSatzProzent) / 100;

  // 3. Runden, um JS-Fließkommafehler zu vermeiden
  const gerundeteNettoSumme = rundeAufZweiStellen(nettoSumme);
  const gerundeterSteuerBetrag = rundeAufZweiStellen(steuerBetrag);
  const bruttoSumme = rundeAufZweiStellen(gerundeteNettoSumme + gerundeterSteuerBetrag);

  return {
    nettoSumme: gerundeteNettoSumme,
    steuerSumme: gerundeterSteuerBetrag, // <-- Hier auf steuerSumme vereinheitlicht!
    bruttoSumme: bruttoSumme
  };
}