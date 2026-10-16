(() => {
  const { currency, whatsappNumber, categories, products, business } = window.MINI_BABY;
  const cartKey = "mini-baby-cart-v1";
  const productGrid = document.querySelector("#product-grid");
  const categoryList = document.querySelector("#category-list");
  const searchInput = document.querySelector("#product-search");
  const emptyState = document.querySelector("#empty-state");
  const cartDrawer = document.querySelector("#cart-drawer");
  const cartOverlay = document.querySelector("#cart-overlay");
  const cartItems = document.querySelector("#cart-items");
  let activeCategory = "all";
  let searchTerm = "";
  let selectedProductId = products[0]?.id ?? "";
  const activePhotos = new Map();
  const selectedColors = new Map();
  products.forEach((product) => {
    if (!product.colors?.length) return;
    selectedColors.set(
      product.id,
      product.colors.find((color) => color.name === product.colorName) || product.colors[0]
    );
  });
  let cart = loadCart();
  let toastTimer;

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(cartKey) || "[]");
      if (!Array.isArray(saved)) return [];
      return saved.filter((item) => item && typeof item === "object").map((item) => {
        const product = products.find((entry) => entry.id === item.productId);
        if (!product) return item;
        const color = product.colors?.find((entry) => entry.name === item.colorName);
        return {
          ...item,
          colorName: color?.name || item.colorName || product.colorName || "",
          colorHex: color?.hex || item.colorHex || product.color || "#dedbd2"
        };
      });
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

  function selectedColor(product) {
    return selectedColors.get(product.id) || {
      name: product.colorName || "",
      hex: product.color
    };
  }

  function renderCategories() {
    categoryList.innerHTML = categories.map((category) => `
      <button class="category-chip ${activeCategory === category.id ? "active" : ""}"
        type="button" data-category="${safeText(category.id)}" aria-pressed="${activeCategory === category.id}">
        ${safeText(category.label)}
      </button>`).join("");
  }

  function renderBusinessInfo() {
    const target = document.querySelector("#store-information");
    if (!target || !business) return;
    target.innerHTML = `
      <div class="store-details-heading">
        <p class="eyebrow">أهلًا بكم</p>
        <h2 id="store-title">${safeText(business.name)}</h2>
        <p>${safeText(business.description)}</p>
      </div>
      <div class="store-details-grid">
        <section class="store-card" aria-labelledby="contact-title">
          <h3 id="contact-title">زورونا وتواصلوا معنا</h3>
          <p><b>الموقع:</b> ${safeText(business.address)}</p>
          <p><b>الهاتف:</b> <a href="tel:${safeText(business.phone.replace(/[^\d+]/g, ""))}">${safeText(business.phone)}</a></p>
          <div class="store-social-links">
            <a href="${safeText(business.instagram)}" target="_blank" rel="noopener noreferrer">إنستغرام @mini_baby_jo</a>
            <a href="${safeText(business.facebook)}" target="_blank" rel="noopener noreferrer">صفحتنا على فيسبوك</a>
          </div>
          <h3 class="hours-title">ساعات العمل</h3>
          <table class="hours-table">
            <tbody>${business.hours.map(({ day, time }) => `
              <tr><th scope="row">${safeText(day)}</th><td>${safeText(time)}</td></tr>`).join("")}
            </tbody>
          </table>
        </section>
        <section class="store-card reviews-card" aria-labelledby="reviews-title">
          <h3 id="reviews-title">آراء العملاء</h3>
          <p class="store-rating"><span aria-label="خمس نجوم">★★★★★</span> <b>${safeText(business.rating)}</b></p>
          <div class="review-list">${business.reviews.map((review) => `
            <blockquote>«${safeText(review)}»</blockquote>`).join("")}
          </div>
        </section>
      </div>`;
  }

  function filteredProducts() {
    return products.filter((product) => {
      const matchesCategory = activeCategory === "all" || product.category === activeCategory;
      const haystack = `${product.name} ${product.description}`.toLocaleLowerCase("ar");
      return matchesCategory && haystack.includes(searchTerm.toLocaleLowerCase("ar"));
    });
  }

  function productPhotos(product) {
    const color = selectedColor(product);
    if (color.photos) return color.photos.filter(Boolean);
    if (product.colorName && color.name !== product.colorName) return [];
    return [product.image, ...(product.gallery || [])].filter(Boolean);
  }

  // Transparent cut-outs (.png) sit inside the frame; regular photos fill it
  function photoClass(src) {
    if (/winter-wool-set-colors\.jpg$/i.test(src)) return "is-color-board";
    if (/\/girls-[^/]+\/product\.jpg$/i.test(src)) return "is-product-photo";
    if (/winter-wool-set-mannequin-|\/(?:front|back|mannequin)\.(?:jpg|png)$/i.test(src)) return "is-mannequin";
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

  function productColors(product) {
    if (!product.colors?.length) return "";
    const active = selectedColor(product);
    return `<fieldset class="color-picker">
      <legend>اللون: ${safeText(active.name)}</legend>
      <div class="color-swatches">${product.colors.map((color, index) => `
        <button type="button" class="color-swatch ${color.name === active.name ? "active" : ""}"
          style="--swatch-color:${safeText(color.hex)}" data-color-product="${safeText(product.id)}" data-color-index="${index}"
          title="${safeText(color.name)}" aria-label="اختيار اللون ${safeText(color.name)}"
          aria-pressed="${color.name === active.name}"></button>`).join("")}</div>
    </fieldset>
    <p class="color-note">الصورة تعرض المانيكان منفردًا باللون ${safeText(active.name)}.</p>`;
  }

  function renderProducts() {
    const visibleProducts = filteredProducts();
    productGrid.innerHTML = visibleProducts.map((product, index) => {
      const color = selectedColor(product);
      return `
      <article class="product-card ${selectedProductId === product.id ? "selected" : ""}" style="--product-color:${safeText(color.hex)}">
        <button class="product-image ${color.mannequin ? "has-mannequin" : ""} ${product.image ? "" : "is-placeholder"}" type="button"
          data-try="${safeText(product.id)}" aria-label="عرض صور ${safeText(product.name)}">
          <span class="product-number">0${index + 1}</span>
          ${productImage(product)}
          <span class="try-label">عرض صور القطعة ✦</span>
        </button>
        ${productThumbs(product)}
        <div class="product-info">
          <div class="product-title-row"><h3>${safeText(product.name)}</h3><b>${product.price == null ? "السعر عبر واتساب" : money(product.price)}</b></div>
          <p class="product-description">${safeText(product.description)}</p>
          <label class="size-label">المقاس
            <select data-size="${safeText(product.id)}" aria-label="مقاس ${safeText(product.name)}">
              ${product.sizes.map((size) => `<option value="${safeText(size)}">المقاس ${safeText(size)}</option>`).join("")}
            </select>
          </label>
          ${product.sizeNote ? `<p class="size-note">${safeText(product.sizeNote)}</p>` : ""}
          ${productColors(product)}
          <button class="add-button" type="button" data-add="${safeText(product.id)}">أضيفي إلى السلة <span aria-hidden="true">＋</span></button>
        </div>
      </article>`;
    }).join("");
    emptyState.hidden = visibleProducts.length !== 0;
  }

  function selectProduct(productId) {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    selectedProductId = productId;
    const color = selectedColor(product);
    const mannequinImage = product.mannequin || color.mannequin || color.photos?.[0] || product.image;
    const dollStage = document.querySelector("#doll-stage");
    const stageImage = dollStage.querySelector("img");
    document.querySelector("#doll-hint").textContent = color.name
      ? `المانيكان باللون ${color.name}.`
      : `معاينة ${product.name}.`;
    stageImage.src = mannequinImage;
    stageImage.alt = color.name
      ? `${product.name} على مانيكان منفرد باللون ${color.name}`
      : `${product.name} على المانيكان`;
    dollStage.setAttribute("aria-label", color.name
      ? `المانيكان مرتدٍ الطقم باللون ${color.name}`
      : `معاينة ${product.name} على المانيكان`);
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
    const color = selectedColor(product);
    const colorName = color.name || product.colorName || "";
    const existing = cart.find((item) => item.productId === productId && item.size === size && (item.colorName || "") === colorName);
    if (existing) existing.quantity += 1;
    else cart.push({
      productId,
      size,
      ...(colorName ? { colorName } : {}),
      colorHex: color.hex || product.color,
      quantity: 1
    });
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
      return sum + (product.price ?? 0) * item.quantity;
    }, 0);
    const hasUnpricedItems = cart.some((item) => products.find((entry) => entry.id === item.productId).price == null);
    document.querySelector("#cart-count").textContent = new Intl.NumberFormat("ar").format(totalCount);
    document.querySelector("#cart-total").textContent = hasUnpricedItems ? "يحدد عبر واتساب" : money(total);
    document.querySelector("#checkout-button").disabled = totalCount === 0 || !whatsappNumber;
    document.querySelector("#checkout-note").textContent = whatsappNumber
      ? "سيتم إرسال تفاصيل طلبك برسالة واتساب."
      : "أضيفي رقم واتساب المحل في ملف store.js لتفعيل الطلب.";
    cartItems.innerHTML = cart.length ? cart.map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      const colorName = item.colorName || product.colorName || "";
      const colorHex = item.colorHex || product.color || "#dedbd2";
      const itemImage = product.colors?.find((color) => color.name === colorName)?.photos?.[0] || product.image;
      const itemDetails = [`المقاس ${safeText(item.size)}`, colorName && safeText(colorName), product.price == null
        ? "السعر عبر واتساب"
        : money(product.price)].filter(Boolean).join(" · ");
      return `<article class="cart-item">
        ${itemImage
          ? `<img class="cart-item-icon" src="${safeText(itemImage)}" alt="${safeText(product.name)}" loading="lazy">`
          : `<span class="cart-item-icon" style="--product-color:${safeText(colorHex)}" aria-hidden="true">♡</span>`}
        <div class="cart-item-info"><b>${safeText(product.name)}</b><small>${itemDetails}</small>
          <div class="quantity-controls">
            <button type="button" data-quantity="${safeText(product.id)}" data-size="${safeText(item.size)}" data-color-name="${safeText(colorName)}" data-change="1" aria-label="زيادة الكمية">+</button>
            <span>${item.quantity}</span>
            <button type="button" data-quantity="${safeText(product.id)}" data-size="${safeText(item.size)}" data-color-name="${safeText(colorName)}" data-change="-1" aria-label="تقليل الكمية">−</button>
          </div>
        </div>
        <button class="remove-item" type="button" data-remove="${safeText(product.id)}" data-size="${safeText(item.size)}" data-color-name="${safeText(colorName)}" aria-label="حذف ${safeText(product.name)}">×</button>
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
    const colorButton = event.target.closest("[data-color-product]");
    if (colorButton) {
      const product = products.find((item) => item.id === colorButton.dataset.colorProduct);
      const color = product?.colors?.[Number(colorButton.dataset.colorIndex)];
      if (!product || !color) return;
      selectedColors.set(product.id, color);
      activePhotos.set(product.id, 0);
      selectProduct(product.id);
      return;
    }
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
      cart = cart.filter((item) => !(item.productId === removeButton.dataset.remove && item.size === removeButton.dataset.size && (item.colorName || "") === (removeButton.dataset.colorName || "")));
    } else if (quantityButton) {
      const item = cart.find((entry) => entry.productId === quantityButton.dataset.quantity && entry.size === quantityButton.dataset.size && (entry.colorName || "") === (quantityButton.dataset.colorName || ""));
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
      const colorName = item.colorName || product.colorName;
      const details = [
        `المقاس ${item.size}`,
        colorName,
        `الكمية ${item.quantity}`,
        product.price == null ? "السعر يحدد عبر واتساب" : money(product.price * item.quantity)
      ].filter(Boolean);
      return `• ${product.name} — ${details.join(" — ")}`;
    });
    const hasUnpricedItems = cart.some((item) => products.find((entry) => entry.id === item.productId).price == null);
    const total = cart.reduce((sum, item) => sum + (products.find((entry) => entry.id === item.productId).price ?? 0) * item.quantity, 0);
    const totalMessage = hasUnpricedItems ? "المجموع يحدد عبر واتساب" : `المجموع: ${money(total)}`;
    const message = `مرحباً MINI BABY، أرغب بطلب:\n${lines.join("\n")}\n\n${totalMessage}`;
    window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  });

  const contactLink = document.querySelector("#contact-link");
  if (whatsappNumber) {
    contactLink.href = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`;
    contactLink.target = "_blank";
    contactLink.rel = "noopener noreferrer";
  }

  renderBusinessInfo();
  renderCategories();
  renderProducts();
  renderCart();
  if (selectedProductId) selectProduct(selectedProductId);
})();
