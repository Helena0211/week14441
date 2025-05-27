// TAFE
// Constants for storage keys
const USER_KEY = 'tafe_user';
const USERS_KEY = 'tafe_users';
const CART_STORAGE_KEY = 'tafe_cart';
const ORDER_STORAGE_KEY = 'tafe_orders';

// Arrays to hold resources and courses data
let RESOURCES = [];
let COURSES = [];

// Fetches resources from a JSON file
async function fetchResources() {
    try {
        const response = await fetch('/week14441/resources.json'); // Corrected path
        if (!response.ok) {
            throw new Error('Failed to fetch resources');
        }
        const data = await response.json();
        RESOURCES = data.resources;
        console.log('Resources loaded:', RESOURCES);
        displayProducts(RESOURCES); // Display products
    } catch (error) {
        console.error('Error loading resources:', error);
        return [];
    }
}

// Fetches courses from a JSON file
async function fetchCourses() {
    try {
        const response = await fetch('/week14441/courses.json'); // Ensure path is correct
        if (!response.ok) {
            throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        COURSES = data.courses;
        console.log('Courses loaded:', COURSES);
        displayCourses(COURSES); // Display courses
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

// Displays products on the page
function displayProducts(products) {
    const productListElement = document.getElementById('product-list');
    if (!productListElement) {
        const productListElement = document.createElement('div');
        productListElement.id = 'product-list';
        document.body.appendChild(productListElement);
    }
    productListElement.innerHTML = ''; // Clear existing content

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <p class="product-description">${product.description}</p>
                <button class="add-to-cart-btn" data-item-id="${product.id}">Add to Cart</button>
            </div>
        `;
        productListElement.appendChild(productCard);
    });
}

// Displays courses on the page
function displayCourses(courses) {
    const courseListElement = document.getElementById('course-list');
    if (!courseListElement) {
        const courseListElement = document.createElement('div');
        courseListElement.id = 'course-list';
        document.body.appendChild(courseListElement);
    }
    courseListElement.innerHTML = ''; // Clear existing content

    courses.forEach(course => {
        const courseElement = document.createElement('div');
        courseElement.className = 'course-item'; // Add a class name for CSS styling

        courseElement.innerHTML = `
            <h3>${course.name}</h3>
            <p>${course.description}</p>
            <p>Price: $${course.price}</p>
            <p>Assessment: ${course.assessment}</p>
            <p>Projects: ${course.projects.join(', ')}</p>
            <img src="${course.image}" alt="${course.name}" class="course-image">
        `;
        
        // Only add "Add to Cart" button on shopping.html page
        if (window.location.pathname.includes('shopping.html')) {
            courseElement.innerHTML += `<button class="add-to-cart-btn" data-item-id="${course.id}">Add to Cart</button>`;
        }

        courseListElement.appendChild(courseElement);
    });
}

// Load both products and courses
async function loadProductsAndCourses() {
    const productListElement = document.getElementById('product-list') || document.createElement('div');
    const courseListElement = document.getElementById('course-list') || document.createElement('div');
    
    if (!productListElement) {
        productListElement = document.createElement('div');
        productListElement.id = 'product-list';
        document.body.appendChild(productListElement);
    }
    if (!courseListElement) {
        courseListElement = document.createElement('div');
        courseListElement.id = 'course-list';
        document.body.appendChild(courseListElement);
    }

    productListElement.innerHTML = '<div class="loading">Loading products...</div>';
    courseListElement.innerHTML = '<div class="loading">Loading courses...</div>';

    try {
        await Promise.all([fetchResources(), fetchCourses()]);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Initializes authentication by setting up the users in local storage
function initAuth() {
    if (!localStorage.getItem(USERS_KEY)) {
        localStorage.setItem(USERS_KEY, JSON.stringify({}));
    }
    updateAuthLink();
}

// Registers a new user
function register() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value.trim();

    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }

    let users = JSON.parse(localStorage.getItem(USERS_KEY));
    if (!users) {
        users = {};
    }

    if (users[username]) {
        alert('Username already exists');
        return;
    }

    users[username] = {
        password: password,
        createdAt: new Date().toISOString()
    };

    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    alert('Registration successful! Please login.');
    document.getElementById('register-form').reset();
}


function login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }

    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    const user = users[username];

    if (!user || user.password !== password) {
        alert('Invalid username or password');
        return;
    }

    sessionStorage.clear();
    sessionStorage.setItem('logged_in', 'true');
    sessionStorage.setItem('username', username);
    
    updateAuthLink(); 
    window.location.href = 'shopping.html';
}

// Logs out the current user
function logout() {
    sessionStorage.clear();
    localStorage.removeItem('redirectAfterLogin');
    localStorage.removeItem('currentOrder');
    updateAuthLink();
    window.location.href = 'home.html';
}

// Retrieves the currently logged in user
function getCurrentUser() {
    if (sessionStorage.getItem('logged_in')) {
        return {
            username: sessionStorage.getItem('username')
        };
    }
    return null;
}

function updateAuthLink() {
    const user = getCurrentUser();
    const authLink = document.getElementById('login-logout-link');
    const navbar = document.getElementById('navbar');
    const welcomeMessageContainer = document.getElementById('welcome-message-container');
    
    if (user) {
        
        authLink.textContent = 'Logout';
        authLink.href = 'javascript:logout();';
        
        if (welcomeMessageContainer) {
            welcomeMessageContainer.innerHTML = `Welcome, ${user.username}`;
        }
    } else {
        
        authLink.textContent = 'Login';
        authLink.href = 'home.html';
        
        if (welcomeMessageContainer) {
            welcomeMessageContainer.innerHTML = '';
        }
    }
}
// Initializes the cart and orders in local storage
function initCart() {
    if (!localStorage.getItem(CART_STORAGE_KEY)) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(ORDER_STORAGE_KEY)) {
        localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify([]));
    }
}

// Retrieves the current cart
function getCart() {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
}

// Saves the cart to local storage
function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

// Adds an item to the cart
function addToCart(itemId) {
    const item = RESOURCES.find(item => item.id === itemId) || COURSES.find(item => item.id === itemId);
    if (!item) return false;

    let cart = getCart();
    const existingItem = cart.find(item => item.id === itemId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            alt: item.name,
            description: item.description,
            quantity: 1
        });
    }

    saveCart(cart);
    updateCartUI();
    showNotification('Item added to cart successfully');
    return true;
}

// Updates the quantity of a cart item
function updateCartItem(itemId, newQuantity) {
    if (newQuantity < 1) {
        removeCartItem(itemId);
        return;
    }

    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === itemId);

    if (itemIndex !== -1) {
        cart[itemIndex].quantity = newQuantity;
        saveCart(cart);
        updateCartUI();
    }
}

// Removes a cart item
function removeCartItem(itemId) {
    let cart = getCart().filter(item => item.id !== itemId);
    saveCart(cart);
    updateCartUI();
}

// Clears the cart
function clearCart() {
    saveCart([]);
    updateCartUI();
}

// Gets the total number of items in the cart
function getCartItemCount() {
    return getCart().reduce((total, item) => total + item.quantity, 0);
}

// Calculates the total price of the cart
function getCartTotal() {
    return getCart().reduce((total, item) => total + (item.price * item.quantity), 0);
}

function updateCartUI() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById('cart-items');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty</p>
                <a href="home.html" class="continue-shopping-btn">Continue Shopping</a>
            </div>
        `;
        if (checkoutBtn) checkoutBtn.disabled = true;
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image-container">
                    <img src="${item.image}" alt="${item.alt}" class="cart-item-image">
                </div>
                <div class="cart-item-details">
                    <h3 class="cart-item-title">${item.name}</h3>
                    <p class="cart-item-description">${item.description}</p>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateCartItem(${item.id}, ${item.quantity - 1})">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateCartItem(${item.id}, ${item.quantity + 1})">+</button>
                        <button class="update-btn" onclick="confirmUpdateQuantity(${item.id})">Update</button>
                    </div>
                    <p class="cart-item-subtotal">Subtotal: $${(item.price * item.quantity).toFixed(2)}</p>
                </div>
            </div>
        `).join('');
        if (checkoutBtn) checkoutBtn.disabled = false;
    }
    
    updateOrderSummary();
}

function updateOrderSummary() {
    const orderSummary = document.getElementById('order-summary');
    if (!orderSummary) return;
    
    const cart = getCart();
    const subtotal = getCartTotal();
    const shipping = 10; 
    const tax = subtotal * 0.1; 
    const total = subtotal + shipping + tax;
    
    orderSummary.innerHTML = `
        <h2>Order Summary</h2>
        <div class="summary-row">
            <span>Subtotal (${cart.length} items)</span>
            <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Shipping</span>
            <span>$${shipping.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Tax</span>
            <span>$${tax.toFixed(2)}</span>
        </div>
        <div class="summary-row summary-total">
            <span>Total</span>
            <span>$${total.toFixed(2)}</span>
        </div>
    `;
}

// Confirms the update of a cart item's quantity
function confirmUpdateQuantity(itemId) {
    const cart = getCart();
    const item = cart.find(item => item.id === itemId);
    if (!item) return;

    const newQuantity = prompt('Enter new quantity:', item.quantity.toString());
    if (newQuantity !== null) {
        updateCartItem(itemId, parseInt(newQuantity, 10));
    }
}

// Initializes orders in local storage
function initOrders() {
    if (!localStorage.getItem(ORDER_STORAGE_KEY)) {
        localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify([]));
    }
}

// Creates a new order
async function createOrder() {
    try {
        const user = getCurrentUser();
        if (!user || !user.username) throw new Error('User not logged in');
        
        const cart = getCart();
        if (!cart || !cart.length) throw new Error('Cart is empty');
        
        const subtotal = cart.reduce((sum, item) => {
            const itemTotal = item.price * item.quantity;
            return sum + Math.round(itemTotal * 100) / 100;
        }, 0);
        
        const tax = Math.round(subtotal * 0.1 * 100) / 100;
        const shipping = 10;
        const total = subtotal + shipping + tax;

        const order = {
            id: 'order_' + Date.now(),
            userId: user.username,
            date: new Date().toISOString(),
            items: JSON.parse(JSON.stringify(cart)),
            subtotal: subtotal.toFixed(2),
            shipping: shipping.toFixed(2),
            tax: tax.toFixed(2),
            total: total.toFixed(2),
            status: 'processing'
        };

        const orders = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY)) || [];
        orders.push(order);
        localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
        
        const savedOrders = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY));
        if (!savedOrders.some(o => o.id === order.id)) {
            throw new Error('Failed to verify order storage');
        }

        clearCart();
        return order;
    } catch (error) {
        console.error('Order creation failed:', error);
        throw error;
    }
}

// Retrieves a user's orders
function getUserOrders() {
    const user = getCurrentUser();
    if (!user) return [];
    
    const orders = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY)) || [];
    return orders.filter(order => order.userId === user.username);
}

// Verifies that an order is stored correctly
function verifyOrderStorage(order) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const storedOrders = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY)) || [];
            const isStored = storedOrders.some(storedOrder => storedOrder.id === order.id);
            resolve(isStored);
        }, 100);
    });
}

// Displays a notification message
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 2000);
}

// Checks the authentication status and redirects if necessary
function checkAuthStatus() {
    const user = getCurrentUser();
    const protectedPages = ['shopping.html', 'checkout.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !user) {
        localStorage.setItem('redirectAfterLogin', currentPage);
        window.location.href = 'home.html';
        return false;
    }
    
    return !!user;
}

// Downloads the orders as a JSON file
function downloadOrders() {
    const orders = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY)) || [];
    if (!orders || orders.length === 0) {
        alert('No orders to download');
        return;
    }
    const data = JSON.stringify(orders, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Orders downloaded successfully');
}

// Clears the shopping data from local storage
function clearLocalStorage() {
    const modal = document.createElement('div');
    modal.className = 'clear-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Clear Shopping Data</h3>
            <p>This will permanently clear your shopping cart and order history from your local storage.</p>
            <div class="modal-actions">
                <button id="confirm-clear">Confirm Clear</button>
                <button id="cancel-clear">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('confirm-clear').addEventListener('click', () => {
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.removeItem(ORDER_STORAGE_KEY);
        modal.remove();
        alert('Shopping data cleared successfully');
    });

    document.getElementById('cancel-clear').addEventListener('click', () => {
        modal.remove();
    });
}

// Places an order
async function placeOrder() {
    try {
        if (typeof createOrder !== 'function') {
            throw new Error('Order system is not ready. Please refresh the page.');
        }

        const user = getCurrentUser();
        if (!user) {
            throw new Error('Please login to place order');
        }

        const cart = getCart();
        if (!cart || cart.length === 0) {
            throw new Error('Your cart is empty');
        }

        const order = await createOrder();
        const orders = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY)) || [];
        if (!orders.some(o => o.id === order.id)) {
            throw new Error('Order not found after creation');
        }

        window.location.href = 'order-confirmation.html';
    } catch (error) {
        console.error('Place order error:', error);
        alert(error.message);
    }
}

// Displays a confirmation modal for the latest order
function showConfirmationModal() {
    // Remove any existing modal first
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        existingModal.remove();
    }

    const orders = JSON.parse(localStorage.getItem('tafe_orders')) || [];
    const latestOrder = orders[orders.length - 1];

    if (!latestOrder) {
        alert("No orders found!");
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Order Confirmation</h2>
            <div>
                <p><strong>Order ID:</strong> ${latestOrder.id}</p>
                <p><strong>Date:</strong> ${new Date(latestOrder.date).toLocaleString()}</p>
                <p><strong>Items:</strong></p>
                <ul>
                    ${latestOrder.items.map(item => `
                        <li>${item.name} - ${item.quantity} × $${item.price.toFixed(2)}</li>
                    `).join('')}
                </ul>
                <p><strong>Subtotal:</strong> $${latestOrder.subtotal}</p>
                <p><strong>Shipping:</strong> $${latestOrder.shipping}</p>
                <p><strong>Tax:</strong> $${latestOrder.tax}</p>
                <p><strong>Total:</strong> $${latestOrder.total}</p>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Fixed event listener - uses event delegation
    modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('close')) {
            modal.style.display = 'none';
            // Optional: Remove after animation completes
            setTimeout(() => modal.remove(), 300);
        }
    });
}

// Single DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    // Initialize functions
    localStorage.removeItem('currentOrder');
    initAuth();
    initCart();
    initOrders();
    checkAuthStatus();

    // Update cart UI if the function exists
    if (typeof updateCartUI === 'function') {
        updateCartUI();
    }

    // Page-specific logic
    if (window.location.pathname.includes('courses.html')) {
        fetchCourses();
    } else if (window.location.pathname.includes('shopping.html')) {
        loadProductsAndCourses();
    }

    // Add checkout button event listener only if the button exists
    const checkoutButton = document.getElementById('checkout-btn');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function() {
            if (getCartItemCount() > 0) {
                window.location.href = 'checkout.html';
            } else {
                alert('Your cart is empty. Please add items to your cart before proceeding to checkout.');
            }
        });
    }

    // Add confirmation button event listener only if the button exists
    const confirmationBtn = document.getElementById('confirmation-btn');
    if (confirmationBtn) {
        confirmationBtn.addEventListener('click', showConfirmationModal);
    }

    // Global click event listeners
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const itemId = parseInt(e.target.dataset.itemId);
            if (!isNaN(itemId)) {
                addToCart(itemId);
            }
        }

        if (e.target.id === 'place-order-btn') {
            placeOrder();
        }
    });
});

// Expose functions to the global scope
window.addToCart = addToCart;
window.updateCartItem = updateCartItem;
window.confirmUpdateQuantity = confirmUpdateQuantity;
window.createOrder = createOrder;
window.getUserOrders = getUserOrders;
window.downloadOrders = downloadOrders;
window.placeOrder = placeOrder;
window.clearLocalStorage = clearLocalStorage;
window.checkAuthStatus = checkAuthStatus;
window.showConfirmationModal = showConfirmationModal;