(function (global) {
  "use strict";

  const normalizeHeader = value => String(value ?? "").trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d")
    .replace(/[\s_-]+/g, "");
  const normalizeSku = value => String(value ?? "").trim().toLowerCase();
  const HEADER_ALIASES = {
    sku: ["sku", "masanpham", "masp", "mahang", "mahanghoa", "maxe", "productcode", "itemcode"],
    name: ["ten", "tensanpham", "tenhang", "tenhanghoa", "productname", "itemname", "name"],
    category: ["danhmuc", "nhomsanpham", "nhomhang", "category", "productcategory"],
    stock: ["tonkho", "cuoiky", "soluong", "stock", "quantity"],
    price: ["gia", "giavnd", "dongia", "dongiaban", "giaban", "price", "saleprice"],
    description: ["mota", "description"],
    badge: ["nhan", "badge"]
  };

  function findHeader(headers, key) {
    return headers.find(header => HEADER_ALIASES[key].includes(normalizeHeader(header)));
  }

  function parseNumber(value, defaultValue = NaN) {
    if (value === null || value === undefined || String(value).trim() === "") return defaultValue;
    if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
    let text = String(value).trim().replace(/\s/g, "").replace(/[₫đ]/gi, "");
    if (/^\d{1,3}([.,]\d{3})+$/.test(text)) text = text.replace(/[.,]/g, "");
    else text = text.replace(/,/g, "");
    return Number(text);
  }

  function prepareRows(rawRows, products) {
    if (!rawRows.length) return { rows: [], fatalError: "File Excel không có dữ liệu." };
    const headers = [...new Set(rawRows.flatMap(row => Object.keys(row)))];
    const columns = Object.fromEntries(Object.keys(HEADER_ALIASES).map(key => [key, findHeader(headers, key)]));
    if (!columns.sku || !columns.name) {
      return { rows: [], fatalError: "Không tìm thấy cột Mã sản phẩm (SKU) và Tên sản phẩm trong dòng tiêu đề." };
    }

    const existingSkus = new Set(products.map(product => normalizeSku(product.sku)).filter(Boolean));
    const seenSkus = new Set();
    const rows = rawRows.map((source, index) => ({ source, index })).filter(({ source }) =>
      Object.values(source).some(value => String(value ?? "").trim())
    ).map(({ source, index }) => {
      const value = key => columns[key] ? String(source[columns[key]] ?? "").trim() : "";
      const sku = value("sku");
      const normalizedSku = normalizeSku(sku);
      const name = value("name");
      const price = parseNumber(columns.price ? source[columns.price] : "", 0);
      const stockValue = parseNumber(columns.stock ? source[columns.stock] : "", 0);
      const stock = Number.isFinite(stockValue) ? Math.floor(stockValue) : NaN;
      let action = "create";
      let error = "";
      let skipReason = "";

      if (!sku) error = "Thiếu mã sản phẩm (SKU)";
      else if (!name) error = "Thiếu tên sản phẩm";
      else if (!Number.isFinite(price) || price < 0 || !Number.isInteger(price)) error = "Giá phải là số nguyên không âm";
      else if (!Number.isFinite(stock) || stock < 0) error = "Tồn kho phải là số nguyên không âm";
      else if (existingSkus.has(normalizedSku)) { action = "skip"; skipReason = "SKU đã tồn tại"; }
      else if (seenSkus.has(normalizedSku)) { action = "skip"; skipReason = "SKU bị trùng trong file"; }

      if (normalizedSku) seenSkus.add(normalizedSku);
      return {
        rowNumber: index + 2, sku, name, price, stock, action, error, skipReason,
        category: value("category") || null,
        description: value("description") || null,
        badge: value("badge") || null
      };
    });
    return { rows, fatalError: "" };
  }

  global.AdminProductImport = { normalizeHeader, normalizeSku, parseNumber, prepareRows };
  global.AdminPriceImport = global.AdminProductImport;

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
    const creatable = preparedRows.filter(row => row.action === "create" && !row.error);
    const skipped = preparedRows.filter(row => row.action === "skip").length;
    const invalid = preparedRows.filter(row => row.error).length;
    el("priceImportSummary").innerHTML = `<strong>${creatable.length}</strong> sản phẩm mới sẽ được tạo, <strong>${skipped}</strong> dòng trùng sẽ bỏ qua${invalid ? `, <strong class="text-danger">${invalid}</strong> dòng có lỗi` : ""}.`;
    el("priceImportPreviewBody").innerHTML = preparedRows.map(row => {
      const status = row.error ? escapeHtml(row.error) : row.action === "skip"
        ? `<span class="text-muted">Bỏ qua – ${escapeHtml(row.skipReason)}</span>`
        : '<span class="text-success fw-semibold">Sẽ thêm mới</span>';
      return `<tr class="${row.error ? "table-danger" : row.action === "skip" ? "table-light" : ""}">
        <td>${row.rowNumber}</td><td>${escapeHtml(row.name || "—")}</td><td>${escapeHtml(row.sku || "—")}</td>
        <td>${escapeHtml(row.category || "—")}</td><td>${Number.isFinite(row.price) ? formatVND(row.price) : "—"}</td>
        <td>${Number.isFinite(row.stock) ? row.stock : "—"}</td><td>${status}</td></tr>`;
    }).join("");
    el("priceImportPreviewWrap").classList.remove("d-none");
    el("confirmPriceImportBtn").disabled = !creatable.length || invalid > 0;
  }

  async function readFile(file) {
    if (!file) throw new Error("Vui lòng chọn file Excel.");
    if (!global.XLSX) throw new Error("Không tải được thư viện đọc Excel. Vui lòng kiểm tra kết nối mạng và tải lại trang.");
    const workbook = global.XLSX.read(await file.arrayBuffer(), { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return global.XLSX.utils.sheet_to_json(sheet, { defval: "", raw: true });
  }

  async function handleFile(event) {
    el("priceImportError").classList.add("d-none");
    try {
      const result = prepareRows(await readFile(event.target.files[0]), global.allProducts || allProducts || []);
      if (result.fatalError) throw new Error(result.fatalError);
      preparedRows = result.rows;
      renderPreview();
    } catch (error) {
      preparedRows = [];
      el("confirmPriceImportBtn").disabled = true;
      showError(error.message || "Không thể đọc file Excel.");
    }
  }

  function downloadTemplate() {
    if (!global.XLSX) return showError("Không tải được thư viện tạo file Excel.");
    const sheet = global.XLSX.utils.json_to_sheet([{
      "Mã sản phẩm (SKU)": "AB-001", "Tên sản phẩm": "Xe đạp mẫu", "Danh mục": "Bikes",
      "Giá": 1000000, "Tồn kho": 10, "Mô tả": "", "Nhãn": "Mới"
    }]);
    const workbook = global.XLSX.utils.book_new();
    global.XLSX.utils.book_append_sheet(workbook, sheet, "San pham");
    global.XLSX.writeFile(workbook, "mau-nhap-san-pham.xlsx");
  }

  async function importProducts() {
    const button = el("confirmPriceImportBtn");
    button.disabled = true;
    let created = 0;
    try {
      const { data: currentProducts, error: loadError } = await supabaseClient.from("products").select("id, sku");
      if (loadError) throw loadError;
      const existing = new Set((currentProducts || []).map(item => normalizeSku(item.sku)).filter(Boolean));
      const rows = preparedRows.filter(row => row.action === "create" && !row.error && !existing.has(normalizeSku(row.sku)));
      if (!rows.length) {
        modal.hide();
        showAdminSuccess("Không có sản phẩm mới. Tất cả mã trong file đã tồn tại.");
        return;
      }

      for (const row of rows) {
        button.textContent = `Đang nhập ${created + 1}/${rows.length}...`;
        const { data, error } = await supabaseClient.from("products").insert({
          name: row.name, sku: row.sku, category: row.category, price: row.price, stock: row.stock,
          description: row.description, badge: row.badge, is_active: true, updated_at: new Date().toISOString()
        }).select("id");
        if (error) {
          if (error.code === "23505") continue;
          throw new Error(`Dòng ${row.rowNumber}: ${error.message}`);
        }
        if (!data?.length) throw new Error(`Dòng ${row.rowNumber}: không lưu được sản phẩm.`);
        created += 1;
        existing.add(normalizeSku(row.sku));
      }
      modal.hide();
      showAdminSuccess(`Đã thêm mới ${created} sản phẩm. Các mã trùng đã được bỏ qua.`);
      await loadProducts();
    } catch (error) {
      showError(`Đã thêm ${created} sản phẩm. ${error.message}`);
    } finally {
      button.textContent = "Nhập sản phẩm mới";
      button.disabled = !preparedRows.some(row => row.action === "create" && !row.error);
    }
  }

  document.addEventListener("adminVerified", function () {
    modal = new bootstrap.Modal(el("priceImportModal"));
    el("openPriceImportBtn").addEventListener("click", () => { reset(); modal.show(); });
    el("priceImportFile").addEventListener("change", handleFile);
    el("confirmPriceImportBtn").addEventListener("click", importProducts);
    el("downloadProductTemplateBtn").addEventListener("click", downloadTemplate);
  });
})(typeof window !== "undefined" ? window : globalThis);
