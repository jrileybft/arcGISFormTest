import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { NintexPlugin } from '../../lib/nintex-plugin';
import { TextField } from '@material/mwc-textfield/mwc-textfield.js';

const fire = <T>(
  element: HTMLElement,
  data: {
    bubbles?: boolean;
    cancelable?: boolean;
    composed?: boolean;
    detail?: T;
  }
) => {
  const args = {
    bubbles: true,
    cancelable: false,
    composed: true,
    ...data,
  };

  const event = new CustomEvent('ntx-value-change', args);
  element.dispatchEvent(event);
  return event;
};

@customElement('arcgis-geocoder-plugin')
export class ArcGISGeocoderPlugin extends LitElement {
  @property()
  address!: string;

  @property({ type: Boolean })
  readOnly: boolean = false;

  static getMetaConfig(): Promise<NintexPlugin> | NintexPlugin {
    return {
      controlName: 'ArcGIS Geocoder',
      fallbackDisableSubmit: false,
      iconUrl: 'one-line-text',
      version: '1',
      properties: {
        address: {
          type: 'string',
          title: 'Address',
        },
        coordinates: {
          type: 'string',
          title: 'Coordinates',
          isValueField: true,
        },
      },
      standardProperties: {
        fieldLabel: true,
        description: true,
        defaultValue: true,
        readOnly: true,
      },
    };
  }

  render() {
    return html` <mwc-textfield
      .label="${this.label}"
      .helper="${this.description}"
      .value="${this.coordinates}"
      ?outlined="${this.outlined}"
      ?disabled="${this.readOnly}"
      @change="${() => this.onChange()}"
    ></mwc-textfield>`;
  }

  private onChange() {
    const el = this.shadowRoot?.getElementById('textfield') as TextField;
    if (el) {
      fire<any>(this, { detail: el.value });
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('address')) {
      this.geocodeAddress();
    }
  }

  geocodeAddress() {
    const address = this.address.trim();
    if (!address) return;

    // Replace 'YOUR_ARCGIS_API_KEY' with your actual ArcGIS API key
    const arcgisApiKey = 'YOUR_ARCGIS_API_KEY';
    const arcgisUrl = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine=${address}&outFields=Addr_type&apiKey=${arcgisApiKey}`;

    fetch(arcgisUrl)
      .then(response => response.json())
      .then(data => {
        const candidate = data.candidates[0];
        if (candidate) {
          this.coordinates = `${candidate.location.y},${candidate.location.x}`;
        } else {
          this.coordinates = 'Coordinates not available';
        }
      })
      .catch(error => {
        console.error('Error during geocoding:', error);
        this.coordinates = 'Geocoding error';
      });
  }
}
