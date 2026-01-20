/**
 * RD Store - Main JavaScript
 * Premium Electronics E-commerce
 * Mobile First | Luxury Design
 */

// =====================================================
// PRODUCTS DATA - Synchronisé avec l'API
// =====================================================
let productsData = [];

// Récupérer les produits depuis l'API
async function getProductsData() {
    const STORAGE_KEY = 'rd-products';
    
    try {
        // Essayer de récupérer depuis l'API
        const response = await fetch("/api/products");
        
        if (response.ok) {
            const data = await response.json();
            console.log('Produits récupérés depuis l\'API:', data);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return data;
        } else {
            throw new Error('API non disponible');
        }
    } catch (error) {
        console.error('Erreur API, utilisation du cache:', error);
        
        // Fallback sur le cache local
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Erreur parsing cache:', e);
            }
        }
        
        // Fallback sur les données par défaut
        return getDefaultProducts();
    }
}

// Données par défaut si rien d'autre n'est disponible
function getDefaultProducts() {
    return [
        {
            id: 1,
            titre: "iPhone 15 Pro Max",
            prix: "850 000 FCFA",
            description: "Le summum de l'innovation Apple. Écran Super Retina XDR 6,7 pouces, puce A17 Pro révolutionnaire, système de caméra professionnelle avec zoom optique 5x.",
            lien: "product?id=1",
            images: [],
            categorie: "Smartphones"
        },
        {
            id: 2,
            titre: "MacBook Pro 16\" M3 Max",
            prix: "2 500 000 FCFA",
            description: "La puissance ultime pour les créatifs. Puce Apple M3 Max, jusqu'à 128 Go de mémoire unifiée, écran Liquid Retina XDR.",
            lien: "product?id=2",
            images: [],
            categorie: "Ordinateurs"
        },
        {
            id: 3,
            titre: "Samsung Galaxy S24 Ultra",
            prix: "750 000 FCFA",
            description: "L'excellence Android redéfinie. Écran QHD+ 6,8 pouces, processeur Snapdragon 8 Gen 3, caméra 200MP.",
            lien: "product?id=3",
            images: [],
            categorie: "Smartphones"
        },
        {
            id: 4,
            titre: "Sony WH-1000XM5",
            prix: "280 000 FCFA",
            description: "La référence mondiale de la réduction de bruit. Audio haute résolution, 30 heures d'autonomie.",
            lien: "product?id=4",
            images: [],
            categorie: "Audio"
        }
    ];
}

// =====================================================
// CONFIGURATION
// =====================================================
const CONFIG = {
    whatsappNumber: "22870921270",
    autoplayInterval: 3000,
    itemsPerLoad: 8,
    animationDelay: 100
};

// =====================================================
// UTILITY - Format Prix avec FCFA
// =====================================================
function formatPrix(prix) {
    if (!prix) return '0 FCFA';
    // Si c'est déjà une chaîne avec FCFA, la retourner
    if (typeof prix === 'string' && prix.includes('FCFA')) return prix;
    // Sinon, formater le nombre
    const num = typeof prix === 'string' ? parseInt(prix.replace(/[^\d]/g, '')) : prix;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
}

// =====================================================
// CART SYSTEM
// =====================================================
class CartManager {
    constructor() {
        this.STORAGE_KEY = 'rd-cart';
        this.cart = this.loadCart();
        this.init();
    }

    init() {
        this.createCartUI();
        this.updateCartBadge();
        this.bindEvents();
    }

    loadCart() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Erreur chargement panier:', e);
            return [];
        }
    }

    saveCart() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cart));
        this.updateCartBadge();
        this.renderCartItems();
    }

    addItem(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: product.id,
                titre: product.titre,
                prix: product.prix,
                image: product.images && product.images[0] ? product.images[0] : null,
                quantity: quantity
            });
        }
        
        this.saveCart();
        this.showAddedFeedback(product.id);
    }

    removeItem(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart();
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    getTotal() {
        return this.cart.reduce((total, item) => {
            const price = this.parsePrice(item.prix);
            return total + (price * item.quantity);
        }, 0);
    }

    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    parsePrice(priceStr) {
        // Extract numbers from price string like "850 000 FCFA"
        if (!priceStr) return 0;
        if (typeof priceStr === 'number') return priceStr;
        const numbers = String(priceStr).replace(/[^\d]/g, '');
        return parseInt(numbers) || 0;
    }

    formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
    }

    createCartUI() {
        // Cart overlay
        const overlay = document.createElement('div');
        overlay.className = 'cart-overlay';
        overlay.id = 'cartOverlay';
        document.body.appendChild(overlay);

        // Cart sidebar
        const sidebar = document.createElement('div');
        sidebar.className = 'cart-sidebar';
        sidebar.id = 'cartSidebar';
        sidebar.innerHTML = `
            <div class="cart-header">
                <h2>Panier <span id="cartItemCount">(0)</span></h2>
                <button class="cart-close" id="cartClose" aria-label="Fermer le panier">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="cart-items" id="cartItems">
                <!-- Cart items will be rendered here -->
            </div>
            <div class="cart-footer" id="cartFooter">
                <div class="cart-total">
                    <span class="cart-total-label">Total</span>
                    <span class="cart-total-value" id="cartTotal">0 FCFA</span>
                </div>
                <div class="cart-actions">
                    <button class="btn-whatsapp-cart" id="btnWhatsappOrder">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Commander via WhatsApp
                    </button>
                    <button class="btn-clear-cart" id="btnClearCart">Vider le panier</button>
                </div>
                <a href="/rdvendeur-login" class="vendeur-hidden-link">Espace vendeur</a>
            </div>
        `;
        document.body.appendChild(sidebar);

        // Order modal
        const orderModal = document.createElement('div');
        orderModal.className = 'order-modal-overlay';
        orderModal.id = 'orderModalOverlay';
        orderModal.innerHTML = `
            <div class="order-modal">
                <div class="order-modal-header">
                    <h2>Finaliser la commande</h2>
                    <button class="order-modal-close" id="orderModalClose">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="order-modal-body">
                    <div class="order-form-group">
                        <label for="orderName">Votre nom *</label>
                        <input type="text" id="orderName" placeholder="Ex: Jean Dupont" required>
                    </div>
                    <div class="order-form-group">
                        <label for="orderPhone">Numéro de téléphone *</label>
                        <input type="tel" id="orderPhone" placeholder="Ex: +228 90 00 00 00" required>
                    </div>
                    <div class="order-form-group">
                        <label for="orderAddress">Adresse de livraison</label>
                        <textarea id="orderAddress" placeholder="Ex: Lomé, Quartier Be, à côté de..."></textarea>
                    </div>
                    <div class="order-form-group">
                        <label for="orderNote">Note supplémentaire</label>
                        <textarea id="orderNote" placeholder="Informations additionnelles pour votre commande..."></textarea>
                    </div>
                    <div class="order-summary" id="orderSummary">
                        <!-- Summary will be rendered -->
                    </div>
                </div>
                <div class="order-modal-footer">
                    <button class="btn-send-order" id="btnSendOrder">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Envoyer la commande
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(orderModal);

        this.renderCartItems();
    }

    bindEvents() {
        // Cart icon click
        document.addEventListener('click', (e) => {
            if (e.target.closest('#cartIcon')) {
                this.openCart();
            }
        });

        // Close cart
        document.getElementById('cartClose')?.addEventListener('click', () => this.closeCart());
        document.getElementById('cartOverlay')?.addEventListener('click', () => this.closeCart());

        // Clear cart
        document.getElementById('btnClearCart')?.addEventListener('click', () => {
            if (confirm('Voulez-vous vraiment vider le panier ?')) {
                this.clearCart();
            }
        });

        // WhatsApp order button
        document.getElementById('btnWhatsappOrder')?.addEventListener('click', () => {
            if (this.cart.length === 0) {
                alert('Votre panier est vide');
                return;
            }
            this.openOrderModal();
        });

        // Order modal close
        document.getElementById('orderModalClose')?.addEventListener('click', () => this.closeOrderModal());
        document.getElementById('orderModalOverlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'orderModalOverlay') this.closeOrderModal();
        });

        // Send order
        document.getElementById('btnSendOrder')?.addEventListener('click', () => this.sendWhatsAppOrder());

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCart();
                this.closeOrderModal();
            }
        });
    }

    openCart() {
        document.getElementById('cartSidebar')?.classList.add('open');
        document.getElementById('cartOverlay')?.classList.add('visible');
        document.body.classList.add('no-scroll');
    }

    closeCart() {
        document.getElementById('cartSidebar')?.classList.remove('open');
        document.getElementById('cartOverlay')?.classList.remove('visible');
        document.body.classList.remove('no-scroll');
    }

    openOrderModal() {
        this.renderOrderSummary();
        document.getElementById('orderModalOverlay')?.classList.add('visible');
    }

    closeOrderModal() {
        document.getElementById('orderModalOverlay')?.classList.remove('visible');
    }

    updateCartBadge() {
        const badge = document.getElementById('cartBadge');
        const count = this.getTotalItems();
        
        if (badge) {
            badge.textContent = count;
            badge.classList.toggle('visible', count > 0);
        }

        const itemCount = document.getElementById('cartItemCount');
        if (itemCount) {
            itemCount.textContent = `(${count})`;
        }
    }

    renderCartItems() {
        const container = document.getElementById('cartItems');
        const footer = document.getElementById('cartFooter');
        const totalEl = document.getElementById('cartTotal');
        
        if (!container) return;

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="cart-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="9" cy="21" r="1"/>
                        <circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    <p>Votre panier est vide</p>
                    <span>Ajoutez des produits pour commencer</span>
                </div>
            `;
            if (footer) footer.style.display = 'none';
            return;
        }

        if (footer) footer.style.display = 'block';

        container.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    ${item.image 
                        ? `<img src="${item.image}" alt="${item.titre}">`
                        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21,15 16,10 5,21"/>
                           </svg>`
                    }
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.titre}</div>
                    <div class="cart-item-price">${item.prix}</div>
                    <div class="cart-item-quantity">
                        <button class="cart-qty-minus" data-id="${item.id}">−</button>
                        <span>${item.quantity}</span>
                        <button class="cart-qty-plus" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" data-id="${item.id}" aria-label="Supprimer">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </div>
        `).join('');

        // Update total
        if (totalEl) {
            totalEl.textContent = this.formatPrice(this.getTotal());
        }

        // Bind quantity buttons
        container.querySelectorAll('.cart-qty-minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const item = this.cart.find(i => i.id === id);
                if (item && item.quantity > 1) {
                    this.updateQuantity(id, item.quantity - 1);
                }
            });
        });

        container.querySelectorAll('.cart-qty-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const item = this.cart.find(i => i.id === id);
                if (item) {
                    this.updateQuantity(id, item.quantity + 1);
                }
            });
        });

        container.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                this.removeItem(id);
            });
        });
    }

    renderOrderSummary() {
        const container = document.getElementById('orderSummary');
        if (!container) return;

        container.innerHTML = `
            <div class="order-summary-title">Récapitulatif</div>
            ${this.cart.map(item => `
                <div class="order-summary-item">
                    <span>${item.titre} × ${item.quantity}</span>
                    <span>${this.formatPrice(this.parsePrice(item.prix) * item.quantity)}</span>
                </div>
            `).join('')}
            <div class="order-summary-total">
                <span>Total</span>
                <span>${this.formatPrice(this.getTotal())}</span>
            </div>
        `;
    }

    showAddedFeedback(productId) {
        const btn = document.querySelector(`.btn-add-cart[data-id="${productId}"]`);
        if (btn) {
            btn.classList.add('added');
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                Ajouté
            `;
            setTimeout(() => {
                btn.classList.remove('added');
                btn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"/>
                        <circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    Ajouter
                `;
            }, 2000);
        }
    }

    sendWhatsAppOrder() {
        const name = document.getElementById('orderName')?.value.trim();
        const phone = document.getElementById('orderPhone')?.value.trim();
        const address = document.getElementById('orderAddress')?.value.trim();
        const note = document.getElementById('orderNote')?.value.trim();

        if (!name || !phone) {
            alert('Veuillez remplir votre nom et numéro de téléphone');
            return;
        }

        // Build order message
        let message = `🛒 *NOUVELLE COMMANDE - RD Store*\n\n`;
        message += `👤 *Client:* ${name}\n`;
        message += `📞 *Téléphone:* ${phone}\n`;
        if (address) message += `📍 *Adresse:* ${address}\n`;
        message += `\n━━━━━━━━━━━━━━━━\n`;
        message += `📦 *ARTICLES COMMANDÉS:*\n\n`;

        this.cart.forEach((item, index) => {
            message += `${index + 1}. *${item.titre}*\n`;
            message += `   Prix: ${item.prix}\n`;
            message += `   Quantité: ${item.quantity}\n`;
            message += `   Sous-total: ${this.formatPrice(this.parsePrice(item.prix) * item.quantity)}\n\n`;
        });

        message += `━━━━━━━━━━━━━━━━\n`;
        message += `💰 *TOTAL: ${this.formatPrice(this.getTotal())}*\n`;
        
        if (note) {
            message += `\n📝 *Note:* ${note}\n`;
        }

        message += `\n✨ Merci pour votre commande!`;

        // Open WhatsApp
        const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');

        // Préparer les articles pour la base de données
        const articlesForDB = this.cart.map(item => ({
            id: item.id,
            titre: item.titre,
            prix: this.parsePrice(item.prix),
            quantity: item.quantity,
            image: item.image || null
        }));

        // Envoyer la commande à l'API pour sauvegarde en base de données
        this.saveOrderToDatabase({
            client_nom: name,
            client_telephone: phone,
            client_adresse: address || null,
            note: note || null,
            articles: articlesForDB,
            total: this.getTotal()
        });

        // Save order to local history
        this.saveOrderHistory({
            date: new Date().toISOString(),
            name,
            phone,
            address,
            items: [...this.cart],
            total: this.getTotal()
        });

        // Clear cart and close modals
        this.clearCart();
        this.closeOrderModal();
        this.closeCart();
    }

    // Sauvegarder la commande dans la base de données via l'API
    async saveOrderToDatabase(orderData) {
        try {
            const response = await fetch('/api/commandes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('Commande sauvegardée en base:', result.commande);
            } else {
                console.error('Erreur sauvegarde commande:', result.message);
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi de la commande à l\'API:', error);
        }
    }

    saveOrderHistory(order) {
        const HISTORY_KEY = 'rd-order-history';
        try {
            const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
            history.unshift(order);
            // Keep only last 50 orders
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
        } catch (e) {
            console.error('Erreur sauvegarde historique:', e);
        }
    }
}

// Global cart instance
let cartManager;

// =====================================================
// THEME MANAGEMENT
// =====================================================
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem('rd-theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            // Thème clair par défaut
            document.documentElement.setAttribute('data-theme', 'light');
        }

        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggle());
        }
    }

    toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        
        // Basculer simplement entre light et dark
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('rd-theme', newTheme);
    }
}

// =====================================================
// HEADER SCROLL EFFECT
// =====================================================
class HeaderController {
    constructor() {
        this.header = document.getElementById('header');
        this.lastScroll = 0;
        this.init();
    }

    init() {
        if (!this.header) return;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }

            this.lastScroll = currentScroll;
        }, { passive: true });
    }
}

// =====================================================
// HERO CAROUSEL
// =====================================================
class HeroCarousel {
    constructor(products) {
        this.track = document.getElementById('carouselTrack');
        this.dotsContainer = document.getElementById('carouselDots');
        this.prevBtn = document.getElementById('carouselPrev');
        this.nextBtn = document.getElementById('carouselNext');
        
        this.currentIndex = 0;
        this.slides = [];
        this.dots = [];
        this.autoplayTimer = null;
        this.isAnimating = false;
        this.products = products;

        if (this.track && this.products && this.products.length > 0) {
            this.init();
        }
    }

    init() {
        // Clear existing content
        this.track.innerHTML = '';
        if (this.dotsContainer) this.dotsContainer.innerHTML = '';
        this.dots = [];
        
        // Use first 5 products for carousel
        const carouselProducts = this.products.slice(0, 5);
        
        // Create slides
        carouselProducts.forEach((product, index) => {
            this.createSlide(product, index);
        });

        // Create dots
        this.createDots(carouselProducts.length);

        // Set initial state
        this.slides = this.track.querySelectorAll('.carousel-slide');
        this.goToSlide(0, false);

        // Event listeners
        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prev());
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());

        // Touch/swipe support
        this.initTouchEvents();

        // Start autoplay
        this.startAutoplay();

        // Pause on hover (desktop)
        this.track.parentElement.addEventListener('mouseenter', () => this.stopAutoplay());
        this.track.parentElement.addEventListener('mouseleave', () => this.startAutoplay());
    }

    createSlide(product, index) {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.innerHTML = `
            <div class="carousel-slide-placeholder">
                <svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                </svg>
            </div>
            ${product.images && product.images[0] ? `<img class="carousel-slide-image" src="${product.images[0]}" alt="${product.titre}">` : ''}
            <div class="carousel-slide-overlay"></div>
            <div class="carousel-slide-content">
                <span class="carousel-slide-tag">${product.categorie || 'Premium'}</span>
                <h2 class="carousel-slide-title">${product.titre}</h2>
                <p class="carousel-slide-price">${formatPrix(product.prix)}</p>
                <a href="${product.lien}" class="carousel-slide-btn">Découvrir</a>
            </div>
        `;
        this.track.appendChild(slide);
    }

    createDots(count) {
        if (!this.dotsContainer) return;
        
        for (let i = 0; i < count; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot';
            dot.setAttribute('aria-label', `Slide ${i + 1}`);
            dot.addEventListener('click', () => this.goToSlide(i));
            this.dotsContainer.appendChild(dot);
            this.dots.push(dot);
        }
    }

    goToSlide(index, animate = true) {
        if (this.isAnimating || this.slides.length === 0) return;
        
        this.isAnimating = true;
        this.currentIndex = index;

        const offset = -index * 100;
        this.track.style.transition = animate ? 'transform 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';
        this.track.style.transform = `translateX(${offset}%)`;

        this.slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });

        this.dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        setTimeout(() => {
            this.isAnimating = false;
        }, animate ? 600 : 0);
    }

    next() {
        if (this.slides.length === 0) return;
        const nextIndex = (this.currentIndex + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }

    prev() {
        if (this.slides.length === 0) return;
        const prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevIndex);
    }

    startAutoplay() {
        this.stopAutoplay();
        this.autoplayTimer = setInterval(() => this.next(), CONFIG.autoplayInterval);
    }

    stopAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
    }

    initTouchEvents() {
        let startX = 0;
        let startY = 0;
        let isDragging = false;

        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
            this.stopAutoplay();
        }, { passive: true });

        this.track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const diffX = e.touches[0].clientX - startX;
            const diffY = e.touches[0].clientY - startY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                e.preventDefault();
            }
        }, { passive: false });

        this.track.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;

            const endX = e.changedTouches[0].clientX;
            const diffX = endX - startX;

            if (Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.prev();
                } else {
                    this.next();
                }
            }

            this.startAutoplay();
        }, { passive: true });
    }
}

// =====================================================
// PRODUCT CARD CREATOR
// =====================================================
function createProductCard(product, animationDelay = 0) {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.style.transitionDelay = `${animationDelay}ms`;
    
    const hasImage = product.images && product.images[0];
    const boutiqueNom = product.boutique_nom || product.vendeur_nom || '';
    
    card.innerHTML = `
        <div class="product-card-image">
            ${hasImage ? `<img src="${product.images[0]}" alt="${product.titre}" loading="lazy">` : ''}
            ${!hasImage ? `
            <div class="product-card-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                </svg>
            </div>
            ` : ''}
        </div>
        <div class="product-card-content">
            <h3 class="product-card-title">${product.titre}</h3>
            <p class="product-card-price">${formatPrix(product.prix)}</p>
            ${boutiqueNom ? `<p class="product-card-boutique"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> ${boutiqueNom}</p>` : ''}
            <p class="product-card-desc">${product.description ? product.description.substring(0, 80) + '...' : ''}</p>
            <div class="product-card-actions">
                <button class="btn-add-cart" data-id="${product.id}" aria-label="Ajouter au panier">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"/>
                        <circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    Ajouter
                </button>
            </div>
        </div>
    `;

    // Click on card to view product (except add to cart button)
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.btn-add-cart')) {
            window.location.href = product.lien;
        }
    });

    // Add to cart button
    const addBtn = card.querySelector('.btn-add-cart');
    addBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (cartManager) {
            cartManager.addItem(product);
        }
    });

    setTimeout(() => {
        card.classList.add('visible');
    }, 100 + animationDelay);

    return card;
}

// =====================================================
// FEATURED PRODUCTS (Home Page)
// =====================================================
function initFeaturedProducts(products) {
    const container = document.getElementById('featuredProducts');
    if (!container || !products || products.length === 0) return;

    // Clear existing content
    container.innerHTML = '';

    // Show first 4 products
    const featuredProducts = products.slice(0, 4);
    
    featuredProducts.forEach((product, index) => {
        const card = createProductCard(product, index * CONFIG.animationDelay);
        container.appendChild(card);
    });
}

// =====================================================
// CATALOGUE PAGE - Infinite Scroll
// =====================================================
let catalogueLoadedCount = 0;
let isLoading = false;
let catalogueProducts = [];

function _initCatalogue(products) {
    console.log('_initCatalogue appelé avec', products ? products.length : 0, 'produits');
    const container = document.getElementById('catalogueGrid');
    const countElement = document.getElementById('productCount');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    if (!container || !products) return;

    // Store products reference
    catalogueProducts = products;

    // Reset
    catalogueLoadedCount = 0;
    container.innerHTML = '';

    // Update count
    if (countElement) {
        countElement.textContent = `${products.length} produits`;
    }

    // Load initial products
    loadMoreProducts();

    // Infinite scroll
    window.addEventListener('scroll', handleScroll, { passive: true });

    function handleScroll() {
        if (isLoading) return;
        
        const scrollPosition = window.innerHeight + window.scrollY;
        const threshold = document.body.offsetHeight - 500;

        if (scrollPosition >= threshold) {
            loadMoreProducts();
        }
    }

    function loadMoreProducts() {
        if (catalogueLoadedCount >= catalogueProducts.length) return;

        isLoading = true;
        if (loadingIndicator) loadingIndicator.style.display = 'flex';

        setTimeout(() => {
            const startIndex = catalogueLoadedCount;
            const endIndex = Math.min(startIndex + CONFIG.itemsPerLoad, catalogueProducts.length);
            
            for (let i = startIndex; i < endIndex; i++) {
                const product = catalogueProducts[i];
                const delay = (i - startIndex) * CONFIG.animationDelay;
                const card = createProductCard(product, delay);
                container.appendChild(card);
            }

            catalogueLoadedCount = endIndex;
            isLoading = false;
            
            if (loadingIndicator) {
                loadingIndicator.style.display = catalogueLoadedCount >= catalogueProducts.length ? 'none' : 'flex';
            }
        }, 300);
    }
}

// =====================================================
// PRODUCT DETAIL PAGE
// =====================================================
function _initProductDetail(products) {
    console.log('_initProductDetail appelé avec', products ? products.length : 0, 'produits');
    if (!products || products.length === 0) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id')) || 1;

    const product = products.find(p => p.id === productId) || products[0];
    console.log('Produit trouvé:', product);

    const titleEl = document.getElementById('productTitle');
    const priceEl = document.getElementById('productPrice');
    const descEl = document.getElementById('productDescription');
    const tagEl = document.getElementById('productTag');
    const boutiqueEl = document.getElementById('productBoutique');
    const whatsappBtn = document.getElementById('whatsappBtn');
    const addToCartBtn = document.getElementById('addToCartBtn');
    const mainImageContainer = document.getElementById('productMainImage');
    const thumbsContainer = document.getElementById('productThumbs');

    if (titleEl) titleEl.textContent = product.titre;
    if (priceEl) priceEl.textContent = formatPrix(product.prix);
    if (descEl) descEl.innerHTML = `<p>${product.description || ''}</p>`;
    if (tagEl) tagEl.textContent = product.categorie || 'Premium';
    
    // Afficher le nom de la boutique
    const boutiqueNom = product.boutique_nom || product.vendeur_nom || '';
    if (boutiqueEl && boutiqueNom) {
        boutiqueEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> Vendu par <strong>${boutiqueNom}</strong>`;
        boutiqueEl.style.display = 'flex';
    } else if (boutiqueEl) {
        boutiqueEl.style.display = 'none';
    }

    document.title = `${product.titre} | RD Store`;

    // Gérer les images
    console.log('Images du produit:', product.images, 'Type:', typeof product.images, 'Longueur:', product.images ? product.images.length : 0);
    if (product.images && product.images.length > 0) {
        // Image principale
        if (mainImageContainer) {
            const mainImg = document.createElement('img');
            mainImg.src = product.images[0];
            mainImg.alt = product.titre;
            mainImg.className = 'product-gallery-main-img';
            mainImageContainer.appendChild(mainImg);
            
            // Cacher le placeholder
            const placeholder = mainImageContainer.querySelector('.product-gallery-placeholder');
            if (placeholder) placeholder.style.display = 'none';
        }
        
        // Miniatures
        if (thumbsContainer) {
            thumbsContainer.innerHTML = '';
            product.images.forEach((imgUrl, index) => {
                const thumb = document.createElement('button');
                thumb.className = `product-thumb ${index === 0 ? 'active' : ''}`;
                thumb.dataset.index = index;
                thumb.innerHTML = `<img src="${imgUrl}" alt="${product.titre} - Image ${index + 1}">`;
                
                thumb.addEventListener('click', () => {
                    // Changer l'image principale
                    const mainImg = mainImageContainer.querySelector('img');
                    if (mainImg) mainImg.src = imgUrl;
                    
                    // Mettre à jour la classe active
                    thumbsContainer.querySelectorAll('.product-thumb').forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                });
                
                thumbsContainer.appendChild(thumb);
            });
        }
    }

    // Add to cart button
    if (addToCartBtn && cartManager) {
        addToCartBtn.addEventListener('click', () => {
            cartManager.addItem(product);
            addToCartBtn.classList.add('added');
            addToCartBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                Ajouté au panier
            `;
            setTimeout(() => {
                addToCartBtn.classList.remove('added');
                addToCartBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"/>
                        <circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    Ajouter au panier
                `;
            }, 2000);
        });
    }

    // Vérifier si le vendeur a un site externe
    const vendeurSiteUrl = product.vendeur_site_url;
    
    if (vendeurSiteUrl && whatsappBtn) {
        // Remplacer le bouton WhatsApp par Commander
        whatsappBtn.className = 'btn-commander-external';
        whatsappBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Commander sur le site du vendeur
        `;
        whatsappBtn.href = '#';
        whatsappBtn.removeAttribute('target');
        
        // Ouvrir le modal au clic
        whatsappBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openExternalOrderModal(product, vendeurSiteUrl);
        });
    } else if (whatsappBtn) {
        const message = encodeURIComponent(`Bonjour, je suis intéressé par ${product.titre} à ${formatPrix(product.prix)} disponible via ce lien ${window.location.href}. Pouvez-vous me donner plus d'informations ?`);
        whatsappBtn.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${message}`;
    }

    loadRelatedProducts(productId, products);
}

// =====================================================
// EXTERNAL ORDER MODAL
// =====================================================
function openExternalOrderModal(product, vendeurSiteUrl) {
    const modalOverlay = document.getElementById('externalOrderModalOverlay');
    const productInfo = document.getElementById('externalOrderProduct');
    
    if (!modalOverlay || !productInfo) return;
    
    // Afficher les infos du produit
    const hasImage = product.images && product.images[0];
    productInfo.innerHTML = `
        <div class="external-product-image">
            ${hasImage ? `<img src="${product.images[0]}" alt="${product.titre}">` : ''}
        </div>
        <div class="external-product-details">
            <h4>${product.titre}</h4>
            <p class="external-product-price">${formatPrix(product.prix)}</p>
            <p class="external-product-boutique">Vendu par: ${product.boutique_nom || product.vendeur_nom || 'Vendeur'}</p>
        </div>
    `;
    
    // Stocker les infos pour la soumission
    modalOverlay.dataset.productId = product.id;
    modalOverlay.dataset.productTitre = product.titre;
    modalOverlay.dataset.productPrix = product.prix;
    modalOverlay.dataset.vendeurSiteUrl = vendeurSiteUrl;
    modalOverlay.dataset.boutiquenom = product.boutique_nom || '';
    
    modalOverlay.classList.add('active');
    
    // Initialiser les événements du modal
    initExternalOrderModalEvents();
}

function closeExternalOrderModal() {
    const modalOverlay = document.getElementById('externalOrderModalOverlay');
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
        // Réinitialiser le formulaire
        const form = document.getElementById('externalOrderForm');
        if (form) form.reset();
    }
}

function initExternalOrderModalEvents() {
    const modalOverlay = document.getElementById('externalOrderModalOverlay');
    const closeBtn = document.getElementById('externalOrderModalClose');
    const cancelBtn = document.getElementById('btnCancelExternalOrder');
    const form = document.getElementById('externalOrderForm');
    
    // Fermer le modal
    closeBtn?.addEventListener('click', closeExternalOrderModal);
    cancelBtn?.addEventListener('click', closeExternalOrderModal);
    modalOverlay?.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeExternalOrderModal();
    });
    
    // Soumettre la commande
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nom = document.getElementById('externalOrderNom').value.trim();
        const telephone = document.getElementById('externalOrderTel').value.trim();
        
        if (!nom || !telephone) {
            alert('Veuillez remplir tous les champs');
            return;
        }
        
        const productId = modalOverlay.dataset.productId;
        const productTitre = modalOverlay.dataset.productTitre;
        const productPrix = modalOverlay.dataset.productPrix;
        const vendeurSiteUrl = modalOverlay.dataset.vendeurSiteUrl;
        const boutiqueNom = modalOverlay.dataset.boutiquenom;
        
        // Enregistrer la commande avec statut "redirigé"
        try {
            const response = await fetch('/api/commandes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_nom: nom,
                    client_telephone: telephone,
                    client_adresse: '',
                    note: `Commande redirigée vers le site du vendeur: ${boutiqueNom} (${vendeurSiteUrl})`,
                    articles: [{
                        id: parseInt(productId),
                        titre: productTitre,
                        prix: cartManager ? cartManager.parsePrice(productPrix) : 0,
                        quantity: 1
                    }],
                    total: cartManager ? cartManager.parsePrice(productPrix) : 0,
                    statut: 'redirige'
                })
            });
            
            if (response.ok) {
                console.log('Commande redirigée enregistrée');
            }
        } catch (error) {
            console.error('Erreur enregistrement commande:', error);
        }
        
        // Fermer le modal et rediriger vers le site du vendeur
        closeExternalOrderModal();
        window.open(vendeurSiteUrl, '_blank');
    });
}

function initGalleryThumbs() {
    const thumbs = document.querySelectorAll('.product-thumb');

    thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            thumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
    });
}

function loadRelatedProducts(currentId, products) {
    const container = document.getElementById('relatedProducts');
    if (!container || !products) return;

    container.innerHTML = '';

    const relatedProducts = products
        .filter(p => p.id !== currentId)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);

    relatedProducts.forEach((product, index) => {
        const card = createProductCard(product, index * CONFIG.animationDelay);
        container.appendChild(card);
    });
}

// =====================================================
// BACK TO TOP BUTTON
// =====================================================
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// =====================================================
// SCROLL ANIMATIONS
// =====================================================
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// =====================================================
// INITIALIZATION
// =====================================================
async function initApp() {
    console.log('Initialisation de l\'application...');
    
    // Core functionality (ne dépend pas des produits)
    new ThemeManager();
    new HeaderController();
    initBackToTop();
    initScrollAnimations();
    
    // Initialize cart
    cartManager = new CartManager();

    // Charger les produits depuis l'API
    productsData = await getProductsData();
    console.log('Produits chargés:', productsData.length);

    // Initialiser le carousel avec les produits
    new HeroCarousel(productsData);
    
    // Featured products (page accueil)
    initFeaturedProducts(productsData);

    // Exposer les fonctions pour les pages spécifiques
    window.productsData = productsData;
    window.cartManager = cartManager;
}
//fonction de recherche de produits
function searchProducts(query, products) {
    const lowerQuery = query.toLowerCase();
    return products.filter(product => 
        product.titre.toLowerCase().includes(lowerQuery) ||
        (product.description && product.description.toLowerCase().includes(lowerQuery)) ||
        (product.categorie && product.categorie.toLowerCase().includes(lowerQuery))
    );
}
//appliquer la recherche

// Démarrer l'application
document.addEventListener('DOMContentLoaded', initApp);

// Fonctions globales pour les pages spécifiques
window.initCatalogue = function() {
    console.log('window.initCatalogue appelé');
    if (window.productsData && window.productsData.length > 0) {
        _initCatalogue(window.productsData);
    } else {
        // Attendre que les produits soient chargés
        const checkProducts = setInterval(() => {
            if (window.productsData && window.productsData.length > 0) {
                clearInterval(checkProducts);
                _initCatalogue(window.productsData);
            }
        }, 100);
    }
};

window.initProductDetail = function() {
    console.log('window.initProductDetail appelé');
    if (window.productsData && window.productsData.length > 0) {
        _initProductDetail(window.productsData);
    } else {
        const checkProducts = setInterval(() => {
            if (window.productsData && window.productsData.length > 0) {
                clearInterval(checkProducts);
                _initProductDetail(window.productsData);
            }
        }, 100);
    }
};
