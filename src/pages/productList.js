import { getProducts, getCategories, getProduct } from "../api/productApi.js";
import { addToCart, updateCartIcon } from "../app/services/cartService.js";
import { showToast } from "../components/toast.js";
import { openCartModal } from "./cart.js";

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

function createProductCard(product) {
  return `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden product-card"
         data-product-id="${product.productId}">
      <!-- 상품 이미지 -->
      <div class="aspect-square bg-gray-100 overflow-hidden cursor-pointer product-image">
        <img src="${product.image}"
             alt="${product.title}"
             class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
             loading="lazy">
      </div>
      <!-- 상품 정보 -->
      <div class="p-3">
        <div class="cursor-pointer product-info mb-3">
          <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
            ${product.title}
          </h3>
          ${product.brand ? `<p class="text-xs text-gray-500 mb-2">${product.brand}</p>` : ""}
          <p class="text-lg font-bold text-gray-900">
            ${parseInt(product.lprice).toLocaleString()}원
          </p>
        </div>
        <!-- 장바구니 버튼 -->
        <button class="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md
               hover:bg-blue-700 transition-colors add-to-cart-btn" data-product-id="${product.productId}">
          장바구니 담기
        </button>
      </div>
    </div>
  `;
}

// function createCategory1Button(category) {
//   return `
//     <button data-category1="${category}" class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
//        bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
//       ${category}
//     </button>
//   `;
// }

function createCategory2Button(category1, category2, isActive = false) {
  const activeClass = isActive
    ? "bg-blue-100 border-blue-300 text-blue-800"
    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50";
  return `
    <button data-category1="${category1}" data-category2="${category2}" class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors ${activeClass}">
      ${category2}
    </button>
  `;
}

export const productListLoadingLayout = `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm sticky top-0 z-40">
        <div class="max-w-md mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <h1 class="text-xl font-bold text-gray-900">
              <a href="/" data-link="">쇼핑몰</a>
            </h1>
            <div class="flex items-center space-x-2">
              <!-- 장바구니 아이콘 -->
              <button id="cart-icon-btn" class="relative p-2 text-gray-700 hover:text-gray-900 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main class="max-w-md mx-auto px-4 py-4">
        <!-- 검색 및 필터 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <!-- 검색창 -->
          <div class="mb-4">
            <div class="relative">
              <input type="text" id="search-input" placeholder="상품명을 검색해보세요..." value="" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          <!-- 필터 옵션 -->
          <div class="space-y-3">
            <!-- 카테고리 필터 -->
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <label class="text-sm text-gray-600">카테고리:</label>
                <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
              </div>
              <!-- 1depth 카테고리 -->
              <div class="flex flex-wrap gap-2">
                <div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>
              </div>
              <!-- 2depth 카테고리 -->
            </div>
            <!-- 기존 필터들 -->
            <div class="flex gap-2 items-center justify-between">
              <!-- 페이지당 상품 수 -->
              <div class="flex items-center gap-2">
                <label class="text-sm text-gray-600">개수:</label>
                <select id="limit-select"
                        class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                  <option value="10">
                    10개
                  </option>
                  <option value="20" selected="">
                    20개
                  </option>
                  <option value="50">
                    50개
                  </option>
                  <option value="100">
                    100개
                  </option>
                </select>
              </div>
              <!-- 정렬 -->
              <div class="flex items-center gap-2">
                <label class="text-sm text-gray-600">정렬:</label>
                <select id="sort-select" class="text-sm border border-gray-300 rounded px-2 py-1
                             focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                  <option value="price_asc" selected="">가격 낮은순</option>
                  <option value="price_desc">가격 높은순</option>
                  <option value="name_asc">이름순</option>
                  <option value="name_desc">이름 역순</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <!-- 상품 목록 -->
        <div class="mb-6">
          <div>
            <!-- 상품 그리드 -->
            <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
              <!-- 로딩 스켈레톤 -->
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                <div class="aspect-square bg-gray-200"></div>
                <div class="p-3">
                  <div class="h-4 bg-gray-200 rounded mb-2"></div>
                  <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div class="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                <div class="aspect-square bg-gray-200"></div>
                <div class="p-3">
                  <div class="h-4 bg-gray-200 rounded mb-2"></div>
                  <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div class="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                <div class="aspect-square bg-gray-200"></div>
                <div class="p-3">
                  <div class="h-4 bg-gray-200 rounded mb-2"></div>
                  <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div class="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                <div class="aspect-square bg-gray-200"></div>
                <div class="p-3">
                  <div class="h-4 bg-gray-200 rounded mb-2"></div>
                  <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div class="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            
            <div class="text-center py-4">
              <div class="inline-flex items-center">
                <svg class="animate-spin h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-sm text-gray-600">상품을 불러오는 중...</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer class="bg-white shadow-sm sticky top-0 z-40">
        <div class="max-w-md mx-auto py-8 text-center text-gray-500">
          <p>© 2025 항해플러스 프론트엔드 쇼핑몰</p>
        </div>
      </footer>
    </div>
  `;

function updateURLParams(params) {
  const searchParams = new URLSearchParams();
  if (params.limit && params.limit !== 20) {
    searchParams.set("limit", params.limit.toString());
  }
  if (params.search) {
    searchParams.set("search", params.search);
  }
  if (params.category1) {
    searchParams.set("category1", params.category1);
  }
  if (params.category2) {
    searchParams.set("category2", params.category2);
  }
  if (params.sort && params.sort !== "price_asc") {
    searchParams.set("sort", params.sort);
  }

  const newURL = searchParams.toString()
    ? `${window.location.pathname}?${searchParams.toString()}`
    : window.location.pathname;
  window.history.pushState({}, "", newURL);
}

function updateProductList(params) {
  updateURLParams(params);
  renderProductList(params, true);
}

let infiniteScrollState = {
  currentPage: 1,
  isLoading: false,
  hasMore: false,
  params: null,
};

function createSkeletonCards(count = 4) {
  return Array(count)
    .fill(0)
    .map(
      () => `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div class="aspect-square bg-gray-200"></div>
      <div class="p-3">
        <div class="h-4 bg-gray-200 rounded mb-2"></div>
        <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div class="h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  `,
    )
    .join("");
}

function createLoadingIndicator() {
  return `
    <div class="text-center py-4">
      <div class="inline-flex items-center">
        <svg class="animate-spin h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-sm text-gray-600">상품을 불러오는 중...</span>
      </div>
    </div>
  `;
}

async function loadNextPage() {
  if (infiniteScrollState.isLoading || !infiniteScrollState.hasMore || !infiniteScrollState.params) {
    return;
  }

  const { params, currentPage } = infiniteScrollState;
  const nextPage = currentPage + 1;

  infiniteScrollState.isLoading = true;

  const productsGrid = document.getElementById("products-grid");
  if (!productsGrid) {
    infiniteScrollState.isLoading = false;
    return;
  }

  const existingMessage = productsGrid.parentElement.querySelector(".text-center.py-4.text-sm.text-gray-500");
  if (existingMessage) {
    existingMessage.remove();
  }

  const loadingIndicator = document.createElement("div");
  loadingIndicator.innerHTML = createLoadingIndicator();
  productsGrid.parentElement.appendChild(loadingIndicator);

  const skeletonContainer = document.createElement("div");
  skeletonContainer.className = "grid grid-cols-2 gap-4 mb-6";
  skeletonContainer.innerHTML = createSkeletonCards(4);
  productsGrid.parentElement.appendChild(skeletonContainer);

  try {
    const productsResponse = await getProducts({
      ...params,
      page: nextPage,
    });

    const { products = [], pagination = {} } = productsResponse;

    skeletonContainer.remove();
    loadingIndicator.remove();

    if (products.length > 0) {
      productsGrid.innerHTML += products.map((product) => createProductCard(product)).join("");
      infiniteScrollState.currentPage = nextPage;
      infiniteScrollState.hasMore = pagination.hasNext || false;

      if (!infiniteScrollState.hasMore) {
        const endMessage = document.createElement("div");
        endMessage.className = "text-center py-4 text-sm text-gray-500";
        endMessage.textContent = "모든 상품을 확인했습니다";
        productsGrid.parentElement.appendChild(endMessage);
      }
    } else {
      infiniteScrollState.hasMore = false;
      const endMessage = document.createElement("div");
      endMessage.className = "text-center py-4 text-sm text-gray-500";
      endMessage.textContent = "모든 상품을 확인했습니다";
      productsGrid.parentElement.appendChild(endMessage);
    }
  } catch (error) {
    console.error("다음 페이지 로드 실패:", error);
    skeletonContainer.remove();
    loadingIndicator.remove();
  } finally {
    infiniteScrollState.isLoading = false;
  }
}

function handleScroll() {
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const clientHeight = document.documentElement.clientHeight;

  if (scrollHeight - scrollTop - clientHeight < 100) {
    loadNextPage();
  }
}

function removeScrollListener() {
  window.removeEventListener("scroll", handleScroll);
}

function addScrollListener() {
  window.addEventListener("scroll", handleScroll, { passive: true });
}

let cartIconClickHandlerSetup = false;
function setupCartIconClick() {
  if (cartIconClickHandlerSetup) {
    return;
  }
  cartIconClickHandlerSetup = true;

  document.addEventListener("click", (e) => {
    const cartIconBtn = e.target.closest("#cart-icon-btn");
    if (cartIconBtn) {
      e.preventDefault();
      openCartModal();
    }
  });
}

let cartButtonHandlerSetup = false;
function setupCartButtons() {
  if (cartButtonHandlerSetup) {
    return;
  }
  cartButtonHandlerSetup = true;

  document.addEventListener("click", async (e) => {
    const addToCartBtn = e.target.closest(".add-to-cart-btn");
    if (addToCartBtn) {
      e.preventDefault();
      e.stopPropagation();
      const productId = addToCartBtn.getAttribute("data-product-id");
      if (productId) {
        try {
          const product = await getProduct(productId);

          addToCart(productId, {
            title: product.title,
            image: product.image,
            lprice: product.lprice,
            brand: product.brand,
          });

          showToast("success", "장바구니에 추가되었습니다");
        } catch (error) {
          console.error("장바구니 추가 실패:", error);
          showToast("error", "상품을 장바구니에 추가하는 중 오류가 발생했습니다.");
        }
      }
    }
  });
}

let categoryFilterHandlerSetup = false;
function setupCategoryFilters() {
  if (categoryFilterHandlerSetup) {
    return;
  }
  categoryFilterHandlerSetup = true;

  document.addEventListener("click", (e) => {
    const category1Btn = e.target.closest(".category1-filter-btn");
    if (category1Btn) {
      e.preventDefault();
      const category1 = category1Btn.getAttribute("data-category1");
      if (category1) {
        updateProductList({ limit: 20, search: "", category1, category2: "", sort: "price_asc" });
      }
      return;
    }

    const category2Btn = e.target.closest(".category2-filter-btn");
    if (category2Btn) {
      e.preventDefault();
      const category1 = category2Btn.getAttribute("data-category1");
      const category2 = category2Btn.getAttribute("data-category2");
      if (category1 && category2) {
        updateProductList({ limit: 20, search: "", category1, category2, sort: "price_asc" });
      }
      return;
    }

    const breadcrumbCategory1Btn = e.target.closest("[data-breadcrumb='category1']");
    if (breadcrumbCategory1Btn) {
      e.preventDefault();
      const category1 = breadcrumbCategory1Btn.getAttribute("data-category1");
      if (category1) {
        const currentParams = getQueryParams();
        updateProductList({
          limit: currentParams.limit || 20,
          search: currentParams.search || "",
          category1,
          category2: "",
          sort: currentParams.sort || "price_asc",
        });
      }
      return;
    }

    const resetBtn = e.target.closest("[data-breadcrumb='reset']");
    if (resetBtn) {
      e.preventDefault();
      updateProductList({ limit: 20, search: "", category1: "", category2: "", sort: "price_asc" });
      return;
    }
  });
}

function setupBreadcrumb(category1, category2) {
  const categoryFilterSection = document.querySelector(".space-y-2");
  if (!categoryFilterSection) return;

  const labelContainer = categoryFilterSection.querySelector(".flex.items-center.gap-2");
  if (!labelContainer) return;

  const resetButton = labelContainer.querySelector("[data-breadcrumb='reset']");

  if (category1 || category2) {
    let breadcrumbHTML = `<button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>`;

    if (category1) {
      breadcrumbHTML += `<span class="text-xs text-gray-500">&gt;</span>`;
      breadcrumbHTML += `<button data-breadcrumb="category1" data-category1="${category1}" class="text-xs hover:text-blue-800 hover:underline">${category1}</button>`;
    }

    if (category2) {
      breadcrumbHTML += `<span class="text-xs text-gray-500">&gt;</span>`;
      breadcrumbHTML += `<span class="text-xs text-gray-600 cursor-default">${category2}</span>`;
    }

    if (resetButton) {
      resetButton.outerHTML = breadcrumbHTML;
    } else {
      labelContainer.insertAdjacentHTML("beforeend", breadcrumbHTML);
    }
  } else {
    if (resetButton) {
      return;
    } else {
      labelContainer.insertAdjacentHTML(
        "beforeend",
        `<button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>`,
      );
    }
  }
}

let productClickHandlerSetup = false;
function setupProductClickHandlers() {
  if (productClickHandlerSetup) {
    return;
  }
  productClickHandlerSetup = true;

  document.addEventListener("click", (e) => {
    if (e.target.closest(".add-to-cart-btn")) {
      return;
    }

    const productImage = e.target.closest(".product-image");
    const productInfo = e.target.closest(".product-info");
    const productCard = e.target.closest(".product-card");

    if (productImage || productInfo || productCard) {
      const card = productCard || e.target.closest("[data-product-id]");
      if (card) {
        const productId = card.getAttribute("data-product-id");
        if (productId) {
          const router = window.__router__;
          if (router) {
            router.navigate(`/product/${productId}`);
          } else {
            window.location.href = `/product/${productId}`;
          }
        }
      }
    }
  });
}

export async function renderProductList(params = {}, isInitialLoad = true) {
  const { limit = 20, search = "", category1 = "", category2 = "", sort = "price_asc" } = params;

  if (isInitialLoad) {
    removeScrollListener();

    const root = document.getElementById("root") || document.body;
    root.innerHTML = productListLoadingLayout;

    infiniteScrollState = {
      currentPage: 1,
      isLoading: false,
      hasMore: false,
      params: { limit, search, category1, category2, sort },
    };
  }

  try {
    const [productsResponse, categoriesResponse] = await Promise.all([
      getProducts({
        limit,
        search,
        category1,
        category2,
        sort,
        page: isInitialLoad ? 1 : infiniteScrollState.currentPage,
      }),
      getCategories(),
    ]);

    const { products = [], pagination = {} } = productsResponse;
    const totalCount = pagination.total || 0;
    const categories = categoriesResponse || {};

    infiniteScrollState.hasMore = pagination.hasNext || false;
    if (isInitialLoad) {
      infiniteScrollState.currentPage = 1;
    }

    if (isInitialLoad) {
      const category1Container = document.querySelector(".space-y-2 .flex.flex-wrap.gap-2");
      if (category1Container) {
        const category1List = Object.keys(categories);
        if (category1List.length > 0) {
          category1Container.innerHTML = category1List
            .map((cat1) => {
              const isActive = cat1 === category1;
              const activeClass = isActive
                ? "bg-blue-100 border-blue-300 text-blue-800"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50";
              return `
                <button data-category1="${cat1}" class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors ${activeClass}">
                  ${cat1}
                </button>
              `;
            })
            .join("");
        }
      }

      if (category1 && categories[category1]) {
        const category2Container = category1Container?.nextElementSibling;
        if (
          category2Container &&
          category2Container.classList.contains("flex") &&
          category2Container.classList.contains("flex-wrap")
        ) {
          const category2List = Object.keys(categories[category1]);
          if (category2List.length > 0) {
            category2Container.innerHTML = category2List
              .map((cat2) => createCategory2Button(category1, cat2, cat2 === category2))
              .join("");
          }
        } else {
          const category2Container = document.createElement("div");
          category2Container.className = "flex flex-wrap gap-2 mt-2";
          const category2List = Object.keys(categories[category1]);
          if (category2List.length > 0) {
            category2Container.innerHTML = category2List
              .map((cat2) => createCategory2Button(category1, cat2, cat2 === category2))
              .join("");
            if (category1Container && category1Container.parentElement) {
              category1Container.parentElement.insertBefore(category2Container, category1Container.nextSibling);
            }
          }
        }
      } else {
        const category2Container = category1Container?.nextElementSibling;
        if (
          category2Container &&
          category2Container.classList.contains("flex") &&
          category2Container.classList.contains("flex-wrap")
        ) {
          category2Container.remove();
        }
      }
    }

    const productsGrid = document.getElementById("products-grid");
    if (productsGrid) {
      if (products.length > 0) {
        if (isInitialLoad) {
          productsGrid.innerHTML = products.map((product) => createProductCard(product)).join("");
        } else {
          productsGrid.innerHTML += products.map((product) => createProductCard(product)).join("");
        }

        const productListContainer = productsGrid.closest(".mb-6 > div");
        if (productListContainer) {
          let countInfo = productListContainer.querySelector(".mb-4.text-sm.text-gray-600");
          if (!countInfo) {
            countInfo = document.createElement("div");
            countInfo.className = "mb-4 text-sm text-gray-600";
            productListContainer.insertBefore(countInfo, productsGrid);
          }
          countInfo.innerHTML = `총 <span class="font-medium text-gray-900">${totalCount}개</span>의 상품`;

          if (isInitialLoad) {
            const loadingIndicator = productListContainer.querySelector(".text-center.py-4");
            if (loadingIndicator) {
              loadingIndicator.remove();
            }

            addScrollListener();
          }
        }
      } else {
        if (isInitialLoad) {
          productsGrid.innerHTML = `
            <div class="col-span-2 text-center py-8 text-gray-500">
              상품이 없습니다.
            </div>
          `;
        }
      }
    }

    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.value = search;

      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const searchTerm = searchInput.value.trim();
          updateProductList({ ...params, search: searchTerm });
        }
      });
    }

    const limitSelect = document.getElementById("limit-select");
    if (limitSelect) {
      limitSelect.value = limit.toString();
      limitSelect.addEventListener("change", (e) => {
        const newLimit = parseInt(e.target.value);
        updateProductList({ ...params, limit: newLimit });
      });
    }

    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) {
      sortSelect.value = sort;
      sortSelect.addEventListener("change", (e) => {
        const newSort = e.target.value;
        updateProductList({ ...params, sort: newSort });
      });
    }

    setupCategoryFilters();

    setupBreadcrumb(category1, category2);

    setupCartButtons();

    setupCartIconClick();

    setupProductClickHandlers();

    updateCartIcon();
  } catch (error) {
    console.error("상품 목록 로드 실패:", error);
    const productsGrid = document.getElementById("products-grid");
    if (productsGrid) {
      productsGrid.innerHTML = `
        <div class="col-span-2 text-center py-8">
          <p class="text-red-600 mb-4">상품을 불러오는 중 오류가 발생했습니다.</p>
          <button id="retry-btn" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            다시 시도
          </button>
        </div>
      `;

      const retryBtn = document.getElementById("retry-btn");
      if (retryBtn) {
        retryBtn.addEventListener("click", () => {
          renderProductList(params);
        });
      }
    }
  }
}

export const productListLoadedLayout = `
    <div class="bg-gray-50">
      <header class="bg-white shadow-sm sticky top-0 z-40">
        <div class="max-w-md mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <h1 class="text-xl font-bold text-gray-900">
              <a href="/" data-link="">쇼핑몰</a>
            </h1>
            <div class="flex items-center space-x-2">
              <!-- 장바구니 아이콘 -->
              <button id="cart-icon-btn" class="relative p-2 text-gray-700 hover:text-gray-900 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
                </svg>
                <span
                  class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">4</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main class="max-w-md mx-auto px-4 py-4">
        <!-- 검색 및 필터 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <!-- 검색창 -->
          <div class="mb-4">
            <div class="relative">
              <input type="text" id="search-input" placeholder="상품명을 검색해보세요..." value="" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          <!-- 필터 옵션 -->
          <div class="space-y-3">
            <!-- 카테고리 필터 -->
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <label class="text-sm text-gray-600">카테고리:</label>
                <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
              </div>
              <!-- 1depth 카테고리 -->
              <div class="flex flex-wrap gap-2">
                <button data-category1="생활/건강" class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
                   bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  생활/건강
                </button>
                <button data-category1="디지털/가전" class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
                   bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  디지털/가전
                </button>
              </div>
              <!-- 2depth 카테고리 -->
            </div>
            <!-- 기존 필터들 -->
            <div class="flex gap-2 items-center justify-between">
              <!-- 페이지당 상품 수 -->
              <div class="flex items-center gap-2">
                <label class="text-sm text-gray-600">개수:</label>
                <select id="limit-select"
                        class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                  <option value="10">
                    10개
                  </option>
                  <option value="20" selected="">
                    20개
                  </option>
                  <option value="50">
                    50개
                  </option>
                  <option value="100">
                    100개
                  </option>
                </select>
              </div>
              <!-- 정렬 -->
              <div class="flex items-center gap-2">
                <label class="text-sm text-gray-600">정렬:</label>
                <select id="sort-select" class="text-sm border border-gray-300 rounded px-2 py-1
                             focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                  <option value="price_asc" selected="">가격 낮은순</option>
                  <option value="price_desc">가격 높은순</option>
                  <option value="name_asc">이름순</option>
                  <option value="name_desc">이름 역순</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <!-- 상품 목록 -->
        <div class="mb-6">
          <div>
            <!-- 상품 개수 정보 -->
            <div class="mb-4 text-sm text-gray-600">
              총 <span class="font-medium text-gray-900">340개</span>의 상품
            </div>
            <!-- 상품 그리드 -->
            <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden product-card"
                   data-product-id="85067212996">
                <!-- 상품 이미지 -->
                <div class="aspect-square bg-gray-100 overflow-hidden cursor-pointer product-image">
                  <img src="https://shopping-phinf.pstatic.net/main_8506721/85067212996.1.jpg"
                       alt="PVC 투명 젤리 쇼핑백 1호 와인 답례품 구디백 비닐 손잡이 미니 간식 선물포장"
                       class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                       loading="lazy">
                </div>
                <!-- 상품 정보 -->
                <div class="p-3">
                  <div class="cursor-pointer product-info mb-3">
                    <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                      PVC 투명 젤리 쇼핑백 1호 와인 답례품 구디백 비닐 손잡이 미니 간식 선물포장
                    </h3>
                    <p class="text-xs text-gray-500 mb-2"></p>
                    <p class="text-lg font-bold text-gray-900">
                      220원
                    </p>
                  </div>
                  <!-- 장바구니 버튼 -->
                  <button class="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md
                         hover:bg-blue-700 transition-colors add-to-cart-btn" data-product-id="85067212996">
                    장바구니 담기
                  </button>
                </div>
              </div>
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden product-card"
                   data-product-id="86940857379">
                <!-- 상품 이미지 -->
                <div class="aspect-square bg-gray-100 overflow-hidden cursor-pointer product-image">
                  <img src="https://shopping-phinf.pstatic.net/main_8694085/86940857379.1.jpg"
                       alt="샷시 풍지판 창문 바람막이 베란다 문 틈막이 창틀 벌레 차단 샤시 방충망 틈새막이"
                       class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                       loading="lazy">
                </div>
                <!-- 상품 정보 -->
                <div class="p-3">
                  <div class="cursor-pointer product-info mb-3">
                    <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                      샷시 풍지판 창문 바람막이 베란다 문 틈막이 창틀 벌레 차단 샤시 방충망 틈새막이
                    </h3>
                    <p class="text-xs text-gray-500 mb-2">이지웨이건축자재</p>
                    <p class="text-lg font-bold text-gray-900">
                      230원
                    </p>
                  </div>
                  <!-- 장바구니 버튼 -->
                  <button class="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md
                         hover:bg-blue-700 transition-colors add-to-cart-btn" data-product-id="86940857379">
                    장바구니 담기
                  </button>
                </div>
              </div>
            </div>
            
            <div class="text-center py-4 text-sm text-gray-500">
              모든 상품을 확인했습니다
            </div>
          </div>
        </div>
      </main>
      <footer class="bg-white shadow-sm sticky top-0 z-40">
        <div class="max-w-md mx-auto py-8 text-center text-gray-500">
          <p>© 2025 항해플러스 프론트엔드 쇼핑몰</p>
        </div>
      </footer>
    </div>
  `;

export const productListCategoryDepth1Layout = `
    <main class="max-w-md mx-auto px-4 py-4">
      <!-- 검색 및 필터 -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <!-- 검색창 -->
        <div class="mb-4">
          <div class="relative">
            <input type="text" id="search-input" placeholder="상품명을 검색해보세요..." value="" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <!-- 필터 옵션 -->
        <div class="space-y-3">

          <!-- 카테고리 필터 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">카테고리:</label>
              <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button><span class="text-xs text-gray-500">&gt;</span><button data-breadcrumb="category1" data-category1="생활/건강" class="text-xs hover:text-blue-800 hover:underline">생활/건강</button>
            </div>
            <div class="space-y-2">
              <div class="flex flex-wrap gap-2">
                <button data-category1="생활/건강" data-category2="생활용품" class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  생활용품
                </button>
                <button data-category1="생활/건강" data-category2="주방용품" class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  주방용품
                </button>
                <button data-category1="생활/건강" data-category2="문구/사무용품" class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  문구/사무용품
                </button>
              </div>
            </div>
          </div>
          
          <!-- 기존 필터들 -->
          <div class="flex gap-2 items-center justify-between">
            <!-- 페이지당 상품 수 -->
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">개수:</label>
              <select id="limit-select"
                      class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="10">
                  10개
                </option>
                <option value="20" selected="">
                  20개
                </option>
                <option value="50">
                  50개
                </option>
                <option value="100">
                  100개
                </option>
              </select>
            </div>
            <!-- 정렬 -->
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">정렬:</label>
              <select id="sort-select" class="text-sm border border-gray-300 rounded px-2 py-1
                           focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="price_asc" selected="">가격 낮은순</option>
                <option value="price_desc">가격 높은순</option>
                <option value="name_asc">이름순</option>
                <option value="name_desc">이름 역순</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </main>
  `;

export const productListCategoryDepth2Layout = `
    <main class="max-w-md mx-auto px-4 py-4">
      <!-- 검색 및 필터 -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <!-- 검색창 -->
        <div class="mb-4">
          <div class="relative">
            <input type="text" id="search-input" placeholder="상품명을 검색해보세요..." value="" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <!-- 필터 옵션 -->
        <div class="space-y-3">

          <!-- 카테고리 필터 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">카테고리:</label>
              <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button><span class="text-xs text-gray-500">&gt;</span><button data-breadcrumb="category1" data-category1="생활/건강" class="text-xs hover:text-blue-800 hover:underline">생활/건강</button><span class="text-xs text-gray-500">&gt;</span><span class="text-xs text-gray-600 cursor-default">주방용품</span>
            </div>
            <div class="space-y-2">
              <div class="flex flex-wrap gap-2">
                <button data-category1="생활/건강" data-category2="생활용품" class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  생활용품
                </button>
                <button data-category1="생활/건강" data-category2="주방용품" class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-blue-100 border-blue-300 text-blue-800">
                  주방용품
                </button>
                <button data-category1="생활/건강" data-category2="문구/사무용품" class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  문구/사무용품
                </button>
              </div>
            </div>
          </div>
          
          <!-- 기존 필터들 -->
          <div class="flex gap-2 items-center justify-between">
            <!-- 페이지당 상품 수 -->
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">개수:</label>
              <select id="limit-select"
                      class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="10">
                  10개
                </option>
                <option value="20" selected="">
                  20개
                </option>
                <option value="50">
                  50개
                </option>
                <option value="100">
                  100개
                </option>
              </select>
            </div>
            <!-- 정렬 -->
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">정렬:</label>
              <select id="sort-select" class="text-sm border border-gray-300 rounded px-2 py-1
                           focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="price_asc" selected="">가격 낮은순</option>
                <option value="price_desc">가격 높은순</option>
                <option value="name_asc">이름순</option>
                <option value="name_desc">이름 역순</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </main>
  `;
