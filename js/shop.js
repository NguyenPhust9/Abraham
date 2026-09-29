const SUPABASE_URL = "https://bqowjqqnpeiwoaaczybg.supabase.co";
const SUPABASE_KEY = "sb_publishable_xqesJg10fSssMRE6xyc3-A_J0y94QtK";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function filterShopProducts(products, filters) {
    const keyword = filters.keyword.trim().toLowerCase();
    const result = products.filter(product => {
        const stock = Number(product.stock || 0);
        const price = Math.max(0, Number(product.price) || 0);
        return product.is_active !== false
            && (!keyword || String(product.name || "").toLowerCase().includes(keyword))
            && (!filters.categories.size || filters.categories.has(String(product.category || "").trim()))
            && (filters.availability === "all" || (filters.availability === "in" ? stock > 0 : !(stock > 0)))
            && price >= filters.minPrice && price <= filters.maxPrice;
    });
    result.sort((a, b) => {
        if (filters.sort === "price-asc") return (Number(a.price) || 0) - (Number(b.price) || 0);
        if (filters.sort === "price-desc") return (Number(b.price) || 0) - (Number(a.price) || 0);
        if (filters.sort === "name") return String(a.name || "").localeCompare(String(b.name || ""), "en");
        const time = product => Date.parse(product.created_at || product.updated_at || "") || 0;
        return time(b) - time(a) || (Number(b.id) || 0) - (Number(a.id) || 0);
    });
    return window.ProductVariants.groupProductVariants(result);
}

(() => {
    const PAGE_SIZE = 12;
    let products = [], page = 1, loaded = false, noticeTimer;
    const filters = { keyword: "", categories: new Set(), availability: "all", minPrice: 0, maxPrice: Infinity, sort: "newest" };
    let favorites = [];
    try { favorites = JSON.parse(localStorage.getItem("abraham_favorites") || "[]"); if (!Array.isArray(favorites)) favorites = []; } catch (_) { favorites = []; }
    const $ = id => document.getElementById(id);
    const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
    const money = price => Math.max(0, Number(price) || 0).toLocaleString("en-US") + "đ";
    function notice(text) {
        $("shop-notice").textContent = text;
        $("shop-notice").classList.remove("d-none");
        clearTimeout(noticeTimer);
        noticeTimer = setTimeout(() => $("shop-notice").classList.add("d-none"), 3500);
    }
    function availability(value) {
        filters.availability = value;
        $("availability-all").checked = value === "all";
        $("in-stock-only").checked = value === "in";
        $("availability-out").checked = value === "out";
        page = 1;
        render();
    }
    function renderCategories() {
        const counts = new Map();
        products.forEach(product => { const category = String(product.category || "").trim(); if (category) counts.set(category, (counts.get(category) || 0) + 1); });
        const categories = [...counts.keys()].sort((a,b) => frontendCategory(a).localeCompare(frontendCategory(b), "en", {numeric:true}));
        $("category-buttons").innerHTML = '<button type="button" data-category="all" class="is-selected">All</button>' + categories.map(category => `<button type="button" data-category="${escape(category)}">${escape(frontendCategory(category))}</button>`).join("");
        $("shop-category-options").innerHTML = categories.length ? categories.map((category, index) => `<label class="shop-check" for="shop-category-${index}"><input type="checkbox" id="shop-category-${index}" value="${escape(category)}"><span>${escape(frontendCategory(category))} <span class="shop-muted">(${counts.get(category)})</span></span></label>`).join("") : '<p class="shop-muted">No categories available.</p>';
        $("in-stock-count").textContent = `(${products.filter(p => Number(p.stock || 0) > 0).length})`;
        $("out-stock-count").textContent = `(${products.filter(p => !(Number(p.stock || 0) > 0)).length})`;
    }
    function syncCategories() {
        $("shop-category-options").querySelectorAll("input").forEach(input => input.checked = filters.categories.has(input.value));
        $("category-buttons").querySelectorAll("button").forEach(button => {
            const selected = button.dataset.category === "all" ? filters.categories.size === 0 : filters.categories.has(button.dataset.category);
            button.classList.toggle("is-selected", selected);
            button.setAttribute("aria-pressed", String(selected));
        });
    }
    function card(product) {
        const inStock = Number(product.stock || 0) > 0;
        const variantCount = product._variants?.length || 1;
        const variantInfo = window.ProductVariants.productVariantInfo(product);
        const name = variantCount > 1 ? window.ProductVariants.formatBaseName(variantInfo.base) : (product.name || "Abraham Bike");
        const url = getProductUrl(product);
        const badge = frontendValue(product.badge || "");
        const badgeStyle = /sale/i.test(badge) ? "is-sale" : /hot|best seller/i.test(badge) ? "is-hot" : "";
        const liked = favorites.includes(String(product.id));
        return `<article class="shop-product-card">
            <div class="shop-product-media">
                <a href="${escape(url)}" aria-label="View ${escape(name)}"><img src="${escape(frontendProductImage(product.image_url))}" alt="${escape(name)}" loading="lazy"></a>
                ${badge ? `<span class="shop-product-badge ${badgeStyle}">${escape(badge)}</span>` : ""}
                <button type="button" class="shop-favorite" data-favorite="${escape(product.id)}" aria-label="${liked ? "Remove from" : "Add to"} favorites" aria-pressed="${liked}"><i class="fa-${liked ? "solid" : "regular"} fa-heart" aria-hidden="true"></i></button>
            </div>
            <div class="shop-product-body">
                <span class="shop-product-category">${escape(frontendCategory(product.category || "Bikes"))}</span>
                <h2><a href="${escape(url)}">${escape(name)}</a></h2>
                ${variantCount > 1 ? `<span class="shop-product-variants"><i class="fa-solid fa-palette" aria-hidden="true"></i>${variantCount} màu</span>` : ""}
                <strong class="shop-product-price">${money(product.price)}</strong>
                <span class="shop-product-stock ${inStock ? "" : "is-out"}">${inStock ? "In stock" : "Out of stock"}</span>
                <div class="shop-product-actions"><a class="shop-detail-button" href="${escape(url)}">View details</a><button type="button" class="shop-cart-button" data-add-cart="${escape(product.id)}" ${inStock ? "" : "disabled"}><i class="fa-solid fa-cart-shopping" aria-hidden="true"></i>${inStock ? "Add to cart" : "Out of stock"}</button></div>
            </div>
        </article>`;
    }
    function render() {
        if (!loaded) return;
        const filtered = filterShopProducts(products, filters);
        const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
        page = Math.min(page, pages);
        $("product-count").textContent = filtered.length;
        $("search-status").textContent = `${filtered.length} products. ${filters.availability === "in" ? "In stock only." : filters.availability === "out" ? "Out of stock only." : "All availability."}`;
        $("product-list").innerHTML = filtered.length ? filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE).map(card).join("") : '<div class="shop-state"><h2>No products found</h2><p>Try a different search or adjust your filters.</p><button type="button" data-reset-filters>Reset filters</button></div>';
        renderPagination(pages);
    }
    function renderPagination(pages) {
        if (pages < 2) { $("pagination").replaceChildren(); return; }
        const visible = new Set([1,pages,page-1,page,page+1]);
        let previous = 0;
        const buttons = [...visible].filter(n=>n>0 && n<=pages).sort((a,b)=>a-b).map(n => {
            const dots = previous && n-previous>1 ? '<span class="shop-muted" aria-hidden="true">…</span>' : "";
            previous=n;
            return `${dots}<button type="button" data-page="${n}" class="${n===page ? "is-selected" : ""}" ${n===page ? 'aria-current="page"' : ""} aria-label="Page ${n}">${n}</button>`;
        }).join("");
        $("pagination").innerHTML = `<button type="button" data-page="${page-1}" ${page===1 ? "disabled" : ""} aria-label="Previous page">‹</button>${buttons}<button type="button" data-page="${page+1}" ${page===pages ? "disabled" : ""} aria-label="Next page">›</button>`;
    }
    function reset() {
        filters.keyword=""; filters.categories.clear(); filters.minPrice=0; filters.maxPrice=Infinity; page=1;
        $("product-search").value=""; $("price-min").value=0; $("price-max").value=$("price-range").max; $("price-range").value=$("price-range").max;
        $("shop-filter-error").classList.add("d-none");
        syncCategories(); availability("all");
    }
    async function fetchAllShopProducts() {
        const batchSize = 1000;
        const result = [];
        for (let from = 0; ; from += batchSize) {
            const {data,error} = await supabaseClient.from("products").select("*")
                .order("id",{ascending:false}).range(from,from+batchSize-1);
            if (error) throw error;
            const batch = Array.isArray(data) ? data : [];
            result.push(...batch);
            if (batch.length < batchSize) break;
        }
        return result;
    }
    async function load() {
        loaded = false;
        $("product-list").innerHTML = '<div class="shop-state" role="status"><div class="spinner-border spinner-border-sm" aria-hidden="true"></div><p>Loading products...</p></div>';
        try {
            products = (await fetchAllShopProducts()).filter(p=>p.is_active!==false);
            const maxPrice = Math.max(10000000,...products.map(p=>Number(p.price)||0));
            $("price-range").max = Math.ceil(maxPrice/1000)*1000;
            $("price-range").value = $("price-range").max;
            $("price-max").value = $("price-range").max;
            renderCategories(); syncCategories(); loaded = true; render();
        } catch (error) {
            $("product-list").innerHTML = `<div class="shop-state" role="alert"><h2>Unable to load products</h2><p>${escape(error.message || "Check your connection and try again.")}</p><button type="button" data-retry>Try again</button></div>`;
        }
    }
    document.addEventListener("DOMContentLoaded", () => {
        $("availability-all").checked=true; $("in-stock-only").checked=false; $("availability-out").checked=false;
        $("shop-search-form").addEventListener("submit",event=>{event.preventDefault(); filters.keyword=$("product-search").value;page=1;render();});
        $("product-search").addEventListener("input",()=>{filters.keyword=$("product-search").value;page=1;render();});
        $("category-buttons").addEventListener("click",event=>{const button=event.target.closest("button[data-category]");if(!button)return;filters.categories.clear();if(button.dataset.category!=="all")filters.categories.add(button.dataset.category);syncCategories();page=1;render();});
        $("shop-category-options").addEventListener("change",()=>{filters.categories=new Set([...$("shop-category-options").querySelectorAll("input:checked")].map(input=>input.value));syncCategories();page=1;render();});
        [["availability-all","all"],["in-stock-only","in"],["availability-out","out"]].forEach(([id,value])=>$(id).addEventListener("change",()=>availability($(id).checked?value:"all")));
        $("price-range").addEventListener("input",()=>$("price-max").value=$("price-range").value);
        $("price-max").addEventListener("input",()=>$("price-range").value=$("price-max").value);
        $("shop-filter-form").addEventListener("submit",event=>{
            event.preventDefault();const min=Number($("price-min").value),max=Number($("price-max").value);
            if(!Number.isFinite(min)||!Number.isFinite(max)||min<0||max<min){$("shop-filter-error").textContent="Enter a valid price range. Max must be at least Min.";$("shop-filter-error").classList.remove("d-none");return;}
            $("shop-filter-error").classList.add("d-none");filters.minPrice=min;filters.maxPrice=max;page=1;render();
        });
        $("shop-reset").addEventListener("click",reset);
        $("shop-sort").addEventListener("change",()=>{filters.sort=$("shop-sort").value;page=1;render();});
        [["shop-grid",false],["shop-list",true]].forEach(([id,isList])=>$(id).addEventListener("click",()=>{$("product-list").classList.toggle("is-list",isList);$("shop-grid").classList.toggle("is-selected",!isList);$("shop-list").classList.toggle("is-selected",isList);$("shop-grid").setAttribute("aria-pressed",String(!isList));$("shop-list").setAttribute("aria-pressed",String(isList));}));
        $("pagination").addEventListener("click",event=>{const button=event.target.closest("button[data-page]");if(!button||button.disabled)return;page=Number(button.dataset.page);render();$("product-count").scrollIntoView({behavior:"smooth",block:"start"});});
        $("product-list").addEventListener("error",event=>{if(event.target.tagName==="IMG" && !event.target.src.endsWith("/images/product-placeholder.svg"))event.target.src="/images/product-placeholder.svg";},true);
        $("product-list").addEventListener("click",event=>{
            if(event.target.closest("[data-reset-filters]")){reset();return;}
            if(event.target.closest("[data-retry]")){load();return;}
            const add=event.target.closest("[data-add-cart]");
            if (add && !add.disabled) {
                const product = products.find(p => String(p.id) === add.dataset.addCart);
                if (!product) return;
                try { window.AbrahamCart.add(product); }
                catch (error) { notice(error.message); return; }
                $("shop-notice").classList.add("d-none");
                $("search-status").textContent = `${product.name || "Product"} added to your cart.`;
                try { window.flyProductToCart?.(add); } catch (_) { /* Cart contents remain saved if animation is unavailable. */ }
                return;
            }
            const favorite=event.target.closest("[data-favorite]");
            if(favorite){const id=favorite.dataset.favorite;const next=favorites.includes(id)?favorites.filter(value=>value!==id):[...favorites,id];try{localStorage.setItem("abraham_favorites",JSON.stringify(next));favorites=next;render();}catch(_){notice("Unable to save favorites in this browser.");}}
        });
        load();
    });
})();
