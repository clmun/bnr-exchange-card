import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class BnrExchangeCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const type = this.config.card_type || 'bnr';
    const entities = this.config.entities || [];

    return html`
      <ha-card header="${this.config.title || ''}">
        <div class="card-content">
          <div class="currency-grid ${type}-mode header">
            ${this.renderHeader(type)}
          </div>
          <div class="rows-container">
            ${entities.map((ent) => this.renderRow(ent, type))}
          </div>
        </div>
      </ha-card>
    `;
  }

  renderHeader(type) {
    if (type === 'exchange') {
      return html`<div class="cell align-left">Monedă</div><div class="cell align-right">💰 Vânzare</div><div class="cell align-right">🛒 Cumpărare</div>`;
    } else if (type === 'euribor') {
      return html`<div class="cell align-left">Perioadă</div><div class="cell align-right">Rată %</div>`;
    }
    return html`<div class="cell align-left">Monedă</div><div class="cell align-right">Curs BNR</div><div class="cell align-right">Dif.</div><div class="cell align-right">%</div>`;
  }

  renderRow(entityId, type) {
    const s = this.hass.states[entityId];
    if (!s) return html`<div class="error">Senzor negăsit: ${entityId}</div>`;

    if (type === 'euribor') {
      // Definim cheile exact cum apar în senzorul tău
      const mappings = [
        { key: '1 lună', label: 'Euribor 1M' },
        { key: '3 luni', label: 'Euribor 3M' },
        { key: '6 luni', label: 'Euribor 6M' },
        { key: '12 luni', label: 'Euribor 12M' }
      ];
      return html`
        ${mappings.map(m => html`
          <div class="currency-grid euribor-mode row">
            <div class="cell bold align-left">${m.label}</div>
            <div class="cell bold align-right value-cell">${s.attributes[m.key] ? Number(s.attributes[m.key]).toFixed(3) : '—'} %</div>
          </div>
        `)}
      `;
    }

    const label = this.getLabel(entityId);
    const symbol = this.getSymbol(entityId);

    if (type === 'exchange') {
      return html`
        <div class="currency-grid exchange-mode row">
          <div class="cell bold align-left">${label} <span class="small-state">(${symbol}${s.state})</span></div>
          <div class="cell bold align-right value-cell">${s.attributes['Vânzare'] || '—'}</div>
          <div class="cell bold align-right value-cell">${s.attributes['Cumpărare'] || '—'}</div>
        </div>
      `;
    }

    // Modul BNR (Default)
    const diff = s.attributes['Schimbare'] || 0;
    const pct = s.attributes['Schimbare procentuală'] || 0;
    const color = diff > 0 ? "#4caf50" : diff < 0 ? "#f44336" : "grey";
    const icon = diff > 0 ? "▲" : diff < 0 ? "▼" : "—";

    return html`
      <div class="currency-grid bnr-mode row">
        <div class="cell bold align-left">${label}</div>
        <div class="cell bold align-right">${symbol} ${Number(s.state).toFixed(4)}</div>
        <div class="cell align-right" style="color: ${color}">${icon} ${Math.abs(diff).toFixed(4)}</div>
        <div class="cell align-right" style="color: ${color}">${Math.abs(pct).toFixed(2)}%</div>
      </div>
    `;
  }

  getSymbol(id) {
    if (id.includes('eur')) return '€';
    if (id.includes('usd')) return '$';
    if (id.includes('gbp')) return '£';
    if (id.includes('chf')) return '₣';
    return '';
  }

  getLabel(id) {
    if (id.includes('eur')) return '🇪🇺 EUR';
    if (id.includes('usd')) return '🇺🇸 USD';
    if (id.includes('gbp')) return '🇬🇧 GBP';
    if (id.includes('chf')) return '🇨🇭 CHF';
    return id.split('.').pop().toUpperCase();
  }

  static get styles() {
    return css`
      :host { display: block; width: 100%; }
      ha-card { height: 100%; width: 100%; }
      .card-content { padding: 0 16px 16px 16px; }
      .currency-grid { display: grid; gap: 8px; align-items: center; }
      .bnr-mode { grid-template-columns: 1.5fr 1.2fr 1fr 0.8fr; }
      .exchange-mode { grid-template-columns: 1.5fr 1fr 1fr; }
      .euribor-mode { grid-template-columns: 1.5fr 1fr; }
      .header { border-bottom: 2px solid var(--divider-color); padding: 12px 0 8px 0; font-size: 0.8em; color: var(--secondary-text-color); text-transform: uppercase; }
      .row { padding: 12px 4px; border-bottom: 1px solid var(--divider-color); }
      .row:nth-of-type(even) { background-color: var(--secondary-background-color); border-radius: 4px; }
      .cell { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .align-left { text-align: left; }
      .align-right { text-align: right; font-variant-numeric: tabular-nums; }
      .bold { font-weight: 600; }
      .value-cell { color: var(--primary-color); }
      .small-state { font-size: 0.75em; opacity: 0.6; font-weight: normal; }
    `;
  }

  setConfig(config) { this.config = config; }
}
customElements.define("bnr-exchange-card", BnrExchangeCard);