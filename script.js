// LocalBacker - Bakery Website JavaScript

// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart
    const cart = {
        items: [],
        total: 0
    };

    // Elements
    const orderBtn = document.getElementById('orderBtn');
    const cartPopup = document.getElementById('cart-popup');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const contactForm = document.getElementById('orderForm');
    const newsletterForm = document.getElementById('newsletterForm');
    
    // Make sure cart popup is hidden initially
    if (cartPopup) {
        cartPopup.classList.add('hidden');
    }

    // Event Listeners
    if (orderBtn) {
        orderBtn.addEventListener('click', function() {
            document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', function() {
            cartPopup.classList.add('hidden');
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.items.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            alert('Thank you for your order! Total: $' + cart.total.toFixed(2));
            clearCart();
            cartPopup.classList.add('hidden');
        });
    }

    // Add to cart functionality - modified to remove popup
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = parseFloat(productCard.querySelector('.price').textContent.replace('$', ''));
            const productId = this.getAttribute('data-id') || Math.floor(Math.random() * 1000); // Fallback for demo
            
            // Add to cart silently without showing popup
            addToCart(productId, productName, productPrice);
            
            // Show confirmation instead of popup
            alert(`Added ${productName} to your order. You can complete your order in the Visit Us section.`);
        });
    });

    // Form submissions
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (cart.items.length === 0) {
                alert('Please add items to your cart before placing an order.');
                return;
            }
            
            const formData = {
                name: contactForm.querySelector('[name="name"]').value,
                email: contactForm.querySelector('[name="email"]').value,
                address: contactForm.querySelector('[name="message"]').value,
                total: cart.total,
                items: cart.items
            };
            
            // Send order to backend
            fetch('http://localhost:5000/api/cart/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(`Thank you for your order! Your order ID is: ${data.order_id}`);
                    clearCart();
                    contactForm.reset();
                } else {
                    alert('There was an error processing your order. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was an error processing your order. Please try again.');
            });
        });
    }

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: newsletterForm.querySelector('[name="name"]').value,
                email: newsletterForm.querySelector('[name="email"]').value,
                message: 'Newsletter subscription'
            };
            
            // Send feedback to backend
            fetch('http://localhost:5000/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Thank you for subscribing to our newsletter!');
                    newsletterForm.reset();
                } else {
                    alert('There was an error processing your subscription. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was an error processing your subscription. Please try again.');
            });
        });
    }

    // Cart functions
    function addToCart(id, name, price) {
        // Check if item already exists in cart
        const existingItem = cart.items.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity++;
            existingItem.total = existingItem.quantity * existingItem.price;
        } else {
            cart.items.push({
                id: id,
                name: name,
                price: price,
                quantity: 1,
                total: price
            });
        }
        
        updateCart();
    }

    function updateCart() {
        // Clear cart items container
        cartItemsContainer.innerHTML = '';
        
        // Calculate total
        cart.total = 0;
        
        // Add items to cart
        cart.items.forEach(item => {
            cart.total += item.total;
            
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <p>${item.name} x ${item.quantity} <span>$${item.total.toFixed(2)}</span></p>
                <button class="remove-item" data-name="${item.name}">Remove</button>
            `;
            
            cartItemsContainer.appendChild(itemElement);
        });
        
        // Update total
        cartTotalElement.textContent = '$' + cart.total.toFixed(2);
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const name = this.getAttribute('data-name');
                removeFromCart(name);
            });
        });
    }

    function removeFromCart(name) {
        const index = cart.items.findIndex(item => item.name === name);
        
        if (index !== -1) {
            const item = cart.items[index];
            
            if (item.quantity > 1) {
                item.quantity--;
                item.total = item.quantity * item.price;
            } else {
                cart.items.splice(index, 1);
            }
            
            updateCart();
        }
    }

    function clearCart() {
        cart.items = [];
        cart.total = 0;
        updateCart();
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Daily special highlight effect
    const specials = document.querySelectorAll('.day-special');
    
    specials.forEach(special => {
        special.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
            this.style.transition = 'all 0.3s ease';
        });
        
        special.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.05)';
        });
    });

    // Date picker min date (today)
    const pickupDateInput = document.getElementById('pickupDate');
    if (pickupDateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1;
        let dd = today.getDate();
        
        if (mm < 10) mm = '0' + mm;
        if (dd < 10) dd = '0' + dd;
        
        const formattedToday = yyyy + '-' + mm + '-' + dd;
        pickupDateInput.setAttribute('min', formattedToday);
    }
});