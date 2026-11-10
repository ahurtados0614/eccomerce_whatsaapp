(function (Drupal, drupalSettings) {

  document.addEventListener("DOMContentLoaded", function () {

    const CART_KEY = "cartProducts";

    const qtyInput = document.getElementById("quantity");
    const btnAdd   = document.getElementById("button-cart");

    const productData = drupalSettings.productData || null;

    /* ======================================
       CREAR CLAVE ÚNICA
    ====================================== */
    function getItemKey(id, color = '', talla = '') {
      return `${id}_${color}_${talla}`;
    }

    /* ======================================
       RENDER CARRITO
    ====================================== */
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

      /* ===== VACÍO ===== */
      if (cart.length === 0) {

        cartProducts.innerHTML = `
          <p class="text-center">¡Tu carrito está vacío!</p>
        `;

        if (cartTotalEl) cartTotalEl.textContent = "$0";
        if (cartCountEl) cartCountEl.textContent = "0";

        if (cartAction) {
          cartAction.style.display = "none";
        }

        return;
      }

      if (cartAction) {
        cartAction.style.display = "block";
      }

      /* ===== PRODUCTOS ===== */
      cart.forEach((item, index) => {

        totalGeneral += item.total_price;
        totalQuantity += item.quantity;

        cartProducts.innerHTML += `
          <div class="product">

            <div class="product-cart-details">

              <h4 class="product-title">
                <a href="#">${item.name}</a>
              </h4>

              ${
                item.color
                  ? `
                    <div style="margin-bottom:4px;">
                      Color:
                      <span style="
                        display:inline-block;
                        width:14px;
                        height:14px;
                        border-radius:50%;
                        background:${item.color};
                        border:1px solid #ccc;
                        vertical-align:middle;
                        margin-left:4px;
                      "></span>
                    </div>
                  `
                  : ''
              }

              ${
                item.talla
                  ? `
                    <div style="margin-bottom:4px;">
                      Talla: ${item.talla.toUpperCase()}
                    </div>
                  `
                  : ''
              }

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

            <a href="#"
               class="btn-remove"
               data-index="${index}">
              <i class="icon-close"></i>
            </a>

          </div>
        `;
      });

      /* ===== TOTAL ===== */
      if (cartTotalEl) {
        cartTotalEl.textContent =
          "$" + totalGeneral.toLocaleString('es-CO');
      }

      /* ===== CONTADOR ===== */
      if (cartCountEl) {
        cartCountEl.textContent = totalQuantity;
      }

      /* ===== ELIMINAR ===== */
      document.querySelectorAll(".btn-remove").forEach(btn => {

        btn.addEventListener("click", function (e) {

          e.preventDefault();

          let cart =
            JSON.parse(localStorage.getItem(CART_KEY)) || [];

          cart.splice(this.dataset.index, 1);

          localStorage.setItem(
            CART_KEY,
            JSON.stringify(cart)
          );

          renderCart();

        });

      });

    }

    /* ======================================
       AGREGAR DESDE PRODUCTO
    ====================================== */
    if (btnAdd && productData) {

      btnAdd.addEventListener("click", function () {

        let quantity = parseInt(qtyInput?.value || 1);

        if (!quantity || quantity <= 0) {
          quantity = 1;
        }

        const PRODUCT_ID    = String(productData.id);
        const PRODUCT_NAME  = productData.name;
        const PRODUCT_PRICE = parseFloat(productData.price);
        const PRODUCT_SKU   = productData.sku;

        const PRODUCT_IMG =
          productData.image ||
          '/themes/custom/tu_tema/no-image.jpg';

        /* ===== COLOR ===== */
        const activeColor =
          document.querySelector(".color-option.active");

        const PRODUCT_COLOR =
          activeColor
            ? activeColor.dataset.color
            : '';

        /* ===== TALLA ===== */
        const sizeSelect =
          document.getElementById("size");

        const PRODUCT_SIZE =
          sizeSelect
            ? sizeSelect.value
            : '';

        /* ===== CLAVE ===== */
        const ITEM_KEY = getItemKey(
          PRODUCT_ID,
          PRODUCT_COLOR,
          PRODUCT_SIZE
        );

        let cart =
          JSON.parse(localStorage.getItem(CART_KEY)) || [];

        const index = cart.findIndex(
          item => item.key === ITEM_KEY
        );

        if (index !== -1) {

          cart[index].quantity += quantity;

          cart[index].total_price =
            cart[index].quantity * PRODUCT_PRICE;

        } else {

          cart.push({

            key: ITEM_KEY,

            id: PRODUCT_ID,
            sku: PRODUCT_SKU,

            image: PRODUCT_IMG,

            name: PRODUCT_NAME,

            price: PRODUCT_PRICE,

            color: PRODUCT_COLOR,
            talla: PRODUCT_SIZE,

            quantity: quantity,

            total_price:
              quantity * PRODUCT_PRICE

          });

        }

        localStorage.setItem(
          CART_KEY,
          JSON.stringify(cart)
        );

        renderCart();

      });

    }

    /* ======================================
       STORAGE
    ====================================== */
    window.addEventListener("storage", renderCart);

    renderCart();

    window.renderCart = renderCart;

  });

})(Drupal, drupalSettings);


/* ==========================================
   AGREGAR DESDE LISTADOS
========================================== */
window.addToCart = function (el) {

  const CART_KEY = "cartProducts";

  function getItemKey(id, color = '', talla = '') {
    return `${id}_${color}_${talla}`;
  }

  const PRODUCT_ID    = String(el.dataset.id);
  const PRODUCT_NAME  = el.dataset.name;
  const PRODUCT_PRICE = parseFloat(el.dataset.price);
  const PRODUCT_SKU   = el.dataset.sku;
  const PRODUCT_IMG   = el.dataset.image;

  const PRODUCT_COLOR = el.dataset.color || '';
  const PRODUCT_SIZE  = el.dataset.talla || '';

  const ITEM_KEY = getItemKey(
    PRODUCT_ID,
    PRODUCT_COLOR,
    PRODUCT_SIZE
  );

  let cart =
    JSON.parse(localStorage.getItem(CART_KEY)) || [];

  const index = cart.findIndex(
    item => item.key === ITEM_KEY
  );

  if (index !== -1) {

    cart[index].quantity += 1;

    cart[index].total_price =
      cart[index].quantity * PRODUCT_PRICE;

  } else {

    cart.push({

      key: ITEM_KEY,

      id: PRODUCT_ID,

      sku: PRODUCT_SKU,

      image: PRODUCT_IMG,

      name: PRODUCT_NAME,

      price: PRODUCT_PRICE,

      color: PRODUCT_COLOR,

      talla: PRODUCT_SIZE,

      quantity: 1,

      total_price: PRODUCT_PRICE

    });

  }

  localStorage.setItem(
    CART_KEY,
    JSON.stringify(cart)
  );

  if (typeof window.renderCart === "function") {
    window.renderCart();
  }

};