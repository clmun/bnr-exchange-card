# BNR Exchange Card
Un card personalizat pentru afișarea cursului valutar BNR în Home Assistant.

## Instalare
1. Adaugă acest repository în HACS ca **Custom Repository**.
2. Caută `BNR Exchange Card` și instalează-l.
3. Adaugă resursa în Dashboards (dacă nu se adaugă automat).

## Configurare
```yaml
type: custom:bnr-exchange-card
entities:
  - sensor.curs_valutar_ron_eur
  - sensor.curs_valutar_ron_usd
```
