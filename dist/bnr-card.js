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
                <th>Monedă</th>
                <th>Curs BNR</th>
                <th>Diferență</th>
                <th>%</th>
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
    if (!stateObj) return html`<tr><td colspan="4">Entitate negăsită: ${entityId}</td></tr>`;

    const val = stateObj.state;
    const diff = stateObj.attributes['Schimbare'] || 0;
    const pct = stateObj.attributes['Schimbare procentuală'] || 0;
    const symbol = this.getSymbol(entityId);

    const isUp = diff > 0;
    const isDown = diff < 0;
    const color = isUp ? "#4caf50" : isDown ? "#f44336" : "grey";
    const icon = isUp ? "🔺" : isDown ? "🔻" : "➖";

    return html`
      <tr>
        <td class="bold">${this.getLabel(entityId)}</td>
        <td class="bold">${symbol} ${val}</td>
        <td style="color: ${color}">${icon} ${Math.abs(diff).toFixed(4)}</td>
        <td style="color: ${color}">${icon} ${Math.abs(pct).toFixed(2)}%</td>
      </tr>
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
    return id;
  }

  static get styles() {
    return css`
      ha-card { padding: 16px; }
      table { width: 100%; border-collapse: collapse; }
      th { text-align: left; padding-bottom: 8px; font-size: 0.9em; color: var(--secondary-text-color); }
      td { padding: 8px 0; border-bottom: 1px solid var(--divider-color); font-size: 14px; }
      .bold { font-weight: bold; }
    `;
  }

  setConfig(config) {
    if (!config.entities) throw new Error("Trebuie să definești entitățile!");
    this.config = config;
  }
}

customElements.define("bnr-exchange-card", BnrExchangeCard);