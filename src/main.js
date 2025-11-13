import { Router } from "./app/router/router.js";
import { renderProductList } from "./pages/productList.js";
import { renderProductDetail } from "./pages/productDetail.js";
import {
  productListLoadingLayout,
  productListLoadedLayout,
  productListCategoryDepth1Layout,
  productListCategoryDepth2Layout,
} from "./pages/productList.js";
import { cartEmptyLayout, cartNoSelectionLayout, cartWithSelectionLayout } from "./pages/cart.js";
import { productDetailLoadingLayout, productDetailLoadedLayout } from "./pages/productDetail.js";
import { toastTemplates } from "./components/toast.js";
import { notFoundLayout } from "./pages/notFound.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    limit: parseInt(params.get("limit")) || 20,
    search: params.get("search") || "",
    category1: params.get("category1") || "",
    category2: params.get("category2") || "",
    sort: params.get("sort") || "price_asc",
  };
}

function main() {
  const router = new Router();

  window.__router__ = router;

  router.register("/", () => {
    const params = getQueryParams();
    renderProductList(params);
  });

  router.register("/product/:id", () => {
    const path = window.location.pathname;
    const productId = path.split("/product/")[1];
    if (productId) {
      renderProductDetail(productId);
    }
  });

  router.register("/404", () => {
    const root = document.getElementById("root") || document.body;
    root.innerHTML = notFoundLayout;
  });

  router.handleRoute();
}

function renderShowcase() {
  const showcaseMarkup = `
    ${productListLoadingLayout}
    <br />
    ${productListLoadedLayout}
    <br />
    ${productListCategoryDepth1Layout}
    <br />
    ${productListCategoryDepth2Layout}
    <br />
    ${toastTemplates}
    <br />
    ${cartEmptyLayout}
    <br />
    ${cartNoSelectionLayout}
    <br />
    ${cartWithSelectionLayout}
    <br />
    ${productDetailLoadingLayout}
    <br />
    ${productDetailLoadedLayout}
    <br />
    ${notFoundLayout}
  `;
  const root = document.getElementById("root") || document.body;
  root.innerHTML = showcaseMarkup;
}

if (import.meta.env.MODE !== "test") {
  enableMocking().then(() => {
    if (new URLSearchParams(window.location.search).get("showcase") === "true") {
      renderShowcase();
    } else {
      main();
    }
  });
} else {
  main();
}
