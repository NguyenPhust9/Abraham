(function (global) {
  "use strict";

  const normalizeHeader = value => String(value ?? "").trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d")
    .replace(/[\s_-]+/g, "");
  const ALIASES = {
    sku: ["sku", "masanpham", "masp", "mahang", "mahanghoa", "maxe", "productcode", "itemcode"],
    id: ["id", "productid", "maso"],
    price: ["gia", "giavnd", "dongia", "dongiaban", "giaban", "price", "saleprice", "newprice", "giamoi"]
  };
  const findHeader = (headers, key) => headers.find(header => ALIASES[key].includes(normalizeHeader(header)));

  function parsePrice(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
    let text = String(value ?? "").trim().replace(/\s/g, "").replace(/[₫đ]/gi, "");
    if (!text) return NaN;
    if (/^\d{1,3}([.,]\d{3})+$/.test(text)) text = text.replace(/[.,]/g, "");
    else text = text.replace(/,/g, "");
    return Number(text);
  }

  function prepareRows(rawRows, products) {
    if (!rawRows.length) return { rows: [], fatalError: "File Excel không có dữ liệu." };
    const headers = [...new Set(rawRows.flatMap(row => Object.keys(row)))];
    const skuHeader = findHeader(headers, "sku");
    const idHeader = findHeader(headers, "id");
    const priceHeader = findHeader(headers, "price");
    if ((!skuHeader && !idHeader) || !priceHeader) {
      return { rows: [], fatalError: "Không tìm thấy cột SKU/ID và Giá trong dòng tiêu đề." };
    }

    const seen = new Set();
    const rows = rawRows.map((source, index) => ({ source, index })).filter(({ source }) =>
      Object.values(source).some(value => String(value ?? "").trim())
    ).map(({ source, index }) => {
      const sku = skuHeader ? String(source[skuHeader] ?? "").trim() : "";
      const idText = idHeader ? String(source[idHeader] ?? "").trim() : "";
      const product = sku
        ? products.find(item => String(item.sku ?? "").trim().toLowerCase() === sku.toLowerCase())
        : products.find(item => String(item.id) === idText);
      const price = parsePrice(source[priceHeader]);
      const key = product ? String(product.id) : (sku ? `sku:${sku.toLowerCase()}` : `id:${idText}`);
      let error = "";
      if (!sku && !idText) error = "Thiếu SKU/ID";
      else if (!product) error = "Không tìm thấy sản phẩm";
      else if (!Number.isFinite(price) || price < 0 || !Number.isInteger(price)) error = "Giá phải là số nguyên không âm";
      else if (seen.has(key)) error = "SKU/ID bị trùng trong file";
      seen.add(key);
      return { rowNumber: index + 2, sku, idText, product, price, error };
    });
    return { rows, fatalError: "" };
  }

  global.AdminBulkPriceImport = { normalizeHeader, parsePrice, prepareRows };
  if (typeof document === "undefined") return;

  let modal;
  let preparedRows = [];
  const el = id => document.getElementById(id);
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

  function showError(message) {
    el("bulkPriceImportError").textContent = message;
    el("bulkPriceImportError").classList.remove("d-none");
  }

  function reset() {
    preparedRows = [];
    el("bulkPriceImportFile").value = "";
    el("bulkPriceImportError").classList.add("d-none");
    el("bulkPriceImportSummary").textContent = "";
    el("bulkPriceImportPreviewWrap").classList.add("d-none");
    el("bulkPriceImportPreviewBody").replaceChildren();
    el("confirmBulkPriceImportBtn").disabled = true;
  }

  function renderPreview() {
    const valid = preparedRows.filter(row => !row.error);
    const invalid = preparedRows.length - valid.length;
    el("bulkPriceImportSummary").innerHTML = `<strong>${valid.length}</strong> sản phẩm sẽ cập nhật giá${invalid ? `, <strong class="text-danger">${invalid}</strong> dòng có lỗi` : ""}.`;
    el("bulkPriceImportPreviewBody").innerHTML = preparedRows.map(row => `<tr class="${row.error ? "table-danger" : ""}">
      <td>${row.rowNumber}</td><td>${escapeHtml(row.product?.name || "—")}</td><td>${escapeHtml(row.sku || row.idText || "—")}</td>
      <td>${row.product ? formatVND(row.product.price) : "—"}</td><td>${Number.isFinite(row.price) ? formatVND(row.price) : "—"}</td>
      <td>${row.error ? escapeHtml(row.error) : '<span class="text-success">Sẵn sàng cập nhật</span>'}</td></tr>`).join("");
    el("bulkPriceImportPreviewWrap").classList.remove("d-none");
    el("confirmBulkPriceImportBtn").disabled = !valid.length || invalid > 0;
  }

  async function handleFile(event) {
    el("bulkPriceImportError").classList.add("d-none");
    try {
      if (!event.target.files[0]) throw new Error("Vui lòng chọn file Excel.");
      if (!global.XLSX) throw new Error("Không tải được thư viện đọc Excel.");
      const workbook = global.XLSX.read(await event.target.files[0].arrayBuffer(), { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const result = prepareRows(global.XLSX.utils.sheet_to_json(sheet, { defval: "", raw: true }), global.allProducts || allProducts || []);
      if (result.fatalError) throw new Error(result.fatalError);
      preparedRows = result.rows;
      renderPreview();
    } catch (error) {
      preparedRows = [];
      el("confirmBulkPriceImportBtn").disabled = true;
      showError(error.message || "Không thể đọc file Excel.");
    }
  }

  async function importPrices() {
    const button = el("confirmBulkPriceImportBtn");
    button.disabled = true;
    let updated = 0;
    try {
      for (const row of preparedRows.filter(item => !item.error)) {
        button.textContent = `Đang cập nhật ${updated + 1}/${preparedRows.length}...`;
        const { data, error } = await supabaseClient.from("products")
          .update({ price: row.price, updated_at: new Date().toISOString() })
          .eq("id", row.product.id).select("id");
        if (error) throw new Error(`Dòng ${row.rowNumber}: ${error.message}`);
        if (!data?.length) throw new Error(`Dòng ${row.rowNumber}: không cập nhật được sản phẩm.`);
        updated += 1;
      }
      modal.hide();
      showAdminSuccess(`Đã cập nhật giá cho ${updated} sản phẩm từ Excel.`);
      await loadProducts();
    } catch (error) {
      showError(`Đã cập nhật ${updated} sản phẩm. ${error.message}`);
    } finally {
      button.textContent = "Cập nhật giá";
      button.disabled = !preparedRows.some(row => !row.error);
    }
  }

  document.addEventListener("adminVerified", function () {
    modal = new bootstrap.Modal(el("bulkPriceImportModal"));
    el("openBulkPriceImportBtn").addEventListener("click", () => { reset(); modal.show(); });
    el("bulkPriceImportFile").addEventListener("change", handleFile);
    el("confirmBulkPriceImportBtn").addEventListener("click", importPrices);
  });
})(typeof window !== "undefined" ? window : globalThis);
