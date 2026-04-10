document.addEventListener("DOMContentLoaded", function () {

  const menuBtn = document.querySelector(".mobile-menu-toggler");
  const menu = document.querySelector(".main-nav");
  const closeBtn = document.querySelector(".mobile-menu-close"); // 👈 NUEVO

  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  if (closeBtn && menu) {
    closeBtn.addEventListener("click", function () {
      menu.classList.remove("open");
    });
  }

  const links = document.querySelectorAll(".menu li.has-submenu > a");

  links.forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const parent = this.parentElement;
      parent.classList.toggle("open");
    });
  });

});

document.addEventListener("DOMContentLoaded", function () {

  const spinner = document.getElementById("spinner");

  if (!spinner) return;

 
  function hideSpinner() {
    spinner.classList.add("hidden");
  }

  window.addEventListener("load", function () {
    setTimeout(hideSpinner, 200); 
  });


  document.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", function (e) {

      const href = this.getAttribute("href");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("javascript") ||
        this.target === "_blank" ||
        this.hasAttribute("download")
      ) return;

      spinner.classList.remove("hidden");
    });
  });

});

document.addEventListener("click", function (e) {

  const btn = e.target.closest(".add-to-cart");

  if (!btn) return;

  e.preventDefault();

  const CART_KEY = "cartProducts";

  const PRODUCT_ID    = btn.dataset.id;
  const PRODUCT_NAME  = btn.dataset.name;
  const PRODUCT_PRICE = parseFloat(btn.dataset.price);
  const PRODUCT_SKU   = btn.dataset.sku;
  const PRODUCT_IMG   = btn.dataset.image;

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

});