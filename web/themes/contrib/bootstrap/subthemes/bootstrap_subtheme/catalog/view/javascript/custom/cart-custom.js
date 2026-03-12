(function (Drupal, drupalSettings) {

  document.addEventListener("DOMContentLoaded", function () {

    const CART_KEY = "cartProducts";

    const cartMenu     = document.getElementById("cart-menu");
    const cartTotalEl  = document.getElementById("cart-total");
    const cartQtyEl    = document.getElementById("cart-quantity");

    const qtyInput = document.getElementById("input-quantity");
    const btnAdd   = document.getElementById("button-cart");

    // Puede no existir si no estamos en página de producto
    const productData = drupalSettings.productData || null;

    /* ===========================
       PINTAR CARRITO
    =========================== */
    function renderCart() {

      let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

      if (cartMenu) {
        cartMenu.innerHTML = "";
      }

      let totalGeneral = 0;
      let totalQuantity = 0;

      if (cart.length === 0) {

        if (cartMenu) {
          cartMenu.innerHTML = `
            <li>
              <p class="text-center">¡Tu carrito de compras está vacío!</p>
            </li>
          `;
        }

        if (cartTotalEl) cartTotalEl.textContent = "$0 COP";
        if (cartQtyEl)   cartQtyEl.textContent   = "0";

        return;
      }

      cart.forEach((item, index) => {

        totalGeneral  += item.total_price;
        totalQuantity += item.quantity;

        if (cartMenu) {
          cartMenu.innerHTML += `
            <li style="padding:10px; border-bottom:1px solid #eee;">
              <strong style="font-weight: bold;">${item.name}</strong><br>
              SKU: ${item.sku}<br>
              Cantidad: ${item.quantity}<br>
              $${item.total_price.toLocaleString('es-CO')} COP
              <button 
                data-index="${index}" 
                class="remove-item"
                style="float:right; border:none; background:none; color:red; cursor:pointer;">
                ✕
              </button>
            </li>
          `;
        }
      });

      if (cartMenu) {
        cartMenu.innerHTML += `
          <li style="padding:10px;">
            <strong style="font-weight: bold;">Total: $${totalGeneral.toLocaleString('es-CO')} COP</strong>
          </li>
          <li style="padding:10px; text-align:center;">
      <a href="/cart"
         style="
           display:block;
           background:#c0d06d;
           color:#fff;
           padding:8px;
           border-radius:4px;
           text-decoration:none;
           font-weight:bold;
         ">
         Finalizar Compra
      </a>
    </li>
        `;
      }

      // 🔥 ACTUALIZAR HEADER
      if (cartTotalEl) {
        cartTotalEl.textContent = "$" + totalGeneral.toLocaleString('es-CO') + " COP";
      }

      if (cartQtyEl) {
        cartQtyEl.textContent = totalQuantity;
      }

      // 🔥 BOTONES ELIMINAR
      document.querySelectorAll(".remove-item").forEach(btn => {
        btn.addEventListener("click", function () {
          let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
          cart.splice(this.dataset.index, 1);
          localStorage.setItem(CART_KEY, JSON.stringify(cart));
          renderCart();
        });
      });
    }

    /* ===========================
       AGREGAR PRODUCTO
    =========================== */
    if (btnAdd && productData) {

      btnAdd.addEventListener("click", function () {

        let quantity = parseInt(qtyInput.value);
        if (!quantity || quantity <= 0) return;
        
        const PRODUCT_ID    = productData.id;
        const PRODUCT_NAME  = productData.name;
        const PRODUCT_PRICE = parseFloat(productData.price);
        const PRODUCT_SKU   = productData.sku;
        const PRODUCT_IMG  = productData.image;
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

    // 🔥 Sincronizar entre pestañas
    window.addEventListener("storage", renderCart);

    // Inicializar
    renderCart();

  });

})(Drupal, drupalSettings);