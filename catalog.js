let cart = [];

// Function to render the products in the catalog
async function fetchProducts() {
  try {
    const response = await fetch("https://dummyjson.com/products");
    const data = await response.json();
    const products = data.products;

    const catalog = document.getElementById("item_catalog");
    catalog.innerHTML = ""; // Clear existing items

    products.forEach((product) => {
      const productCard = `
        <div class="item_card" id="product_${product.id}">
          <div class="item_image">
            <img src="${
              product.thumbnail || "https://via.placeholder.com/150"
            }" alt="${product.title}" />
          </div>
          <div class="item_card_info">
            <p class="item_card_title">${product.title}</p>
            <p class="item_card_price">$${product.price}</p>
            <div class="item_card_rating">
              <img src="/public/images/Star.svg" alt="Star" />
              <p>${product.rating}</p>
            </div>
          </div>
          <div class="item_card_button">
            <button id="add_button_${
              product.id
            }" onclick="showQuantityButtons('${product.id}', '${
        product.title
      }', ${product.price})">Add to Cart</button>
          </div>
        </div>
      `;
      catalog.innerHTML += productCard;
    });
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

// Show plus, minus, and confirm buttons
function showQuantityButtons(id, title, price) {
  const productCardButton = document.querySelector(
    `#product_${id} .item_card_button`
  );

  let quantity = 1; // Default quantity to 1

  productCardButton.innerHTML = `
    <div class="quantity_buttons">
    <div class="quantity_buttons_plus_minus">
      <button id="minus_button_${id}" onclick="adjustQuantity('${id}', 'decrease')">-</button>
      <span id="quantity_display_${id}">${quantity}</span>
      <button id="plus_button_${id}" onclick="adjustQuantity('${id}', 'increase')">+</button>
    </div>
      <button id="confirm_button_${id}" onclick="confirmAddToCart('${id}', '${title}', ${price})">Confirm</button>
    </div>
  `;
}

// Adjust quantity for the product
function adjustQuantity(id, action) {
  const quantityDisplay = document.getElementById(`quantity_display_${id}`);
  let quantity = parseInt(quantityDisplay.textContent);

  if (action === "increase") {
    quantity += 1;
  } else if (action === "decrease" && quantity > 1) {
    quantity -= 1;
  }

  quantityDisplay.textContent = quantity;
}

// Confirm and add item to cart with selected quantity
function confirmAddToCart(id, title, price) {
  const quantity = parseInt(
    document.getElementById(`quantity_display_${id}`).textContent
  );
  const existingItem = cart.find((item) => item.id === id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id,
      title,
      price,
      quantity,
    });
  }

  renderCart();

  // Revert buttons back to "Add to Cart"
  const productCardButton = document.querySelector(
    `#product_${id} .item_card_button`
  );
  productCardButton.innerHTML = `<button onclick="showQuantityButtons('${id}', '${title}', ${price})">Add to Cart</button>`;
}

// Remove or reduce item from cart
function removeFromCart(id) {
  const itemIndex = cart.findIndex((item) => item.id === id);

  if (itemIndex > -1) {
    if (cart[itemIndex].quantity > 1) {
      cart[itemIndex].quantity -= 1; // Reduce quantity by 1
    } else {
      cart.splice(itemIndex, 1); // Remove the item if quantity is 1
    }
  }

  renderCart();
}

// Render cart items
function renderCart() {
  const cartItemsContainer = document.querySelector(".cart_card_items");
  cartItemsContainer.innerHTML = ""; // Clear the cart items container

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  cart.forEach((item) => {
    const totalPrice = (item.price * item.quantity).toFixed(2); // Calculate total price for the item
    const cartItem = `
      <div class="cart_card_items_info">
        <p class="cart_card_items_info_title">${item.title}</p>
        <p>$${totalPrice}</p> <!-- Display total price -->
        <p>${item.quantity}X</p>
        <button onclick="removeFromCart('${item.id}')">-</button>
      </div>
    `;
    cartItemsContainer.innerHTML += cartItem;
  });
}

// Toggle cart visibility
function toggleCart() {
  const cartCard = document.querySelector(".cart_card");
  cartCard.style.display =
    cartCard.style.display === "none" || cartCard.style.display === ""
      ? "flex"
      : "none";
}

// Call the fetchProducts function when the page loads
window.onload = fetchProducts;

// Event listener for cart button click
document.querySelector(".cart_button").addEventListener("click", toggleCart);
