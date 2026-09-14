const PRODUCT_SPEC_FIELDS = [
  {
    "key": "frame",
    "label": "Khung sườn",
    "englishLabel": "Frame"
  },
  {
    "key": "handlebar",
    "label": "Ghi đông",
    "englishLabel": "Handlebar"
  },
  {
    "key": "brakes",
    "label": "Phanh thắng",
    "englishLabel": "Brakes"
  },
  {
    "key": "bottom_bracket",
    "label": "Cốt giữa",
    "englishLabel": "Bottom bracket"
  },
  {
    "key": "fork",
    "label": "Phuộc",
    "englishLabel": "Fork"
  },
  {
    "key": "crankset",
    "label": "Giò đĩa",
    "englishLabel": "Crankset"
  },
  {
    "key": "chainring",
    "label": "Đĩa",
    "englishLabel": "Chainring"
  },
  {
    "key": "rim",
    "label": "Vành",
    "englishLabel": "Rims"
  },
  {
    "key": "tires",
    "label": "Bánh xe",
    "englishLabel": "Tires"
  },
  {
    "key": "basket",
    "label": "Rổ",
    "englishLabel": "Basket"
  },
  {
    "key": "paint",
    "label": "Sơn",
    "englishLabel": "Paint finish"
  },
  {
    "key": "packing",
    "label": "Quy cách",
    "englishLabel": "Packaging"
  }
];

function renderProductSpecifications(specifications) {
    const section = document.getElementById("product-specifications");
    const list = document.getElementById("product-specifications-list");
    const values = specifications && typeof specifications === "object" && !Array.isArray(specifications) ? specifications : {};
    list.replaceChildren();
    for (const field of PRODUCT_SPEC_FIELDS) {
        const value = typeof values[field.key] === "string" ? values[field.key].trim() : "";
        if (!value) continue;
        const row = document.createElement("div");
        row.className = "abx-spec-row";
        const label = document.createElement("dt");
        label.textContent = field.englishLabel;
        const content = document.createElement("dd");
        content.textContent = frontendValue(value);
        row.append(label, content);
        list.append(row);
    }
    section.classList.toggle("d-none", list.children.length === 0);
}
