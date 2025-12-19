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
      <ha-card header="${this.config.title || 'Card Valutar'}">
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
    if (type === 'euribor') {
      return html`
        <div class="cell align-left">Perioadă (TEST)</div>
        <div class="cell align-right">Valoare</div>`;
    }
    return html`
        <div class="cell align-left">Monedă</div>
        <div class="cell align-right">Valoare</div>`;
  }

  renderRow(entityId, type) {
    const stateObj = this.hass.states[entityId];

    // Dacă suntem pe EURIBOR, ignorăm atributele și punem text fix pentru test
    if (type === 'euribor') {
      const testRows = [
        { label: "Euribor 1M", value: "1.931%" },
        { label: "Euribor 3M", value: "2.049%" },
        { label: "Euribor 6M", value: "2.144%" },
        { label: "Euribor 12M", value: "2.291%" }
      ];

      return html`
        ${testRows.map(row => html`
          <div class="currency-grid euribor-mode row">
            <div class="cell bold align-left">${row.label}</div>
            <div class="cell bold align-right value-cell">${row.value}</div>
          </div>
        `)}
        <div class="small-info">Stare senzor: ${stateObj ? stateObj.state : 'Senzor negăsit'}</div>
      `;
    }

    // Fallback pentru celelalte moduri (simplificat pentru test)
    return html`
      <div class="currency-grid bnr-mode row">
        <div class="cell bold align-left">${entityId}</div>
        <div class="cell bold align-right">${stateObj ? stateObj.state : '???'}</div>
      </div>
    `;
  }

  static get styles() {
    return css`
      :host { display: block; width: 100%; }
      ha-card { padding-bottom: 8px; }
      .card-content { padding: 0 16px 16px 16px; }
      .currency-grid { display: grid; gap: 8px; align-items: center; width: 100%; }
      .bnr-mode { grid-template-columns: 1fr 1fr; }
      .euribor-mode { grid-template-columns: 1.5fr 1fr; }
      .header { border-bottom: 2px solid var(--divider-color); padding: 12px 0 8px 0; font-size: 0.8em; font-weight: bold; color: var(--secondary-text-color); text-transform: uppercase; }
      .row { padding: 12px 4px; border-bottom: 1px solid var(--divider-color); }
      .row:nth-of-type(even) { background-color: var(--secondary-background-color); border-radius: 4px; }
      .value-cell { color: var(--primary-color); }
      .align-left { text-align: left; }
      .align-right { text-align: right; }
      .bold { font-weight: 600; }
      .small-info { font-size: 0.7em; opacity: 0.5; padding-top: 8px; }
    `;
  }

  setConfig(config) {
    this.config = config;
  }
}

customElements.define("bnr-exchange-card", BnrExchangeCard);