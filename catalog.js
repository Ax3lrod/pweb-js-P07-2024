let cart = [];
let catalogProducts = []; // Store products globally
let currentPage = 1;
let itemsPerPage = 10; // Default items per page

// Event listeners for items per page filters
document
  .getElementById("item_per_page")
  .addEventListener("change", updateItemsPerPage);
document
  .getElementById("item_per_page_mobile")
  .addEventListener("change", updateItemsPerPage);

function updateItemsPerPage() {
  itemsPerPage = parseInt(this.value); // Get selected items per page
  currentPage = 1; // Reset to first page
  const filteredProducts = applyFilters(catalogProducts); // Apply filters and update
  renderFilteredProducts(filteredProducts);
}

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
    document
      .getElementById("apply_filter_mobile")
      .addEventListener("click", () => {
        const filteredProducts = applyFiltersMobile(catalogProducts);
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

function applyFiltersMobile(products) {
  const category = document.getElementById("category_filter_mobile").value;
  const minPrice =
    parseFloat(document.getElementById("min_price_mobile").value) || 0;
  const maxPrice =
    parseFloat(document.getElementById("max_price_mobile").value) || Infinity;

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

    const totalPages = Math.ceil(products.length / itemsPerPage); // Calculate total pages
    const start = (currentPage - 1) * itemsPerPage; // Calculate starting index
    const end = start + itemsPerPage; // Calculate ending index
    const paginatedProducts = products.slice(start, end); // Get the products for the current page

    // Render the filtered or full products list
    paginatedProducts.forEach((product) => {
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

    // Render pagination controls
    renderPagination(totalPages);
  } catch (error) {
    console.error("Error rendering products:", error);
  }
}

// Function to render pagination controls
function renderPagination(totalPages) {
  const pagination = document.getElementById("pagination");
  let paginationHTML = ""; // Store the pagination HTML here

  // Create "Previous" button
  if (currentPage > 1) {
    paginationHTML += `<button class="pagination_button" style="padding: 10px; background-color: #333; color: white; border: none; cursor: pointer; margin-right: 5px;" onclick="changePage(${
      currentPage - 1
    })">Previous</button>`;
  }

  // Create page numbers
  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `<button class="pagination_button ${
      i === currentPage ? "active" : ""
    }" 
      style="padding: 10px; background-color: ${
        i === currentPage ? "#555" : "#333"
      }; color: white; border: none; cursor: pointer; margin-right: 5px;"
      onclick="changePage(${i})">${i}</button>`;
  }

  // Create "Next" button
  if (currentPage < totalPages) {
    paginationHTML += `<button class="pagination_button" style="padding: 10px; background-color: #333; color: white; border: none; cursor: pointer; margin-left: 5px;" onclick="changePage(${
      currentPage + 1
    })">Next</button>`;
  }

  // Insert the generated HTML into the pagination container
  pagination.innerHTML = paginationHTML;
}

// Helper function to handle page changes
function changePage(page) {
  currentPage = page;
  const filteredProducts = applyFilters(catalogProducts);
  renderFilteredProducts(filteredProducts);
  renderPagination(totalPages);
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

// Function to save cart to local storage
function saveCartToLocalStorage() {
  localStorage.setItem("cartItems", JSON.stringify(cart));
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

  // Save the updated cart to local storage
  saveCartToLocalStorage();

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

  // Save the updated cart to local storage
  saveCartToLocalStorage();
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

  // Save the updated cart to local storage
  saveCartToLocalStorage();
}

// Function to drop all items from the cart
function dropAllFromCart() {
  cart = []; // Clear the cart array
  localStorage.removeItem("cartItems"); // Clear the cart data from local storage
  renderCart(); // Update the cart display
}

// Attach the dropAllFromCart function to the "Drop All" button
document
  .getElementById("drop_all_cart_button")
  .addEventListener("click", dropAllFromCart);

// Render cart items
// Load cart data from local storage when the page loads
window.addEventListener("DOMContentLoaded", function () {
  // Retrieve the saved cart data from local storage
  const savedCart = JSON.parse(localStorage.getItem("cartItems"));

  // If there's saved cart data, initialize the cart with it
  if (savedCart) {
    cart = savedCart;
  }

  // Render the cart upon page load
  renderCart();
});

// Save cart data to local storage after checkout
document
  .getElementById("checkout_button")
  .addEventListener("click", function () {
    // Check if the cart is empty before proceeding
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    // Mark all cart items as checked out
    cart.forEach((item) => (item.checkedOut = true));

    // Prepare the cart data to be saved in local storage
    const cartData = cart.map((item) => ({
      title: item.title,
      quantity: item.quantity,
      totalPrice: (item.price * item.quantity).toFixed(2),
      checkedOut: item.checkedOut, // Save the checkedOut status to local storage
      id: item.id, // Include the product ID in local storage for future reference
    }));

    // Save the cart data to local storage
    localStorage.setItem("cartItems", JSON.stringify(cartData));

    // Alert the user that checkout was successful
    alert("Checkout successful!");

    // Update the cart display to show checked out items
    renderCart();
  });

// Function to render the cart from the stored cart data
function renderCart() {
  const cartItemsContainer = document.querySelector(".cart_card_items");
  cartItemsContainer.innerHTML = ""; // Clear the cart items container

  let totalPrice = 0; // Variable to accumulate total price

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    document.getElementById("total_price").textContent = totalPrice.toFixed(2); // Reset total price
    return;
  }

  cart.forEach((item) => {
    const itemTotalPrice = (item.price * item.quantity).toFixed(2); // Calculate total price for the item
    totalPrice += parseFloat(itemTotalPrice); // Accumulate total price
    const stock = getStockForProduct(item.id); // Get the stock for this item

    // Apply different styles if the item is checked out
    const checkedOutClass = item.checkedOut ? "checked_out" : "";
    const cartItem = `
      <div class="cart_card_items_info ${checkedOutClass}">
        <p class="cart_card_items_info_title">${item.title}</p>
        <p>$${itemTotalPrice}</p> <!-- Display total price for this item -->
        <p>${item.quantity}X</p>
        ${
          item.checkedOut
            ? '<p class="checked_out_message">Checked Out</p>' // Show this message if the item is checked out
            : `
          <button onclick="removeFromCart('${item.id}')">-</button>
          <button onclick="addMoreToCart('${item.id}', ${stock})">+</button>
        `
        }
      </div>
    `;
    cartItemsContainer.innerHTML += cartItem;
  });

  // Display the accumulated total price
  document.getElementById("total_price").textContent = totalPrice.toFixed(2);
}

// Add a class to visually indicate checked-out items
const style = document.createElement("style");
style.innerHTML = `
  .checked_out {
    opacity: 0.6;
    pointer-events: none; /* Prevent interaction with checked out items */
  }
  .checked_out_message {
    color: green;
    font-weight: bold;
  }
`;
document.head.appendChild(style);

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
document.getElementById("apply_filter_mobile").addEventListener("click", () => {
  const filteredProducts = applyFiltersMobile(products);
  console.log("Filtered products:", filteredProducts); // Debugging log
  renderFilteredProducts(filteredProducts);
});
document
  .getElementById("filters_mobile_button")
  .addEventListener("click", function () {
    const sidebar = document.getElementById("filters_mobile_sidebar");
    sidebar.style.display = "block";
    setTimeout(() => {
      sidebar.classList.add("open");
    }, 10);
  });

document.addEventListener("click", function (event) {
  const sidebar = document.getElementById("filters_mobile_sidebar");
  if (
    !sidebar.contains(event.target) &&
    !event.target.matches("#filters_mobile_button")
  ) {
    sidebar.classList.remove("open");
    setTimeout(() => {
      sidebar.style.display = "none";
    }, 300); // Wait for the transition to finish
  }
});
