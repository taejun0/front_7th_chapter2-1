import { getCart, removeFromCart, updateCartQuantity, clearCart } from "../app/services/cartService.js";
import { updateCartIcon } from "../app/services/cartService.js";
import { showToast } from "../components/toast.js";

function createCartItemCard(productId, item) {
  const { quantity, productData } = item;
  const price = parseInt(productData?.lprice || 0);
  const totalPrice = price * quantity;

  return `
    <div class="flex items-center py-3 border-b border-gray-100 cart-item" data-product-id="${productId}">
      <!-- 선택 체크박스 -->
      <label class="flex items-center mr-3">
        <input type="checkbox" class="cart-item-checkbox w-4 h-4 text-blue-600 border-gray-300 rounded 
          focus:ring-blue-500" data-product-id="${productId}">
      </label>
      <!-- 상품 이미지 -->
      <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
        <img src="${productData?.image || ""}" alt="${productData?.title || ""}" class="w-full h-full object-cover cursor-pointer cart-item-image" data-product-id="${productId}">
      </div>
      <!-- 상품 정보 -->
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-medium text-gray-900 truncate cursor-pointer cart-item-title" data-product-id="${productId}">
          ${productData?.title || ""}
        </h4>
        <p class="text-sm text-gray-600 mt-1">
          ${price.toLocaleString()}원
        </p>
        <!-- 수량 조절 -->
        <div class="flex items-center mt-2">
          <button class="quantity-decrease-btn w-7 h-7 flex items-center justify-center 
            border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100" data-product-id="${productId}">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
            </svg>
          </button>
          <input type="number" value="${quantity}" min="1" class="quantity-input w-12 h-7 text-center text-sm border-t border-b 
            border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500" data-product-id="${productId}" readonly>
          <button class="quantity-increase-btn w-7 h-7 flex items-center justify-center 
            border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100" data-product-id="${productId}">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>
      </div>
      <!-- 가격 및 삭제 -->
      <div class="text-right ml-3">
        <p class="text-sm font-medium text-gray-900">
          ${totalPrice.toLocaleString()}원
        </p>
        <button class="cart-item-remove-btn mt-1 text-xs text-red-600 hover:text-red-800" data-product-id="${productId}">
          삭제
        </button>
      </div>
    </div>
  `;
}

export function renderCartModal() {
  const cart = getCart();
  const cartItems = Object.entries(cart);
  const totalCount = cartItems.reduce((sum, [, item]) => sum + item.quantity, 0);

  const root = document.getElementById("root") || document.body;

  const existingModal = root.querySelector(".cart-modal");
  if (existingModal) {
    existingModal.remove();
  }

  const modalOverlay = document.createElement("div");
  modalOverlay.className = "fixed inset-0 z-50 overflow-y-auto cart-modal";
  root.appendChild(modalOverlay);
  let modalHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity cart-modal-overlay"></div>
    <div class="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
      <div class="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden">
        <!-- 헤더 -->
        <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
            </svg>
            장바구니
            ${totalCount > 0 ? `<span class="text-sm font-normal text-gray-600 ml-1">(${totalCount})</span>` : ""}
          </h2>
          <button id="cart-modal-close-btn" class="text-gray-400 hover:text-gray-600 p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <!-- 컨텐츠 -->
        <div class="flex flex-col max-h-[calc(90vh-120px)]">
  `;

  if (cartItems.length === 0) {
    modalHTML += `
          <div class="flex-1 flex items-center justify-center p-8">
            <div class="text-center">
              <div class="text-gray-400 mb-4">
                <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">장바구니가 비어있습니다</h3>
              <p class="text-gray-600">원하는 상품을 담아보세요!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
  } else {
    const totalPrice = cartItems.reduce((sum, [, item]) => {
      const price = parseInt(item.productData?.lprice || 0);
      return sum + price * item.quantity;
    }, 0);

    modalHTML += `
          <!-- 전체 선택 섹션 -->
          <div class="p-4 border-b border-gray-200 bg-gray-50">
            <label class="flex items-center text-sm text-gray-700">
              <input type="checkbox" id="cart-modal-select-all-checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2">
              전체선택 (${totalCount}개)
            </label>
          </div>
          <!-- 아이템 목록 -->
          <div class="flex-1 overflow-y-auto">
            <div class="p-4 space-y-4">
              ${cartItems.map(([productId, item]) => createCartItemCard(productId, item)).join("")}
            </div>
          </div>
        </div>
        <!-- 하단 액션 -->
        <div class="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <!-- 선택된 아이템 정보 (선택된 항목이 있을 때만 표시) -->
          <div id="selected-items-info" class="flex justify-between items-center mb-3 text-sm" style="display: none;">
            <span class="text-gray-600">선택한 상품 (<span id="selected-count">0</span>개)</span>
            <span class="font-medium" id="selected-price">0원</span>
          </div>
          <!-- 총 금액 -->
          <div class="flex justify-between items-center mb-4">
            <span class="text-lg font-bold text-gray-900">총 금액</span>
            <span class="text-xl font-bold text-blue-600" id="cart-total-price">${totalPrice.toLocaleString()}원</span>
          </div>
          <!-- 액션 버튼들 -->
          <div class="space-y-2">
            <button id="cart-modal-remove-selected-btn" class="w-full bg-red-600 text-white py-2 px-4 rounded-md 
              hover:bg-red-700 transition-colors text-sm" style="display: none;">
              선택한 상품 삭제 (<span id="remove-selected-count">0</span>개)
            </button>
            <div class="flex gap-2">
              <button id="cart-modal-clear-cart-btn" class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md 
                hover:bg-gray-700 transition-colors text-sm">
                전체 비우기
              </button>
              <button id="cart-modal-checkout-btn" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md 
                hover:bg-blue-700 transition-colors text-sm">
                구매하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
  }

  modalOverlay.innerHTML = modalHTML;

  setupCartModalEvents();
}

function updateCartItemInModal(productId) {
  const modal = document.querySelector(".cart-modal");
  if (!modal) return;

  const cart = getCart();
  const item = cart[productId];

  if (!item) {
    const cartItem = modal.querySelector(`.cart-item[data-product-id="${productId}"]`);
    if (cartItem) {
      cartItem.remove();
    }
    updateCartTotalPrice();
    updateSelectedInfo();
    return;
  }

  const cartItem = modal.querySelector(`.cart-item[data-product-id="${productId}"]`);
  if (cartItem) {
    const { quantity, productData } = item;
    const price = parseInt(productData?.lprice || 0);
    const totalPrice = price * quantity;

    const quantityInput = cartItem.querySelector(`.quantity-input[data-product-id="${productId}"]`);
    if (quantityInput) {
      quantityInput.value = quantity;
    }

    const priceContainer = cartItem.querySelector(".text-right.ml-3");
    if (priceContainer) {
      const totalPriceElement = priceContainer.querySelector("p.text-sm.font-medium.text-gray-900");
      if (totalPriceElement) {
        totalPriceElement.textContent = `${totalPrice.toLocaleString()}원`;
      }
    }
  }

  updateCartTotalPrice();
  updateSelectedInfo();
}

function updateCartTotalPrice() {
  const modal = document.querySelector(".cart-modal");
  if (!modal) return;

  const cart = getCart();
  const cartItems = Object.entries(cart);
  const totalPrice = cartItems.reduce((sum, [, item]) => {
    const price = parseInt(item.productData?.lprice || 0);
    return sum + price * item.quantity;
  }, 0);

  const totalPriceElement = modal.querySelector("#cart-total-price");
  if (totalPriceElement) {
    totalPriceElement.textContent = `${totalPrice.toLocaleString()}원`;
  }

  const totalCount = cartItems.reduce((sum, [, item]) => sum + item.quantity, 0);
  const headerCount = modal.querySelector("h2 span");
  if (headerCount) {
    headerCount.textContent = `(${totalCount})`;
  } else if (totalCount > 0) {
    const h2 = modal.querySelector("h2");
    if (h2) {
      const span = document.createElement("span");
      span.className = "text-sm font-normal text-gray-600 ml-1";
      span.textContent = `(${totalCount})`;
      h2.appendChild(span);
    }
  }

  const selectAllCheckbox = modal.querySelector("#cart-modal-select-all-checkbox");
  if (selectAllCheckbox) {
    const selectAllLabel = selectAllCheckbox.closest("label");
    if (selectAllLabel) {
      const labelText = selectAllLabel.textContent.trim();
      if (labelText.includes("전체선택")) {
        const textAfterCheckbox = selectAllCheckbox.nextSibling;
        if (textAfterCheckbox && textAfterCheckbox.nodeType === Node.TEXT_NODE) {
          textAfterCheckbox.textContent = ` 전체선택 (${totalCount}개)`;
        } else {
          const textNode = document.createTextNode(` 전체선택 (${totalCount}개)`);
          selectAllCheckbox.parentNode.insertBefore(textNode, selectAllCheckbox.nextSibling);
        }
      }
    }
  }
}

let cartModalEventsSetup = false;
function setupCartModalEvents() {
  if (cartModalEventsSetup) {
    return;
  }
  cartModalEventsSetup = true;

  document.addEventListener("click", (e) => {
    const modal = document.querySelector(".cart-modal");
    if (!modal || !modal.contains(e.target)) return;

    const decreaseBtn = e.target.closest(".quantity-decrease-btn");
    const increaseBtn = e.target.closest(".quantity-increase-btn");
    const removeBtn = e.target.closest(".cart-item-remove-btn");
    const itemImage = e.target.closest(".cart-item-image");
    const itemTitle = e.target.closest(".cart-item-title");
    const closeBtn = e.target.closest("#cart-modal-close-btn");
    const removeSelectedBtn = e.target.closest("#cart-modal-remove-selected-btn");
    const clearCartBtn = e.target.closest("#cart-modal-clear-cart-btn");

    if (closeBtn) {
      e.preventDefault();
      closeCartModal();
      return;
    }

    if (decreaseBtn) {
      e.preventDefault();
      const productId = decreaseBtn.getAttribute("data-product-id");
      const quantityInput = modal.querySelector(`.quantity-input[data-product-id="${productId}"]`);
      if (quantityInput) {
        const currentQuantity = parseInt(quantityInput.value) || 1;
        if (currentQuantity > 1) {
          updateCartQuantity(productId, currentQuantity - 1);
          updateCartItemInModal(productId);
        }
      }
      return;
    }

    if (increaseBtn) {
      e.preventDefault();
      const productId = increaseBtn.getAttribute("data-product-id");
      const quantityInput = modal.querySelector(`.quantity-input[data-product-id="${productId}"]`);
      if (quantityInput) {
        const currentQuantity = parseInt(quantityInput.value) || 1;
        updateCartQuantity(productId, currentQuantity + 1);
        updateCartItemInModal(productId);
      }
      return;
    }

    if (removeBtn) {
      e.preventDefault();
      const productId = removeBtn.getAttribute("data-product-id");
      removeFromCart(productId);
      showToast("info", "상품이 장바구니에서 삭제되었습니다");
      updateCartItemInModal(productId);
      updateCartIcon();

      const cart = getCart();
      if (Object.keys(cart).length === 0) {
        renderCartModal();
      }
      return;
    }

    if (removeSelectedBtn) {
      e.preventDefault();
      const selectedCheckboxes = modal.querySelectorAll(".cart-item-checkbox:checked");
      if (selectedCheckboxes.length === 0) {
        return;
      }

      selectedCheckboxes.forEach((checkbox) => {
        const productId = checkbox.getAttribute("data-product-id");
        removeFromCart(productId);
        updateCartItemInModal(productId);
      });

      showToast("info", "선택된 상품들이 삭제되었습니다");
      updateCartIcon();

      const cart = getCart();
      if (Object.keys(cart).length === 0) {
        renderCartModal();
      }
      return;
    }

    if (clearCartBtn) {
      e.preventDefault();
      clearCart();
      showToast("info", "장바구니가 비워졌습니다");
      renderCartModal();
      updateCartIcon();
      return;
    }

    if (itemImage || itemTitle) {
      e.preventDefault();
      const productId = (itemImage || itemTitle).getAttribute("data-product-id");
      if (productId) {
        const router = window.__router__;
        if (router) {
          closeCartModal();
          router.navigate(`/product/${productId}`);
        }
      }
      return;
    }
  });

  document.addEventListener("click", (e) => {
    const overlay = e.target.closest(".cart-modal-overlay");
    if (overlay && e.target === overlay) {
      closeCartModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const modal = document.querySelector(".cart-modal");
      if (modal) {
        closeCartModal();
      }
    }
  });

  document.addEventListener("change", (e) => {
    const modal = document.querySelector(".cart-modal");
    if (!modal || !modal.contains(e.target)) return;

    if (e.target.classList.contains("cart-item-checkbox")) {
      updateSelectAllCheckbox();
      updateSelectedInfo();
      return;
    }

    if (e.target.id === "cart-modal-select-all-checkbox") {
      const isChecked = e.target.checked;
      const itemCheckboxes = modal.querySelectorAll(".cart-item-checkbox");
      itemCheckboxes.forEach((checkbox) => {
        checkbox.checked = isChecked;
      });
      updateSelectedInfo();
    }
  });
}

function updateSelectedInfo() {
  const modal = document.querySelector(".cart-modal");
  if (!modal) return;

  const selectedCheckboxes = modal.querySelectorAll(".cart-item-checkbox:checked");
  const selectedCount = selectedCheckboxes.length;
  const selectedInfo = modal.querySelector("#selected-items-info");
  const removeSelectedBtn = modal.querySelector("#cart-modal-remove-selected-btn");

  if (selectedCount > 0) {
    let selectedPrice = 0;
    selectedCheckboxes.forEach((checkbox) => {
      const productId = checkbox.getAttribute("data-product-id");
      const cartItem = modal.querySelector(`.cart-item[data-product-id="${productId}"]`);
      if (cartItem) {
        const priceContainer = cartItem.querySelector(".text-right.ml-3");
        if (priceContainer) {
          const totalPriceElement = priceContainer.querySelector("p.text-sm.font-medium.text-gray-900");
          if (totalPriceElement) {
            const priceText = totalPriceElement.textContent;
            const price = parseInt(priceText.replace(/[^0-9]/g, "")) || 0;
            selectedPrice += price;
          }
        }
      }
    });

    if (selectedInfo) {
      selectedInfo.style.display = "flex";
      const selectedCountSpan = selectedInfo.querySelector("#selected-count");
      const selectedPriceSpan = selectedInfo.querySelector("#selected-price");
      if (selectedCountSpan) selectedCountSpan.textContent = selectedCount;
      if (selectedPriceSpan) selectedPriceSpan.textContent = `${selectedPrice.toLocaleString()}원`;
    }

    if (removeSelectedBtn) {
      removeSelectedBtn.style.display = "block";
      const removeCountSpan = removeSelectedBtn.querySelector("#remove-selected-count");
      if (removeCountSpan) removeCountSpan.textContent = selectedCount;
    }
  } else {
    if (selectedInfo) selectedInfo.style.display = "none";
    if (removeSelectedBtn) removeSelectedBtn.style.display = "none";
  }
}

function updateSelectAllCheckbox() {
  const modal = document.querySelector(".cart-modal");
  if (!modal) return;

  const selectAllCheckbox = modal.querySelector("#cart-modal-select-all-checkbox");
  const itemCheckboxes = modal.querySelectorAll(".cart-item-checkbox");
  if (selectAllCheckbox && itemCheckboxes.length > 0) {
    const allChecked = Array.from(itemCheckboxes).every((cb) => cb.checked);
    selectAllCheckbox.checked = allChecked;
  }
}

function closeCartModal() {
  const modal = document.querySelector(".cart-modal");
  if (modal) {
    modal.remove();
  }
}

export function openCartModal() {
  renderCartModal();
}

export const cartEmptyLayout = `
    <div class="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
      <div class="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden">
        <!-- 헤더 -->
        <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
            </svg>
            장바구니 
          </h2>
          
          <button id="cart-modal-close-btn" class="text-gray-400 hover:text-gray-600 p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- 컨텐츠 -->
        <div class="flex flex-col max-h-[calc(90vh-120px)]">
          <!-- 빈 장바구니 -->
          <div class="flex-1 flex items-center justify-center p-8">
            <div class="text-center">
              <div class="text-gray-400 mb-4">
                <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">장바구니가 비어있습니다</h3>
              <p class="text-gray-600">원하는 상품을 담아보세요!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

export const cartNoSelectionLayout = `
    <div class="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
      <div class="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden">
        <!-- 헤더 -->
        <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
            </svg>
            장바구니
            <span class="text-sm font-normal text-gray-600 ml-1">(2)</span>
          </h2>
          <button id="cart-modal-close-btn" class="text-gray-400 hover:text-gray-600 p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <!-- 컨텐츠 -->
        <div class="flex flex-col max-h-[calc(90vh-120px)]">
          <!-- 전체 선택 섹션 -->
          <div class="p-4 border-b border-gray-200 bg-gray-50">
            <label class="flex items-center text-sm text-gray-700">
              <input type="checkbox" id="cart-modal-select-all-checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2">
              전체선택 (2개)
            </label>
          </div>
          <!-- 아이템 목록 -->
          <div class="flex-1 overflow-y-auto">
            <div class="p-4 space-y-4">
              <div class="flex items-center py-3 border-b border-gray-100 cart-item" data-product-id="85067212996">
                <!-- 선택 체크박스 -->
                <label class="flex items-center mr-3">
                  <input type="checkbox" class="cart-item-checkbox w-4 h-4 text-blue-600 border-gray-300 rounded 
                focus:ring-blue-500" data-product-id="85067212996">
                </label>
                <!-- 상품 이미지 -->
                <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                  <img src="https://shopping-phinf.pstatic.net/main_8506721/85067212996.1.jpg" alt="PVC 투명 젤리 쇼핑백 1호 와인 답례품 구디백 비닐 손잡이 미니 간식 선물포장" class="w-full h-full object-cover cursor-pointer cart-item-image" data-product-id="85067212996">
                </div>
                <!-- 상품 정보 -->
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium text-gray-900 truncate cursor-pointer cart-item-title" data-product-id="85067212996">
                    PVC 투명 젤리 쇼핑백 1호 와인 답례품 구디백 비닐 손잡이 미니 간식 선물포장
                  </h4>
                  <p class="text-sm text-gray-600 mt-1">
                    220원
                  </p>
                  <!-- 수량 조절 -->
                  <div class="flex items-center mt-2">
                    <button class="quantity-decrease-btn w-7 h-7 flex items-center justify-center 
                 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100" data-product-id="85067212996">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                      </svg>
                    </button>
                    <input type="number" value="2" min="1" class="quantity-input w-12 h-7 text-center text-sm border-t border-b 
                border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500" disabled="" data-product-id="85067212996">
                    <button class="quantity-increase-btn w-7 h-7 flex items-center justify-center 
                 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100" data-product-id="85067212996">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <!-- 가격 및 삭제 -->
                <div class="text-right ml-3">
                  <p class="text-sm font-medium text-gray-900">
                    440원
                  </p>
                  <button class="cart-item-remove-btn mt-1 text-xs text-red-600 hover:text-red-800" data-product-id="85067212996">
                    삭제
                  </button>
                </div>
              </div>
              <div class="flex items-center py-3 border-b border-gray-100 cart-item" data-product-id="86940857379">
                <!-- 선택 체크박스 -->
                <label class="flex items-center mr-3">
                  <input type="checkbox" class="cart-item-checkbox w-4 h-4 text-blue-600 border-gray-300 rounded 
                focus:ring-blue-500" data-product-id="86940857379">
                </label>
                <!-- 상품 이미지 -->
                <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                  <img src="https://shopping-phinf.pstatic.net/main_8694085/86940857379.1.jpg" alt="샷시 풍지판 창문 바람막이 베란다 문 틈막이 창틀 벌레 차단 샤시 방충망 틈새막이" class="w-full h-full object-cover cursor-pointer cart-item-image" data-product-id="86940857379">
                </div>
                <!-- 상품 정보 -->
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium text-gray-900 truncate cursor-pointer cart-item-title" data-product-id="86940857379">
                    샷시 풍지판 창문 바람막이 베란다 문 틈막이 창틀 벌레 차단 샤시 방충망 틈새막이
                  </h4>
                  <p class="text-sm text-gray-600 mt-1">
                    230원
                  </p>
                  <!-- 수량 조절 -->
                  <div class="flex items-center mt-2">
                    <button class="quantity-decrease-btn w-7 h-7 flex items-center justify-center 
                 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100" data-product-id="86940857379">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                      </svg>
                    </button>
                    <input type="number" value="1" min="1" class="quantity-input w-12 h-7 text-center text-sm border-t border-b 
                border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500" disabled="" data-product-id="86940857379">
                    <button class="quantity-increase-btn w-7 h-7 flex items-center justify-center 
                 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100" data-product-id="86940857379">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <!-- 가격 및 삭제 -->
                <div class="text-right ml-3">
                  <p class="text-sm font-medium text-gray-900">
                    230원
                  </p>
                  <button class="cart-item-remove-btn mt-1 text-xs text-red-600 hover:text-red-800" data-product-id="86940857379">
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 하단 액션 -->
        <div class="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <!-- 총 금액 -->
          <div class="flex justify-between items-center mb-4">
            <span class="text-lg font-bold text-gray-900">총 금액</span>
            <span class="text-xl font-bold text-blue-600">670원</span>
          </div>
          <!-- 액션 버튼들 -->
          <div class="space-y-2">
            <div class="flex gap-2">
              <button id="cart-modal-clear-cart-btn" class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md 
                       hover:bg-gray-700 transition-colors text-sm">
                전체 비우기
              </button>
              <button id="cart-modal-checkout-btn" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md 
                       hover:bg-blue-700 transition-colors text-sm">
                구매하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

export const cartWithSelectionLayout = `
    <div class="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
      <div class="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden">
        <!-- 헤더 -->
        <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
            </svg>
            장바구니
            <span class="text-sm font-normal text-gray-600 ml-1">(2)</span>
          </h2>
          <button id="cart-modal-close-btn" class="text-gray-400 hover:text-gray-600 p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <!-- 컨텐츠 -->
        <div class="flex flex-col max-h-[calc(90vh-120px)]">
          <!-- 전체 선택 섹션 -->
          <div class="p-4 border-b border-gray-200 bg-gray-50">
            <label class="flex items-center text-sm text-gray-700">
              <input type="checkbox" id="cart-modal-select-all-checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2">
              전체선택 (2개)
            </label>
          </div>
          <!-- 아이템 목록 -->
          <div class="flex-1 overflow-y-auto">
            <div class="p-4 space-y-4">
              <div class="flex items-center py-3 border-b border-gray-100 cart-item" data-product-id="85067212996">
                <!-- 선택 체크박스 -->
                <label class="flex items-center mr-3">
                  <input type="checkbox" checked="" class="cart-item-checkbox w-4 h-4 text-blue-600 border-gray-300 rounded 
                focus:ring-blue-500" data-product-id="85067212996">
                </label>
                <!-- 상품 이미지 -->
                <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                  <img src="https://shopping-phinf.pstatic.net/main_8506721/85067212996.1.jpg" alt="PVC 투명 젤리 쇼핑백 1호 와인 답례품 구디백 비닐 손잡이 미니 간식 선물포장" class="w-full h-full object-cover cursor-pointer cart-item-image" data-product-id="85067212996">
                </div>
                <!-- 상품 정보 -->
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium text-gray-900 truncate cursor-pointer cart-item-title" data-product-id="85067212996">
                    PVC 투명 젤리 쇼핑백 1호 와인 답례품 구디백 비닐 손잡이 미니 간식 선물포장
                  </h4>
                  <p class="text-sm text-gray-600 mt-1">
                    220원
                  </p>
                  <!-- 수량 조절 -->
                  <div class="flex items-center mt-2">
                    <button class="quantity-decrease-btn w-7 h-7 flex items-center justify-center 
                 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100" data-product-id="85067212996">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                      </svg>
                    </button>
                    <input type="number" value="2" min="1" class="quantity-input w-12 h-7 text-center text-sm border-t border-b 
                border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500" disabled="" data-product-id="85067212996">
                    <button class="quantity-increase-btn w-7 h-7 flex items-center justify-center 
                 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100" data-product-id="85067212996">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <!-- 가격 및 삭제 -->
                <div class="text-right ml-3">
                  <p class="text-sm font-medium text-gray-900">
                    440원
                  </p>
                  <button class="cart-item-remove-btn mt-1 text-xs text-red-600 hover:text-red-800" data-product-id="85067212996">
                    삭제
                  </button>
                </div>
              </div>
              <div class="flex items-center py-3 border-b border-gray-100 cart-item" data-product-id="86940857379">
                <!-- 선택 체크박스 -->
                <label class="flex items-center mr-3">
                  <input type="checkbox" class="cart-item-checkbox w-4 h-4 text-blue-600 border-gray-300 rounded 
                focus:ring-blue-500" data-product-id="86940857379">
                </label>
                <!-- 상품 이미지 -->
                <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                  <img src="https://shopping-phinf.pstatic.net/main_8694085/86940857379.1.jpg" alt="샷시 풍지판 창문 바람막이 베란다 문 틈막이 창틀 벌레 차단 샤시 방충망 틈새막이" class="w-full h-full object-cover cursor-pointer cart-item-image" data-product-id="86940857379">
                </div>
                <!-- 상품 정보 -->
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium text-gray-900 truncate cursor-pointer cart-item-title" data-product-id="86940857379">
                    샷시 풍지판 창문 바람막이 베란다 문 틈막이 창틀 벌레 차단 샤시 방충망 틈새막이
                  </h4>
                  <p class="text-sm text-gray-600 mt-1">
                    230원
                  </p>
                  <!-- 수량 조절 -->
                  <div class="flex items-center mt-2">
                    <button class="quantity-decrease-btn w-7 h-7 flex items-center justify-center 
                 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100" data-product-id="86940857379">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                      </svg>
                    </button>
                    <input type="number" value="1" min="1" class="quantity-input w-12 h-7 text-center text-sm border-t border-b 
                border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500" disabled="" data-product-id="86940857379">
                    <button class="quantity-increase-btn w-7 h-7 flex items-center justify-center 
                 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100" data-product-id="86940857379">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <!-- 가격 및 삭제 -->
                <div class="text-right ml-3">
                  <p class="text-sm font-medium text-gray-900">
                    230원
                  </p>
                  <button class="cart-item-remove-btn mt-1 text-xs text-red-600 hover:text-red-800" data-product-id="86940857379">
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 하단 액션 -->
        <div class="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <!-- 선택된 아이템 정보 -->
          <div class="flex justify-between items-center mb-3 text-sm">
            <span class="text-gray-600">선택한 상품 (1개)</span>
            <span class="font-medium">440원</span>
          </div>
          <!-- 총 금액 -->
          <div class="flex justify-between items-center mb-4">
            <span class="text-lg font-bold text-gray-900">총 금액</span>
            <span class="text-xl font-bold text-blue-600">670원</span>
          </div>
          <!-- 액션 버튼들 -->
          <div class="space-y-2">
            <button id="cart-modal-remove-selected-btn" class="w-full bg-red-600 text-white py-2 px-4 rounded-md 
                       hover:bg-red-700 transition-colors text-sm">
              선택한 상품 삭제 (1개)
            </button>
            <div class="flex gap-2">
              <button id="cart-modal-clear-cart-btn" class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md 
                       hover:bg-gray-700 transition-colors text-sm">
                전체 비우기
              </button>
              <button id="cart-modal-checkout-btn" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md 
                       hover:bg-blue-700 transition-colors text-sm">
                구매하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
