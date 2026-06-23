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

//filtros


(function (Drupal, once) {

  Drupal.behaviors.productsAjax = {

    attach(context) {

      once(
        'productsAjax',
        '.js-products-container',
        context
      ).forEach(function (container) {

        let allProducts = [];

        let currentIndex = 0;

        const INITIAL_LOAD =
          parseInt(container.dataset.initialLoad) || 12;

        const LOAD_MORE =
          parseInt(container.dataset.loadMore) || 12;

        const api =
          container.dataset.api;

        const wrapper =
          container.closest('.new-arrivals');

        const btnLoadMore =
          wrapper.querySelector('.js-load-more');

        /*
         * 🔥 LIMPIAR
         */
        container.innerHTML = '';

        /* =========================================
           🔥 EVENTO FILTROS
        ========================================= */
        document.addEventListener('change', function (e) {

          if (e.target.classList.contains('js-filter')) {

            currentIndex = 0;

            allProducts = [];

            container.innerHTML = '';

            loadProducts();

          }

        });

        /* =========================================
          🔥 LOAD PRODUCTS
        ========================================= */
        function loadProducts(firstLoad = false) {

          let queryString;

          if (firstLoad) {

            queryString =
              window.location.search.replace('?', '');

          } else {

            queryString =
              buildFiltersQuery();

          }

          // Loader
          container.innerHTML = `
            <div class="d-flex justify-content-center">
            <div class="spinner-border" role="status" style="margin-right: 0.5em;">
              <span class="sr-only">Loading...</span>
            </div>
            <h5> Buscando los mejores productos para ti...</h5>
          </div>
          `;

          fetch(api + (queryString ? '?' + queryString : ''))

            .then(res => res.json())

            .then(dato => {

              allProducts = [];

              dato.forEach(el => {

                allProducts.push(el.items);

              });

              currentIndex = 0;

              // No existen resultados
              if (allProducts.length === 0) {

                container.innerHTML = `
                  <div class="alert alert-secondary" style="width: 100%; margin: 0em 1em;">
                      <strong>Upss!</strong> No encontramos productos.<br>
                      Intenta cambiar los filtros seleccionados.
                    </div>
                `;

                if (btnLoadMore) {
                  btnLoadMore.style.display = 'none';
                }

                return;
              }

              renderProducts(INITIAL_LOAD);

              toggleButton();

            })

            .catch(err => {

              console.error(err);

              container.innerHTML = `
              <div class="alert alert-alert" style="width: 100%; margin: 0em 1em;">
                      <strong>⚠ Error al cargar productos</strong> Intenta nuevamente en unos segundos.<br>
                      Intenta cambiar los filtros seleccionados.
                    </div>
              `;

              if (btnLoadMore) {
                btnLoadMore.style.display = 'none';
              }

            });

        }

        /* =========================================
           🔥 QUERYSTRING
        ========================================= */
        function buildFiltersQuery() {

          const params =
            new URLSearchParams();

          const checkedFilters =
            document.querySelectorAll('.js-filter:checked');

          checkedFilters.forEach((checkbox) => {

            const filter =
              checkbox.dataset.filter;

            const value =
              checkbox.value;

            params.append(
              `${filter}[${value}]`,
              value
            );

          });

          params.append(
            'sort_by',
            'field_precio_del_articulo_value'
          );

          params.append(
            'sort_order',
            'DESC'
          );

          /*
           * 🔥 UPDATE URL
           */
          const newUrl =
            window.location.pathname +
            '?' +
            params.toString();

          window.history.replaceState(
            {},
            '',
            newUrl
          );

          return params.toString();

        }

        /* =========================================
           🔥 RENDER
        ========================================= */
        function renderProducts(limit) {

          let html = '';

          const nextItems =
            allProducts.slice(
              currentIndex,
              currentIndex + limit
            );

          nextItems.forEach(item => {

            html += item;

          });

          if (currentIndex === 0) {

            container.innerHTML = html;

          } else {

            container.innerHTML += html;

          }

          currentIndex += limit;

        }

        /* =========================================
           🔥 LOAD MORE
        ========================================= */
        if (btnLoadMore) {

          btnLoadMore.addEventListener(
            'click',
            function (e) {

              e.preventDefault();

              renderProducts(LOAD_MORE);

              toggleButton();

            }
          );

        }

        /* =========================================
           🔥 BUTTON
        ========================================= */
        function toggleButton() {

          if (!btnLoadMore) return;

          if (currentIndex >= allProducts.length) {

            btnLoadMore.style.display = 'none';

          } else {

            btnLoadMore.style.display = 'inline-block';

          }

        }

        /* =========================================
           🔥 INIT
        ========================================= */
        loadProducts(true);

      });

    }

  };

})(Drupal, once);
