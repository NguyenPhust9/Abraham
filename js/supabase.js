const SUPABASE_URL = "https://bqowjqqnpeiwoaaczybg.supabase.co";

const SUPABASE_KEY = "sb_publishable_xqesJg10fSssMRE6xyc3-A_J0y94QtK";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

console.log("Supabase URL:", SUPABASE_URL);
console.log("Supabase client created:", supabaseClient);


// ==============================
// LOAD PRODUCTS
// ==============================

async function loadProducts() {

  const productList = document.getElementById("product-list");

  if (!productList) {
    console.error("Không tìm thấy product-list");
    return;
  }

  console.log("Đang lấy products...");


  // Lấy dữ liệu từ bảng products
  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("id", { ascending: true });


  console.log("Data:", data);
  console.log("Error:", error);


  // ==============================
  // NẾU CÓ LỖI
  // ==============================

  if (error) {

    productList.innerHTML = `
      <div class="col-12 text-center">
        <p style="color: red;">
          Lỗi Supabase: ${error.message}
        </p>
      </div>
    `;

    return;
  }


  // ==============================
  // DATABASE RỖNG
  // ==============================

  if (!data || data.length === 0) {

    productList.innerHTML = `
      <div class="col-12 text-center">
        <p>
          Đã kết nối Supabase nhưng chưa có sản phẩm.
        </p>
      </div>
    `;

    return;
  }


  // ==============================
  // XÓA LOADING
  // ==============================

  productList.innerHTML = "";


  // ==============================
  // HIỂN THỊ SẢN PHẨM
  // ==============================

  data.forEach((product) => {

    productList.innerHTML += `
      <div class="col-12 col-md-4 col-lg-3 mb-5">

        <a class="product-item" href="#">

          <img
            src="${product.image_url || "images/product-1.png"}"
            class="img-fluid product-thumbnail"
            alt="${product.name || "Abraham Bike"}"
          >

          <h3 class="product-title">
            ${product.name || ""}
          </h3>

          <strong class="product-price">
            $${Number(product.price || 0).toFixed(2)}
          </strong>

          <span class="icon-cross">

            <img
              src="images/cross.svg"
              class="img-fluid"
              alt=""
            >

          </span>

        </a>

      </div>
    `;

  });


  console.log(
    "Đã tải",
    data.length,
    "sản phẩm từ Supabase"
  );

}


// ==============================
// CHẠY SAU KHI HTML LOAD XONG
// ==============================

document.addEventListener(
  "DOMContentLoaded",
  loadProducts
);