document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        contactForm: document.getElementById('contactForm'),
        formMessage: document.getElementById('formMessage'),
        productListContainer: document.getElementById('product-list'),
        cartCountSpan: document.getElementById('cart-count'),
        cartModal: document.getElementById('cart-modal'),
        cartIcon: document.getElementById('cart-icon'),
        closeButton: document.querySelector('.close-button'),
        cartItemsContainer: document.getElementById('cart-items-container'),
        cartTotalSpan: document.getElementById('cart-total'),
        emptyCartMessage: document.getElementById('empty-cart-message'),
        checkoutButton: document.getElementById('checkout-button'),
        clearCartButton: document.getElementById('clear-cart-button'),
    };

    let cart = JSON.parse(localStorage.getItem('fullstepCart')) || [];

    const saveCart = () => {
        localStorage.setItem('fullstepCart', JSON.stringify(cart));
        updateCartCounter();
    };

    const updateCartCounter = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        elements.cartCountSpan.textContent = totalItems;
    };

    const renderCartItems = () => {
        elements.cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            elements.emptyCartMessage.style.display = 'block';
            elements.cartTotalSpan.textContent = '0.00';
            elements.checkoutButton.disabled = true;
            elements.clearCartButton.disabled = true;
            return;
        } else {
            elements.emptyCartMessage.style.display = 'none';
            elements.checkoutButton.disabled = false;
            elements.clearCartButton.disabled = false;
        }

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.title}" aria-label="Imagen de ${item.title}">
                <div class="cart-item-info">
                    <h5>${item.title}</h5>
                    <p>$${item.price.toFixed(2)} c/u</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn minus-btn" data-id="${item.id}" aria-label="Disminuir cantidad de ${item.title}">-</button>
                    <input type="number" class="item-quantity" value="${item.quantity}" min="1" data-id="${item.id}" aria-label="Cantidad de ${item.title}" readonly>
                    <button class="quantity-btn plus-btn" data-id="${item.id}" aria-label="Aumentar cantidad de ${item.title}">+</button>
                    <button class="remove-item" data-id="${item.id}" aria-label="Eliminar ${item.title} del carrito">X</button>
                </div>
            `;
            elements.cartItemsContainer.appendChild(itemElement);
            total += item.price * item.quantity;
        });

        elements.cartTotalSpan.textContent = total.toFixed(2);

        elements.cartItemsContainer.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                const delta = e.target.classList.contains('plus-btn') ? 1 : -1;
                updateQuantity(id, delta);
            });
        });
        elements.cartItemsContainer.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', removeItem);
        });
    };

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCart();
        renderCartItems();
        showNotification(`"${product.title}" añadido al carrito.`);
    };

    const updateQuantity = (productId, delta) => {
        const itemIndex = cart.findIndex(item => item.id === productId);

        if (itemIndex > -1) {
            cart[itemIndex].quantity += delta;
            if (cart[itemIndex].quantity <= 0) {
                const removedItemTitle = cart[itemIndex].title;
                cart = cart.filter(item => item.id !== productId);
                showNotification(`"${removedItemTitle}" eliminado del carrito.`, 'error');
            } else {
                showNotification(`Cantidad de "${cart[itemIndex].title}" actualizada a ${cart[itemIndex].quantity}.`);
            }
            saveCart();
            renderCartItems();
        }
    };

    const removeItem = (event) => {
        const productId = parseInt(event.target.dataset.id);
        const itemToRemove = cart.find(item => item.id === productId);

        if (itemToRemove && confirm(`¿Estás seguro de que quieres eliminar "${itemToRemove.title}" del carrito?`)) {
            cart = cart.filter(item => item.id !== productId);
            saveCart();
            renderCartItems();
            showNotification(`"${itemToRemove.title}" eliminado del carrito.`, 'error');
        }
    };

    const clearCart = () => {
        if (confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
            cart = [];
            saveCart();
            renderCartItems();
            showNotification('El carrito ha sido vaciado.', 'error');
        }
    };

    const checkout = () => {
        if (cart.length === 0) {
            showNotification('Tu carrito está vacío. ¡Añade productos antes de comprar!', 'error');
            return;
        }
        alert('¡Compra realizada con éxito!');
        console.log('Pedido finalizado:', cart);
        cart = [];
        saveCart();
        renderCartItems();
        elements.cartModal.classList.remove('active');
        showNotification('¡Gracias por tu compra!', 'success');
    };

    const showNotification = (message, type = 'success') => {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed; bottom: 20px; right: 20px;
            background-color: ${type === 'success' ? '#4CAF50' : '#d9534f'};
            color: white; padding: 15px 20px; border-radius: 5px;
            z-index: 1000; opacity: 0; transition: opacity 0.5s ease-in-out;
            max-width: 80%; text-align: center;
        `;
        document.body.appendChild(messageDiv);

        setTimeout(() => messageDiv.style.opacity = '1', 10);
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.addEventListener('transitionend', () => messageDiv.remove());
        }, 3000);
    };

    const validateForm = async (event) => {
        event.preventDefault();

        document.querySelectorAll('.error-message').forEach(span => span.textContent = '');
        elements.formMessage.textContent = '';
        elements.formMessage.className = 'form-message';

        let isValid = true;

        const nombreInput = document.getElementById('nombre');
        if (nombreInput.value.trim() === '') {
            document.getElementById('nombreError').textContent = 'El nombre es requerido.';
            isValid = false;
        }

        const emailInput = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailInput.value.trim() === '') {
            document.getElementById('emailError').textContent = 'El correo electrónico es requerido.';
            isValid = false;
        } else if (!emailRegex.test(emailInput.value)) {
            document.getElementById('emailError').textContent = 'Formato de correo electrónico inválido.';
            isValid = false;
        }

        const consultaInput = document.getElementById('consulta');
        if (consultaInput.value.trim() === '') {
            document.getElementById('consultaError').textContent = 'La consulta es requerida.';
            isValid = false;
        }

        if (isValid) {
            const formData = new FormData(elements.contactForm);
            try {
                const response = await fetch(elements.contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    elements.formMessage.textContent = '¡Mensaje enviado con éxito!';
                    elements.formMessage.classList.add('success');
                    elements.contactForm.reset();
                } else {
                    const data = await response.json();
                    elements.formMessage.textContent = data.errors ? data.errors.map(e => e.message).join(", ") : 'Oops! Hubo un problema al enviar tu mensaje.';
                    elements.formMessage.classList.add('error');
                }
            } catch (error) {
                console.error('Error al enviar el formulario:', error);
                elements.formMessage.textContent = 'Oops! Hubo un problema de conexión al enviar el formulario.';
                elements.formMessage.classList.add('error');
            }
        } else {
            elements.formMessage.textContent = 'Por favor, corrige los errores en el formulario.';
            elements.formMessage.classList.add('error');
        }
    };

    const fetchProducts = async () => {
        const API_URL = 'https://fakestoreapi.com/products?limit=6';
        const simpleNames = ["Mochila", "Remera", "Saco", "Remera Termica", "Pulsera", "Anillo"];

        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const products = await response.json();

            const namedProducts = products.map((product, index) => ({
                id: product.id,
                title: simpleNames[index] || product.title,
                price: product.price,
                image: product.image
            }));

            renderProducts(namedProducts);
        } catch (error) {
            console.error('Error al obtener los productos:', error);
            if (elements.productListContainer) {
                elements.productListContainer.innerHTML = '<p style="text-align: center; color: #d9534f; font-weight: bold;">Lo sentimos, no pudimos cargar los productos en este momento. Por favor, inténtalo de nuevo más tarde.</p>';
            }
        }
    };

    const renderProducts = (products) => {
        if (!elements.productListContainer) {
            console.warn('El contenedor de productos (product-list) no fue encontrado.');
            return;
        }
        elements.productListContainer.innerHTML = '';

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card', 'card-item');
            productCard.innerHTML = `
                <h4>${product.title}</h4>
                <img src="${product.image}" alt="${product.title}" loading="lazy">
                <p>Precio: $<span class="product-price">${product.price.toFixed(2)}</span></p>
                <a href="#" class="add-to-cart-btn"
                        data-id="${product.id}"
                        data-title="${product.title}"
                        data-price="${product.price}"
                        data-image="${product.image}"
                        aria-label="Añadir ${product.title} al carrito">
                    Añadir al carrito
                </a>
            `;
            elements.productListContainer.appendChild(productCard);
        });

        elements.productListContainer.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const productData = {
                    id: parseInt(event.target.dataset.id),
                    title: event.target.dataset.title,
                    price: parseFloat(event.target.dataset.price),
                    image: event.target.dataset.image
                };
                addToCart(productData);
            });
        });
    };

    const init = () => {
        updateCartCounter();
        fetchProducts();

        if (elements.contactForm) elements.contactForm.addEventListener('submit', validateForm);
        if (elements.cartIcon) elements.cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            elements.cartModal.classList.add('active');
            renderCartItems();
        });
        if (elements.closeButton) elements.closeButton.addEventListener('click', () => {
            elements.cartModal.classList.remove('active');
        });
        window.addEventListener('click', (event) => {
            if (event.target === elements.cartModal) {
                elements.cartModal.classList.remove('active');
            }
        });
        if (elements.clearCartButton) elements.clearCartButton.addEventListener('click', clearCart);
        if (elements.checkoutButton) elements.checkoutButton.addEventListener('click', checkout);
    };

    init();
});