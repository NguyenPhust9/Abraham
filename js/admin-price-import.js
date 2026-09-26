(function (global) {
  "use strict";

  const normalizeHeader = value => String(value ?? "").trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d")
    .replace(/[\s_-]+/g, "");
  const HEADER_ALIASES = {
    sku: ["sku", "masanpham", "masp", "mahang", "mahanghoa", "maxe", "productcode", "itemcode"],
    id: ["id", "productid", "maso"],
    name: ["ten", "tensanpham", "tenhang", "tenhanghoa", "productname", "itemname"],
    stock: ["tonkho", "cuoiky", "soluong", "stock", "quantity"],
    price: ["gia", "giavnd", "dongia", "dongiaban", "giaban", "price", "saleprice", "newprice", "giamoi"]
  };

  function findHeader(headers, key) {
    const aliases = HEADER_ALIASES[key];
    return headers.find(header => aliases.includes(normalizeHeader(header)));
  }

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
    const headers = Object.keys(rawRows[0]);
    const skuHeader = findHeader(headers, "sku");
    const idHeader = findHeader(headers, "id");
    const nameHeader = findHeader(headers, "name");
    const stockHeader = findHeader(headers, "stock");
    const priceHeader = findHeader(headers, "price");
    if ((!skuHeader && !idHeader) || !priceHeader) {
      return { rows: [], fatalError: "Không tìm thấy cột SKU/ID và Giá trong dòng tiêu đề." };
    }
    const seen = new Set();
    const rows = rawRows.map((source, index) => ({ source, index })).filter(({ source }) => {
      const sku = skuHeader ? String(source[skuHeader] ?? "").trim() : "";
      const id = idHeader ? String(source[idHeader] ?? "").trim() : "";
      const price = String(source[priceHeader] ?? "").trim();
      return sku || id || price;
    }).map(({ source, index }) => {
      const sku = skuHeader ? String(source[skuHeader] ?? "").trim() : "";
      const idText = idHeader ? String(source[idHeader] ?? "").trim() : "";
      const name = nameHeader ? String(source[nameHeader] ?? "").trim() : "";
      const product = sku
        ? products.find(item => String(item.sku ?? "").trim().toLowerCase() === sku.toLowerCase())
        : products.find(item => String(item.id) === idText);
      const price = parsePrice(source[priceHeader]);
      const stockValue = stockHeader ? parsePrice(source[stockHeader]) : 0;
      const stock = Number.isFinite(stockValue) && stockValue >= 0 ? Math.floor(stockValue) : 0;
      const key = product ? String(product.id) : (sku ? `sku:${sku.toLowerCase()}` : `id:${idText}`);
      let error = "";
      if (!sku && !idText) error = "Thiếu SKU/ID";
      else if (!product && !sku) error = "Không thể thêm mới khi chỉ có ID";
      else if (!product && !name) error = "Thiếu tên để thêm sản phẩm mới";
      else if (!Number.isFinite(price) || price < 0 || !Number.isInteger(price)) error = "Giá phải là số nguyên không âm";
      else if (seen.has(key)) error = "SKU/ID bị trùng trong file";
      seen.add(key);
      return { rowNumber: index + 2, sku, idText, name, stock, product, price, action: product ? "update" : "create", error };
    });
    return { rows, fatalError: "" };
  }

  global.AdminPriceImport = { normalizeHeader, parsePrice, prepareRows };

  if (typeof document === "undefined") return;
  let modal;
  let preparedRows = [];
  const el = id => document.getElementById(id);
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

  function showError(message) {
    el("priceImportError").textContent = message;
    el("priceImportError").classList.remove("d-none");
  }

  function reset() {
    preparedRows = [];
    el("priceImportFile").value = "";
    el("priceImportError").classList.add("d-none");
    el("priceImportSummary").textContent = "";
    el("priceImportPreviewWrap").classList.add("d-none");
    el("priceImportPreviewBody").replaceChildren();
    el("confirmPriceImportBtn").disabled = true;
  }

  function renderPreview() {
    const valid = preparedRows.filter(row => !row.error);
    const createCount = valid.filter(row => row.action === "create").length;
    const updateCount = valid.length - createCount;
    const invalid = preparedRows.length - valid.length;
    el("priceImportSummary").innerHTML = `<strong>${updateCount}</strong> sản phẩm sẽ cập nhật, <strong>${createCount}</strong> sản phẩm sẽ thêm mới${invalid ? `, <strong class="text-danger">${invalid}</strong> dòng có lỗi` : ""}.`;
    el("priceImportPreviewBody").innerHTML = preparedRows.map(row => `<tr class="${row.error ? "table-danger" : ""}">
      <td>${row.rowNumber}</td><td>${escapeHtml(row.product?.name || row.name || "—")}</td>
      <td>${escapeHtml(row.sku || row.idText || "—")}</td>
      <td>${row.product ? formatVND(row.product.price) : "—"}</td>
      <td>${Number.isFinite(row.price) ? formatVND(row.price) : "—"}</td>
      <td>${row.error ? escapeHtml(row.error) : row.action === "create" ? '<span class="text-primary fw-semibold">Sẽ thêm mới</span>' : '<span class="text-success">Sẵn sàng cập nhật</span>'}</td></tr>`).join("");
    el("priceImportPreviewWrap").classList.remove("d-none");
    el("confirmPriceImportBtn").disabled = !valid.length || invalid > 0;
  }

  async function readFile(file) {
    if (!global.XLSX) throw new Error("Không tải được thư viện đọc Excel. Vui lòng kiểm tra kết nối mạng và tải lại trang.");
    const workbook = global.XLSX.read(await file.arrayBuffer(), { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return global.XLSX.utils.sheet_to_json(sheet, { defval: "", raw: true });
  }

  async function handleFile(event) {
    el("priceImportError").classList.add("d-none");
    try {
      const rawRows = await readFile(event.target.files[0]);
      const result = prepareRows(rawRows, global.allProducts || allProducts || []);
      if (result.fatalError) throw new Error(result.fatalError);
      preparedRows = result.rows;
      renderPreview();
    } catch (error) {
      preparedRows = [];
      el("confirmPriceImportBtn").disabled = true;
      showError(error.message || "Không thể đọc file Excel.");
    }
  }

  async function importPrices() {
    const button = el("confirmPriceImportBtn");
    button.disabled = true;
    let updated = 0;
    let created = 0;
    try {
      for (const row of preparedRows) {
        button.textContent = `Đang xử lý ${updated + created + 1}/${preparedRows.length}...`;
        let result;
        if (row.action === "create") {
          result = await supabaseClient.from("products").insert({
            name: row.name,
            sku: row.sku,
            price: row.price,
            stock: row.stock,
            is_active: true,
            updated_at: new Date().toISOString()
          }).select("id");
        } else {
          result = await supabaseClient.from("products")
            .update({ price: row.price, updated_at: new Date().toISOString() })
            .eq("id", row.product.id).select("id");
        }
        const { data, error } = result;
        if (error) throw new Error(`Dòng ${row.rowNumber}: ${error.message}`);
        if (!data?.length) throw new Error(`Dòng ${row.rowNumber}: không lưu được sản phẩm.`);
        if (row.action === "create") created += 1;
        else updated += 1;
      }
      modal.hide();
      showAdminSuccess(`Đã cập nhật ${updated} và thêm mới ${created} sản phẩm từ Excel.`);
      await loadProducts();
    } catch (error) {
      showError(`Đã cập nhật ${updated}, thêm mới ${created}/${preparedRows.length} sản phẩm. ${error.message}`);
    } finally {
      button.textContent = "Nhập sản phẩm và giá";
      button.disabled = preparedRows.length === 0;
    }
  }

  document.addEventListener("adminVerified", function () {
    modal = new bootstrap.Modal(el("priceImportModal"));
    el("openPriceImportBtn").addEventListener("click", () => { reset(); modal.show(); });
    el("priceImportFile").addEventListener("change", handleFile);
    el("confirmPriceImportBtn").addEventListener("click", importPrices);
  });
})(typeof window !== "undefined" ? window : globalThis);
