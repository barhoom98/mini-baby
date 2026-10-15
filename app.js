(() => {
  const { currency, whatsappNumber, categories, products } = window.MINI_BABY;
  const cartKey = "mini-baby-cart-v1";
  const productGrid = document.querySelector("#product-grid");
  const categoryList = document.querySelector("#category-list");
  const searchInput = document.querySelector("#product-search");
  const emptyState = document.querySelector("#empty-state");
  const cartDrawer = document.querySelector("#cart-drawer");
  const cartOverlay = document.querySelector("#cart-overlay");
  const cartItems = document.querySelector("#cart-items");
  const dollOutfit = document.querySelector("#doll-outfit");
  let activeCategory = "all";
  let searchTerm = "";
  let selectedProductId = products[0]?.id ?? "";
  const activePhotos = new Map();
  let cart = loadCart();
  let toastTimer;

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(cartKey) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      console.error("Could not read the saved cart.", error);
      return [];
    }
  }

  function money(value) {
    return `${new Intl.NumberFormat("ar").format(value)} ${currency}`.trim();
  }

  function safeText(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function renderCategories() {
    categoryList.innerHTML = categories.map((category) => `
      <button class="category-chip ${activeCategory === category.id ? "active" : ""}"
        type="button" data-category="${safeText(category.id)}" aria-pressed="${activeCategory === category.id}">
        ${safeText(category.label)}
      </button>`).join("");
  }

  function filteredProducts() {
    return products.filter((product) => {
      const matchesCategory = activeCategory === "all" || product.category === activeCategory;
      const haystack = `${product.name} ${product.description}`.toLocaleLowerCase("ar");
      return matchesCategory && haystack.includes(searchTerm.toLocaleLowerCase("ar"));
    });
  }

  function productPhotos(product) {
    return [product.image, ...(product.gallery || [])].filter(Boolean);
  }

  // Transparent cut-outs (.png) sit inside the frame; regular photos fill it
  function photoClass(src) {
    return /\.png$/i.test(src) ? "" : "is-photo";
  }

  function productImage(product) {
    const photos = productPhotos(product);
    if (!photos.length) return `<span class="placeholder-icon" aria-hidden="true">♡</span>`;
    const src = photos[activePhotos.get(product.id) ?? 0] ?? photos[0];
    return `<img class="${photoClass(src)}" src="${safeText(src)}" alt="${safeText(product.name)}" loading="lazy">`;
  }

  function productThumbs(product) {
    const photos = productPhotos(product);
    if (photos.length < 2) return "";
    const active = activePhotos.get(product.id) ?? 0;
    return `<div class="product-thumbs">${photos.map((src, index) => `
      <button type="button" class="${index === active ? "active" : ""}" data-photo="${safeText(product.id)}" data-index="${index}"
        aria-label="صورة ${index + 1} من ${photos.length} لـ ${safeText(product.name)}" aria-pressed="${index === active}">
        <img class="${photoClass(src)}" src="${safeText(src)}" alt="" loading="lazy">
      </button>`).join("")}</div>`;
  }

  function renderProducts() {
    const visibleProducts = filteredProducts();
    productGrid.innerHTML = visibleProducts.map((product, index) => `
      <article class="product-card ${selectedProductId === product.id ? "selected" : ""}" style="--product-color:${safeText(product.color)}">
        <button class="product-image ${product.image ? "" : "is-placeholder"}" type="button"
          data-try="${safeText(product.id)}" aria-label="جرّبي ${safeText(product.name)} على الدمية">
          <span class="product-number">0${index + 1}</span>
          ${productImage(product)}
          <span class="try-label">جرّبي على الدمية ✦</span>
        </button>
        ${productThumbs(product)}
        <div class="product-info">
          <div class="product-title-row"><h3>${safeText(product.name)}</h3><b>${money(product.price)}</b></div>
          <p class="product-description">${safeText(product.description)}</p>
          <label class="size-label">المقاس
            <select data-size="${safeText(product.id)}" aria-label="مقاس ${safeText(product.name)}">
              ${product.sizes.map((size) => `<option value="${safeText(size)}">${safeText(size)}</option>`).join("")}
            </select>
          </label>
          <button class="add-button" type="button" data-add="${safeText(product.id)}">أضيفي إلى السلة <span aria-hidden="true">＋</span></button>
        </div>
      </article>`).join("");
    emptyState.hidden = visibleProducts.length !== 0;
  }

  function outfitMarkup(product) {
    const color = safeText(product.color);
    const accessory = product.outfit === "accessory";
    if (accessory) {
      return `<path d="M92 55 Q130 14 168 55" fill="none" stroke="${color}" stroke-width="13" stroke-linecap="round"/><circle cx="130" cy="35" r="13" fill="${color}"/><path d="M130 25 C116 15 115 34 130 36 C145 34 144 15 130 25" fill="#f8e6cf"/>`;
    }
    if (product.outfit === "bib") {
      return `<path d="M109 119 Q130 130 151 119 L153 145 L166 175 Q130 194 94 175 L107 145Z" fill="${color}"/><circle cx="130" cy="163" r="8" fill="#fff9f4" fill-opacity=".8"/><path d="M108 128 Q130 143 152 128" fill="none" stroke="#fff9f4" stroke-opacity=".75" stroke-width="3"/>`;
    }
    if (product.outfit === "dress") {
      return `<path d="M101 117 Q130 106 159 117 L171 185 Q175 206 194 278 Q130 293 66 278 Q85 206 89 185Z" fill="${color}"/><path d="M101 117 Q130 135 159 117 L163 183 Q130 196 97 183Z" fill="${color}" stroke="#fff9f4" stroke-opacity=".65" stroke-width="3"/><path d="M91 201 Q130 215 169 201" fill="none" stroke="#fff9f4" stroke-opacity=".7" stroke-width="3"/>`;
    }
    if (product.outfit === "set") {
      return `<path d="M101 117 Q130 107 159 117 L169 184 L158 192 L153 169 L153 214 L107 214 L107 169 L102 192 L91 184Z" fill="${color}"/><path d="M107 214 L153 214 L163 279 L97 279Z" fill="${color}"/><path d="M130 121 L130 209" stroke="#fff9f4" stroke-opacity=".6" stroke-width="3"/>`;
    }
    return `<path d="M101 117 Q130 106 159 117 L170 185 L157 193 L152 165 L156 279 L104 279 L108 165 L103 193 L90 185Z" fill="${color}"/><path d="M108 165 L152 165" stroke="#fff9f4" stroke-opacity=".7" stroke-width="3"/>`;
  }

  function selectProduct(productId) {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    selectedProductId = productId;
    dollOutfit.innerHTML = outfitMarkup(product);
    document.querySelector("#doll-hint").textContent = `الآن على الدمية: ${product.name}`;
    document.querySelector("#doll-stage").setAttribute("aria-label", `دمية ترتدي ${product.name}`);
    renderProducts();
  }

  function persistCart() {
    try {
      localStorage.setItem(cartKey, JSON.stringify(cart));
    } catch (error) {
      console.error("Could not save the cart.", error);
      showToast("تعذّر حفظ السلة على هذا الجهاز.");
    }
  }

  function addToCart(productId, size) {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    const existing = cart.find((item) => item.productId === productId && item.size === size);
    if (existing) existing.quantity += 1;
    else cart.push({ productId, size, quantity: 1 });
    persistCart();
    renderCart();
    showToast("أضيفت القطعة إلى سلّتك ♡");
  }

  function renderCart() {
    const validItems = cart.filter((item) => products.some((product) => product.id === item.productId));
    cart = validItems;
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => {
      const product = products.find((entry) => entry.id === item.productId);
      return sum + product.price * item.quantity;
    }, 0);
    document.querySelector("#cart-count").textContent = new Intl.NumberFormat("ar").format(totalCount);
    document.querySelector("#cart-total").textContent = money(total);
    document.querySelector("#checkout-button").disabled = totalCount === 0 || !whatsappNumber;
    document.querySelector("#checkout-note").textContent = whatsappNumber
      ? "سيتم إرسال تفاصيل طلبك برسالة واتساب."
      : "أضيفي رقم واتساب المحل في ملف store.js لتفعيل الطلب.";
    cartItems.innerHTML = cart.length ? cart.map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      return `<article class="cart-item">
        <span class="cart-item-icon" style="--product-color:${safeText(product.color)}" aria-hidden="true">♡</span>
        <div class="cart-item-info"><b>${safeText(product.name)}</b><small>${safeText(item.size)} · ${money(product.price)}</small>
          <div class="quantity-controls">
            <button type="button" data-quantity="${safeText(product.id)}" data-size="${safeText(item.size)}" data-change="1" aria-label="زيادة الكمية">+</button>
            <span>${item.quantity}</span>
            <button type="button" data-quantity="${safeText(product.id)}" data-size="${safeText(item.size)}" data-change="-1" aria-label="تقليل الكمية">−</button>
          </div>
        </div>
        <button class="remove-item" type="button" data-remove="${safeText(product.id)}" data-size="${safeText(item.size)}" aria-label="حذف ${safeText(product.name)}">×</button>
      </article>`;
    }).join("") : `<div class="cart-empty"><span aria-hidden="true">♡</span><p>سلّتك لسه فاضية</p><small>اختاري قطعك المفضلة وبتلاقيها هون.</small></div>`;
  }

  function showToast(message) {
    const toast = document.querySelector("#toast");
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2300);
  }

  function setCartOpen(open) {
    cartDrawer.classList.toggle("open", open);
    cartDrawer.setAttribute("aria-hidden", String(!open));
    cartOverlay.hidden = !open;
    document.body.classList.toggle("cart-open", open);
    if (open) document.querySelector("#close-cart").focus();
  }

  categoryList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    renderCategories();
    renderProducts();
  });

  productGrid.addEventListener("click", (event) => {
    const tryButton = event.target.closest("[data-try]");
    const addButton = event.target.closest("[data-add]");
    const photoButton = event.target.closest("[data-photo]");
    if (photoButton) {
      activePhotos.set(photoButton.dataset.photo, Number(photoButton.dataset.index));
      renderProducts();
      return;
    }
    if (tryButton) selectProduct(tryButton.dataset.try);
    if (addButton) {
      const sizeSelect = productGrid.querySelector(`[data-size="${CSS.escape(addButton.dataset.add)}"]`);
      addToCart(addButton.dataset.add, sizeSelect.value);
    }
  });

  searchInput.addEventListener("input", () => {
    searchTerm = searchInput.value.trim();
    renderProducts();
  });

  cartItems.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove]");
    const quantityButton = event.target.closest("[data-quantity]");
    if (removeButton) {
      cart = cart.filter((item) => !(item.productId === removeButton.dataset.remove && item.size === removeButton.dataset.size));
    } else if (quantityButton) {
      const item = cart.find((entry) => entry.productId === quantityButton.dataset.quantity && entry.size === quantityButton.dataset.size);
      if (item) {
        item.quantity += Number(quantityButton.dataset.change);
        if (item.quantity < 1) cart = cart.filter((entry) => entry !== item);
      }
    } else return;
    persistCart();
    renderCart();
  });

  document.querySelector("#open-cart").addEventListener("click", () => setCartOpen(true));
  document.querySelector("#close-cart").addEventListener("click", () => setCartOpen(false));
  cartOverlay.addEventListener("click", () => setCartOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setCartOpen(false);
  });

  document.querySelector("#checkout-button").addEventListener("click", () => {
    if (!whatsappNumber || cart.length === 0) return;
    const lines = cart.map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      return `• ${product.name} — ${item.size} × ${item.quantity} — ${money(product.price * item.quantity)}`;
    });
    const total = cart.reduce((sum, item) => sum + products.find((entry) => entry.id === item.productId).price * item.quantity, 0);
    const message = `مرحباً MINI BABY، أرغب بطلب:\n${lines.join("\n")}\n\nالمجموع: ${money(total)}`;
    window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  });

  const contactLink = document.querySelector("#contact-link");
  if (whatsappNumber) {
    contactLink.href = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`;
    contactLink.target = "_blank";
    contactLink.rel = "noopener noreferrer";
  }

  renderCategories();
  renderProducts();
  renderCart();
  if (selectedProductId) selectProduct(selectedProductId);
})();
