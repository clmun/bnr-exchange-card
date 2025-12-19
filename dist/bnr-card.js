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
          <table>
            <thead>
              <tr>
                <th class="align-left">Monedă</th>
                <th class="align-right">Curs BNR</th>
                <th class="align-right">Diferență</th>
                <th class="align-right">%</th>
              </tr>
            </thead>
            <tbody>
              ${entities.map((ent) => this.renderRow(ent))}
            </tbody>
          </table>
        </div>
      </ha-card>
    `;
  }

  renderRow(entityId) {
    const stateObj = this.hass.states[entityId];
    if (!stateObj) return html`<tr><td colspan="4" class="error">Entitate negăsită: ${entityId}</td></tr>`;

    const val = isNaN(stateObj.state) ? stateObj.state : Number(stateObj.state).toFixed(4);
    const diff = stateObj.attributes['Schimbare'] || 0;
    const pct = stateObj.attributes['Schimbare procentuală'] || 0;

    const symbol = this.getSymbol(entityId);
    const isUp = diff > 0;
    const isDown = diff < 0;
    const color = isUp ? "#4caf50" : isDown ? "#f44336" : "grey";
    const icon = isUp ? "🔺" : isDown ? "🔻" : "➖";

    return html`
      <tr>
        <td class="bold align-left">${this.getLabel(entityId)}</td>
        <td class="bold align-right">${symbol} ${val}</td>
        <td class="align-right" style="color: ${color}">${icon} ${Math.abs(diff).toFixed(4)}</td>
        <td class="align-right" style="color: ${color}">${icon} ${Math.abs(pct).toFixed(2)}%</td>
      </tr>
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
    // Dacă nu e una din cele de sus, curățăm numele entității
    return id.split('.').pop().replace(/_/g, ' ').toUpperCase();
  }

  static get styles() {
    return css`
      ha-card { padding: 16px; }
      table { width: 100%; border-collapse: collapse; table-layout: fixed; }
      th {
        padding-bottom: 12px;
        font-size: 0.8em;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      td { padding: 10px 0; border-bottom: 1px solid var(--divider-color); font-size: 13px; }
      .bold { font-weight: bold; }
      .align-left { text-align: left; width: 35%; }
      .align-right { text-align: right; font-variant-numeric: tabular-nums; }
      .error { color: var(--error-color); font-size: 0.8em; }
    `;
  }

  setConfig(config) {
    if (!config.entities || !Array.isArray(config.entities)) {
      throw new Error("Te rugăm să definești o listă de entități!");
    }
    this.config = config;
  }
}

customElements.define("bnr-exchange-card", BnrExchangeCard);