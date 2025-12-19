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
    const entities = this.config.entities || [];
    return html`
      <ha-card header="${this.config.title || ''}">
        <div class="card-content">
          <div class="currency-grid header">
            <div class="cell align-left">Monedă</div>
            <div class="cell align-right">Curs BNR</div>
            <div class="cell align-right">Dif.</div>
            <div class="cell align-right">%</div>
          </div>
          ${entities.map((ent) => this.renderRow(ent))}
        </div>
      </ha-card>
    `;
  }

  renderRow(entityId) {
    const stateObj = this.hass.states[entityId];
    if (!stateObj) return html`<div class="error">Entitate negăsită: ${entityId}</div>`;

    const val = isNaN(stateObj.state) ? stateObj.state : Number(stateObj.state).toFixed(4);
    const diff = stateObj.attributes['Schimbare'] || 0;
    const pct = stateObj.attributes['Schimbare procentuală'] || 0;

    const symbol = this.getSymbol(entityId);
    const isUp = diff > 0;
    const isDown = diff < 0;
    const color = isUp ? "#4caf50" : isDown ? "#f44336" : "var(--secondary-text-color)";
    const icon = isUp ? "▲" : isDown ? "▼" : "—";

    return html`
      <div class="currency-grid row">
        <div class="cell bold align-left">${this.getLabel(entityId)}</div>
        <div class="cell bold align-right">${symbol} ${val}</div>
        <div class="cell align-right" style="color: ${color}">${icon} ${Math.abs(diff).toFixed(4)}</div>
        <div class="cell align-right" style="color: ${color}">${Math.abs(pct).toFixed(2)}%</div>
      </div>
    `;
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
      ha-card {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .card-content {
        padding: 0 16px 16px 16px;
      }
      .currency-grid {
        display: grid;
        /* Împarțirea coloanelor: prima coloană flexibilă, restul egale */
        grid-template-columns: 1.2fr 1fr 1fr 0.8fr;
        gap: 4px;
        align-items: center;
      }
      .header {
        border-bottom: 1px solid var(--divider-color);
        padding-bottom: 8px;
        margin-bottom: 8px;
        font-size: 0.8em;
        font-weight: bold;
        color: var(--secondary-text-color);
        text-transform: uppercase;
      }
      .row {
        padding: 10px 0;
        border-bottom: 1px dotted var(--divider-color);
      }
      .row:last-child {
        border-bottom: none;
      }
      .cell {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .align-left { text-align: left; }
      .align-right {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .bold { font-weight: 500; }
      .error {
        color: var(--error-color);
        font-size: 0.8em;
        padding: 10px 0;
      }

      /* Adaptare pentru secțiuni foarte înguste */
      @container (max-width: 300px) {
        .currency-grid {
          grid-template-columns: 1fr 1fr;
          grid-template-rows: auto auto;
        }
        .header { display: none; }
      }
    `;
  }

  setConfig(config) {
    this.config = config;
  }
}

customElements.define("bnr-exchange-card", BnrExchangeCard);