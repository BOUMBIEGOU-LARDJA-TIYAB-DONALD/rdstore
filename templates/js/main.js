/**
 * CDP Store - Main JavaScript
 * Premium Electronics E-commerce
 * Mobile First | Luxury Design
 */

// =====================================================
// PRODUCTS DATA - Synchronisé avec l'API
// =====================================================
let productsData = [];

// Récupérer les produits depuis l'API
async function getProductsData() {
    const STORAGE_KEY = 'cdp-products';
    
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
// THEME MANAGEMENT
// =====================================================
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem('cdp-theme');
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
        localStorage.setItem('cdp-theme', newTheme);
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
                <p class="carousel-slide-price">${product.prix}</p>
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
            <p class="product-card-price">${product.prix}</p>
            <p class="product-card-desc">${product.description ? product.description.substring(0, 80) + '...' : ''}</p>
        </div>
    `;

    card.addEventListener('click', () => {
        window.location.href = product.lien;
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
    const whatsappBtn = document.getElementById('whatsappBtn');
    const mainImageContainer = document.getElementById('productMainImage');
    const thumbsContainer = document.getElementById('productThumbs');

    if (titleEl) titleEl.textContent = product.titre;
    if (priceEl) priceEl.textContent = product.prix;
    if (descEl) descEl.innerHTML = `<p>${product.description || ''}</p>`;
    if (tagEl) tagEl.textContent = product.categorie || 'Premium';

    document.title = `${product.titre} | CDP Store`;

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

    if (whatsappBtn) {
        const message = encodeURIComponent(`Bonjour, je suis intéressé par ${product.titre} à ${product.prix} disponible via ce lien ${window.location.href}. Pouvez-vous me donner plus d'informations ?`);
        whatsappBtn.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${message}`;
    }

    loadRelatedProducts(productId, products);
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

    // Charger les produits depuis l'API
    productsData = await getProductsData();
    console.log('Produits chargés:', productsData.length);

    // Initialiser le carousel avec les produits
    new HeroCarousel(productsData);
    
    // Featured products (page accueil)
    initFeaturedProducts(productsData);

    // Exposer les fonctions pour les pages spécifiques
    window.productsData = productsData;
}

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
