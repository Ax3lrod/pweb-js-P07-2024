let cart = [];
let catalogProducts = []; // Store products globally

// Function to render the products in the catalog
async function fetchProducts(searchTerm = "") {
  try {
    const response = await fetch("https://dummyjson.com/products?limit=100");
    const data = await response.json();
    catalogProducts = data.products; // Store products globally

    // Render filtered products based on the search term
    const filteredProducts = applySearchFilter(catalogProducts, searchTerm);
    renderFilteredProducts(filteredProducts);

    // Add event listener for filtering after fetching
    document.getElementById("apply_filter").addEventListener("click", () => {
      const filteredProducts = applyFilters(catalogProducts);
      renderFilteredProducts(filteredProducts);
    });
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

// Function to apply search filtering
function applySearchFilter(products, searchTerm) {
  if (!searchTerm) return products; // Return all products if no search term is provided

  const lowerSearchTerm = searchTerm.toLowerCase(); // Convert search term to lowercase for case-insensitive matching

  return products.filter((product) => {
    // Check if the title, description, brand, or tags include the search term
    const matchesTitle = product.title.toLowerCase().includes(lowerSearchTerm);
    const matchesDescription = product.description
      .toLowerCase()
      .includes(lowerSearchTerm);
    const matchesBrand = product.brand.toLowerCase().includes(lowerSearchTerm);
    const matchesTags = product.tags.some((tag) =>
      tag.toLowerCase().includes(lowerSearchTerm)
    );

    return matchesTitle || matchesDescription || matchesBrand || matchesTags;
  });
}

// Function to apply filters (category and price)
function applyFilters(products) {
  const category = document.getElementById("category_filter").value;
  const minPrice = parseFloat(document.getElementById("min_price").value) || 0;
  const maxPrice =
    parseFloat(document.getElementById("max_price").value) || Infinity;

  return products.filter((product) => {
    const matchesCategory = category ? product.category === category : true;
    const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
    return matchesCategory && matchesPrice;
  });
}

// Function to render the products based on filters
function renderFilteredProducts(products) {
  try {
    const catalog = document.getElementById("item_catalog");
    catalog.innerHTML = ""; // Clear existing items

    // Render the filtered or full products list
    products.forEach((product) => {
      const productCard = `
        <div class="item_card" id="product_${product.id}">
          <div class="item_image">
            <img src="${
              product.thumbnail || "https://via.placeholder.com/150"
            }" alt="${product.title}" width="150" height="150" loading="lazy"/>
          </div>
          <div class="item_card_info">
            <p class="item_card_title">${product.title}</p>
            <p class="item_card_price">$${product.price}</p>
            <p class="item_card_stock">Stock: ${product.stock}</p>
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
      }', ${product.price}, ${product.stock})">Add to Cart</button>
          </div>
        </div>
      `;
      catalog.innerHTML += productCard;
    });

    // If no products match the search, display a message
    if (products.length === 0) {
      catalog.innerHTML = "<p>No products match your search.</p>";
    }
  } catch (error) {
    console.error("Error rendering products:", error);
  }
}

// Show plus, minus, and confirm buttons
function showQuantityButtons(id, title, price, stock) {
  const productCardButton = document.querySelector(
    `#product_${id} .item_card_button`
  );

  let quantity = 1; // Default quantity to 1

  productCardButton.innerHTML = `
    <div class="quantity_buttons">
    <div class="quantity_buttons_plus_minus">
      <button id="minus_button_${id}" onclick="adjustQuantity('${id}', 'decrease', ${stock})">-</button>
      <span id="quantity_display_${id}">${quantity}</span>
      <button id="plus_button_${id}" onclick="adjustQuantity('${id}', 'increase', ${stock})">+</button>
    </div>
      <button id="confirm_button_${id}" onclick="confirmAddToCart('${id}', '${title}', ${price}, ${stock})">Confirm</button>
    </div>
  `;
}

// Adjust quantity for the product
function adjustQuantity(id, action, stock) {
  const quantityDisplay = document.getElementById(`quantity_display_${id}`);
  let quantity = parseInt(quantityDisplay.textContent);

  if (action === "increase" && quantity < stock) {
    quantity += 1;
  } else if (action === "decrease" && quantity > 1) {
    quantity -= 1;
  }

  quantityDisplay.textContent = quantity;
}

// Confirm and add item to cart with selected quantity
function confirmAddToCart(id, title, price, stock) {
  const quantity = parseInt(
    document.getElementById(`quantity_display_${id}`).textContent
  );

  // Ensure the requested quantity does not exceed stock
  const existingItem = cart.find((item) => item.id === id);
  if (existingItem) {
    if (existingItem.quantity + quantity > stock) {
      alert(`Sorry, only ${stock} items available in stock.`);
      return;
    }
    existingItem.quantity += quantity;
  } else {
    if (quantity > stock) {
      alert(`Sorry, only ${stock} items available in stock.`);
      return;
    }
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
  productCardButton.innerHTML = `<button onclick="showQuantityButtons('${id}', '${title}', ${price}, ${stock})">Add to Cart</button>`;
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

// Add more of the same item to cart
function addMoreToCart(id, stock) {
  const itemIndex = cart.findIndex((item) => item.id === id);

  if (itemIndex > -1) {
    if (cart[itemIndex].quantity < stock) {
      cart[itemIndex].quantity += 1; // Increase quantity by 1
    } else {
      alert(`Sorry, you cannot add more than ${stock} items to the cart.`);
    }
  }

  renderCart();
}

// Function to drop all items from the cart
function dropAllFromCart() {
  cart = []; // Clear the cart array
  renderCart(); // Update the cart display
}

// Attach the dropAllFromCart function to the "Drop All" button
document
  .getElementById("drop_all_cart_button")
  .addEventListener("click", dropAllFromCart);

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
    const stock = getStockForProduct(item.id); // Get the stock for this item
    const cartItem = `
      <div class="cart_card_items_info">
        <p class="cart_card_items_info_title">${item.title}</p>
        <p>$${totalPrice}</p> <!-- Display total price -->
        <p>${item.quantity}X</p>
        <button onclick="removeFromCart('${item.id}')">-</button>
        <button onclick="addMoreToCart('${item.id}', ${stock})">+</button>
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

// Function to apply search filtering
function applySearchFilter(products, searchTerm) {
  if (!searchTerm) return products; // Return all products if no search term is provided
  return products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

// Event listener for the search input
document.getElementById("search_input").addEventListener("input", () => {
  const searchInput = document.getElementById("search_input").value;
  const filteredProducts = applySearchFilter(catalogProducts, searchInput);
  renderFilteredProducts(filteredProducts);
});
// Call the fetchProducts function when the page loads to display all products
window.onload = () => {
  fetchProducts(); // Ensure this is called without any search term
};

// Event listener for cart button click
document.querySelector(".cart_button").addEventListener("click", toggleCart);

// Helper function to get stock of a product
function getStockForProduct(id) {
  const product = catalogProducts.find((p) => p.id === parseInt(id));
  return product ? product.stock : 0;
}
document.getElementById("apply_filter").addEventListener("click", () => {
  const filteredProducts = applyFilters(products);
  console.log("Filtered products:", filteredProducts); // Debugging log
  renderFilteredProducts(filteredProducts);
});
