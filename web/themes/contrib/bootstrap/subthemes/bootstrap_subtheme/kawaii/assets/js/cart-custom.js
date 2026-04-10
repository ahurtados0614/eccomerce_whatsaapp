(function (Drupal, drupalSettings) {

  document.addEventListener("DOMContentLoaded", function () {

    const CART_KEY = "cartProducts";

    const qtyInput = document.getElementById("input-quantity");
    const btnAdd   = document.getElementById("button-cart");

    const productData = drupalSettings.productData || null;

    /* ===========================
       PINTAR CARRITO
    =========================== */
    function renderCart() {

      let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

      const cartProducts = document.querySelector(".dropdown-cart-products");
      const cartTotalEl  = document.querySelector(".cart-total-price");
      const cartCountEl  = document.querySelector(".cart-count");
      const cartAction   = document.querySelector(".dropdown-cart-action");

      if (!cartProducts) return;

      cartProducts.innerHTML = "";

      let totalGeneral = 0;
      let totalQuantity = 0;

      /* ===== CARRITO VACÍO ===== */
      if (cart.length === 0) {

        cartProducts.innerHTML = `
          <p class="text-center">¡Tu carrito está vacío!</p>
        `;

        if (cartTotalEl) cartTotalEl.textContent = "$0";
        if (cartCountEl) cartCountEl.textContent = "0";

        if (cartAction) cartAction.style.display = "none";
        return;
      }

      /* ===== MOSTRAR BOTÓN ===== */
      if (cartAction) cartAction.style.display = "block";

      /* ===== PRODUCTOS ===== */
      cart.forEach((item, index) => {

        totalGeneral  += item.total_price;
        totalQuantity += item.quantity;

        cartProducts.innerHTML += `
          <div class="product">

            <div class="product-cart-details">
              <h4 class="product-title">
                <a href="#">${item.name}</a>
              </h4>

              <span class="cart-product-info">
                <span class="cart-product-qty">${item.quantity}</span>
                x $${item.price.toLocaleString('es-CO')}
              </span>
            </div>

            <figure class="product-image-container">
              <a href="#" class="product-image">
                <img src="${item.image}" alt="${item.name}">
              </a>
            </figure>

            <a href="#" class="btn-remove" data-index="${index}" title="Eliminar">
              <i class="icon-close"></i>
            </a>

          </div>
        `;
      });

      /* ===== TOTAL ===== */
      if (cartTotalEl) {
        cartTotalEl.textContent = "$" + totalGeneral.toLocaleString('es-CO');
      }

      /* ===== CONTADOR ===== */
      if (cartCountEl) {
        cartCountEl.textContent = totalQuantity;
      }

      /* ===== ELIMINAR PRODUCTO ===== */
      document.querySelectorAll(".btn-remove").forEach(btn => {
        btn.addEventListener("click", function (e) {
          e.preventDefault();

          let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
          cart.splice(this.dataset.index, 1);
          localStorage.setItem(CART_KEY, JSON.stringify(cart));

          renderCart();
        });
      });
    }

    /* ===========================
       AGREGAR PRODUCTO (PÁGINA PRODUCTO)
    =========================== */
    if (btnAdd && productData) {

      btnAdd.addEventListener("click", function () {

        let quantity = parseInt(qtyInput?.value || 1);
        if (!quantity || quantity <= 0) return;

        const PRODUCT_ID    = productData.id;
        const PRODUCT_NAME  = productData.name;
        const PRODUCT_PRICE = parseFloat(productData.price);
        const PRODUCT_SKU   = productData.sku;
        const PRODUCT_IMG   = productData.image || '/themes/custom/tu_tema/no-image.jpg';

        let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

        const index = cart.findIndex(item => item.id === PRODUCT_ID);

        if (index !== -1) {
          cart[index].quantity += quantity;
          cart[index].total_price += quantity * PRODUCT_PRICE;
        } else {
          cart.push({
            id: PRODUCT_ID,
            sku: PRODUCT_SKU,
            image: PRODUCT_IMG,
            name: PRODUCT_NAME,
            price: PRODUCT_PRICE,
            quantity: quantity,
            total_price: quantity * PRODUCT_PRICE
          });
        }

        localStorage.setItem(CART_KEY, JSON.stringify(cart));

        renderCart();
      });
    }

    /* ===== SINCRONIZAR ENTRE PESTAÑAS ===== */
    window.addEventListener("storage", renderCart);

    /* ===== INICIALIZAR ===== */
    renderCart();

    /* 🔥 HACER GLOBAL */
    window.renderCart = renderCart;

  });

})(Drupal, drupalSettings);


/* ==========================================================
   🔥 NUEVO: AGREGAR DESDE LISTADOS (onclick)
========================================================== */
window.addToCart = function (el) {

  const CART_KEY = "cartProducts";

  const PRODUCT_ID    = el.dataset.id;
  const PRODUCT_NAME  = el.dataset.name;
  const PRODUCT_PRICE = parseFloat(el.dataset.price);
  const PRODUCT_SKU   = el.dataset.sku;
  const PRODUCT_IMG   = el.dataset.image;

  let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

  const index = cart.findIndex(item => item.id === PRODUCT_ID);

  if (index !== -1) {
    cart[index].quantity += 1;
    cart[index].total_price += PRODUCT_PRICE;
  } else {
    cart.push({
      id: PRODUCT_ID,
      sku: PRODUCT_SKU,
      image: PRODUCT_IMG,
      name: PRODUCT_NAME,
      price: PRODUCT_PRICE,
      quantity: 1,
      total_price: PRODUCT_PRICE
    });
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart));

  if (typeof window.renderCart === "function") {
    window.renderCart();
  }

}