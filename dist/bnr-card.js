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
    const entities = this.config.entities || [];
    const type = this.config.card_type || 'bnr';

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
      return html`
        <div class="cell align-left">Monedă (BNR)</div>
        <div class="cell align-right">💰 Vânzare</div>
        <div class="cell align-right">🛒 Cumpărare</div>`;
    } else if (type === 'euribor') {
      return html`
        <div class="cell align-left">Perioadă</div>
        <div class="cell align-right">Rată %</div>`;
    } else {
      return html`
        <div class="cell align-left">Monedă</div>
        <div class="cell align-right">Curs BNR</div>
        <div class="cell align-right">Dif.</div>
        <div class="cell align-right">%</div>`;
    }
  }

  renderRow(entityId, type) {
    const stateObj = this.hass.states[entityId];
    if (!stateObj) return html`<div class="error">Entitate negăsită: ${entityId}</div>`;

    if (type === 'euribor') {
      const periods = ['1 lună', '3 luni', '6 luni', '12 luni'];
      return html`
        ${periods.map(p => html`
          <div class="currency-grid euribor-mode row">
            <div class="cell bold align-left">${p}</div>
            <div class="cell bold align-right value-cell">
               ${stateObj.attributes[p] !== undefined ? Number(stateObj.attributes[p]).toFixed(3) : '—'} %
            </div>
          </div>
        `)}
      `;
    }

    const label = this.getLabel(entityId);

    if (type === 'exchange') {
      const vanzare = stateObj.attributes['Vânzare'] || '—';
      const cumparare = stateObj.attributes['Cumpărare'] || '—';

      // EXTRACȚIE CORECTĂ: Căutăm valoarea din sensor.curs_valutar_ron_...
      const currencyCode = entityId.split('_').pop(); // extrage 'eur', 'usd', 'gbp' sau 'chf'
      const bnrEntityId = `sensor.curs_valutar_ron_${currencyCode}`;
      const bnrStateObj = this.hass.states[bnrEntityId];
      const bnrValue = bnrStateObj ? Number(bnrStateObj.state).toFixed(4) : '—';

      return html`
        <div class="currency-grid exchange-mode row">
          <div class="cell bold align-left">
            ${label} <span class="small-state">(${bnrValue})</span>
          </div>
          <div class="cell bold align-right value-cell">${vanzare}</div>
          <div class="cell bold align-right value-cell">${cumparare}</div>
        </div>
      `;
    } else {
      const symbol = this.getSymbol(entityId);
      const val = isNaN(stateObj.state) ? stateObj.state : Number(stateObj.state).toFixed(4);
      const diff = stateObj.attributes['Schimbare'] || 0;
      const pct = stateObj.attributes['Schimbare procentuală'] || 0;
      const color = diff > 0 ? "#4caf50" : diff < 0 ? "#f44336" : "var(--secondary-text-color)";
      const icon = diff > 0 ? "▲" : diff < 0 ? "▼" : "—";

      return html`
        <div class="currency-grid bnr-mode row">
          <div class="cell bold align-left">${label}</div>
          <div class="cell bold align-right">${symbol} ${val}</div>
          <div class="cell align-right" style="color: ${color}">${icon} ${Math.abs(diff).toFixed(4)}</div>
          <div class="cell align-right" style="color: ${color}">${Math.abs(pct).toFixed(2)}%</div>
        </div>
      `;
    }
  }

  getSymbol(id) {
    const lowId = id.toLowerCase();
    if (lowId.includes('eur')) return '€';
    if (lowId.includes('usd')) return '$';
    if (lowId.includes('gbp')) return '£';
    if (lowId.includes('chf')) return '₣';
    return '';
  }

  getLabel(id) {
    const lowId = id.toLowerCase();
    if (lowId.includes('eur')) return '🇪🇺 EUR';
    if (lowId.includes('usd')) return '🇺🇸 USD';
    if (lowId.includes('gbp')) return '🇬🇧 GBP';
    if (lowId.includes('chf')) return '🇨🇭 CHF';
    return id.split('.').pop().replace(/_/g, ' ').toUpperCase();
  }

  static get styles() {
    return css`
      :host { display: block; width: 100%; }
      ha-card { height: 100%; width: 100%; box-sizing: border-box; --ha-card-header-font-size: 16px; }
      .card-header { font-weight: bold !important; padding-bottom: 8px !important; }
      .card-content { padding: 0 16px 16px 16px; }
      .currency-grid { display: grid; gap: 8px; align-items: center; width: 100%; }
      .bnr-mode { grid-template-columns: 1.3fr 1.2fr 1fr 0.8fr; }
      .exchange-mode { grid-template-columns: 1.5fr 1fr 1fr; }
      .euribor-mode { grid-template-columns: 1.5fr 1fr; }
      .header { border-bottom: 2px solid var(--divider-color); padding: 12px 0 8px 0; font-size: 0.8em; font-weight: bold; color: var(--secondary-text-color); text-transform: uppercase; }
      .row { padding: 12px 4px; border-bottom: 1px solid var(--divider-color); }
      .row:nth-of-type(even) { background-color: var(--secondary-background-color); border-radius: 4px; }
      .row:last-child { border-bottom: none; }
      .cell { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .small-state { font-size: 0.8em; font-weight: normal; opacity: 0.7; color: var(--secondary-text-color); margin-left: 4px; }
      .value-cell { color: var(--primary-color); }
      .align-left { text-align: left; }
      .align-right { text-align: right; font-variant-numeric: tabular-nums; }
      .bold { font-weight: 600; }
      .error { color: var(--error-color); font-size: 0.8em; padding: 10px 0; }
    `;
  }

  setConfig(config) {
    if (!config.entities) throw new Error("Definiți entitățile!");
    this.config = config;
  }
}

customElements.define("bnr-exchange-card", BnrExchangeCard);