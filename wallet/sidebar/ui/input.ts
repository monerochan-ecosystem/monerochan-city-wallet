import { html } from "../../../mininext/mininext";

export function textInput(id: string, placeholder: string) {
  return html`<div class="text-input-block">
    <style>
      .text-input-block {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .text-input-element {
        color: white;
        background: #333;
        margin-right: 12px;
        margin-top: 12px;
        font-size: 16px;
        padding: 2px;
      }
      .text-input-element:focus {
        outline: none;
        border: 2px solid #007bff;
        box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
      }
      .text-input-element::selection {
        background: #007bff;
      }
    </style>
    <input
      type="text"
      id="${id}"
      name="${id}"
      class="text-input-element"
      placeholder="${placeholder}"
    />
  </div>`;
}
