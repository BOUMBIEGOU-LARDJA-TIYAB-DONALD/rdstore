/**
 * CDP Store - Admin Panel JavaScript
 * Gestion des produits CRUD
 */

// =====================================================
// PRODUCTS DATA - Synchronisé avec localStorage
// =====================================================
const defaultProducts = [
    {
        id: 1,
        titre: "iPhone 15 Pro Max",
        prix: "850 000 FCFA",
        description: "Le summum de l'innovation Apple. Écran Super Retina XDR 6,7 pouces, puce A17 Pro révolutionnaire, système de caméra professionnelle avec zoom optique 5x. Titane de qualité aérospatiale pour une durabilité exceptionnelle.",
        lien: "product?id=1",
        images: [],
        categorie: "Smartphones"
    },
    {
        id: 2,
        titre: "MacBook Pro 16\" M3 Max",
        prix: "2 500 000 FCFA",
        description: "La puissance ultime pour les créatifs. Puce Apple M3 Max, jusqu'à 128 Go de mémoire unifiée, écran Liquid Retina XDR. Autonomie exceptionnelle de 22 heures.",
        lien: "product?id=2",
        images: [],
        categorie: "Ordinateurs"
    },
    {
        id: 3,
        titre: "Samsung Galaxy S24 Ultra",
        prix: "750 000 FCFA",
        description: "L'excellence Android redéfinie. Écran QHD+ 6,8 pouces, processeur Snapdragon 8 Gen 3, caméra 200MP avec zoom spatial 100x. Intelligence artificielle Galaxy AI intégrée.",
        lien: "product?id=3",
        images: [],
        categorie: "Smartphones"
    },
    {
        id: 4,
        titre: "Sony WH-1000XM5",
        prix: "280 000 FCFA",
        description: "La référence mondiale de la réduction de bruit. Audio haute résolution, 30 heures d'autonomie, confort exceptionnel. Multipoint Bluetooth pour une connexion simultanée à deux appareils.",
        lien: "product?id=4",
        images: [],
        categorie: "Audio"
    },
    {
        id: 5,
        titre: "iPad Pro 12.9\" M2",
        prix: "980 000 FCFA",
        description: "La tablette la plus puissante au monde. Écran Liquid Retina XDR avec ProMotion, puce M2, compatible Apple Pencil 2e génération. Parfait pour les professionnels créatifs.",
        lien: "product?id=5",
        images: [],
        categorie: "Tablettes"
    },
    {
        id: 6,
        titre: "AirPods Pro 2",
        prix: "180 000 FCFA",
        description: "Audio adaptatif révolutionnaire. Réduction active du bruit 2x plus efficace, mode Transparence, audio spatial personnalisé. Boîtier de charge MagSafe avec haut-parleur intégré.",
        lien: "product?id=6",
        images: [],
        categorie: "Audio"
    },
    {
        id: 7,
        titre: "Apple Watch Ultra 2",
        prix: "550 000 FCFA",
        description: "Conçue pour l'extrême. Boîtier en titane 49mm, écran toujours actif le plus lumineux, GPS double fréquence de précision. Résistante jusqu'à 100m de profondeur.",
        lien: "product?id=7",
        images: [],
        categorie: "Montres"
    },
    {
        id: 8,
        titre: "Samsung Galaxy Tab S9 Ultra",
        prix: "850 000 FCFA",
        description: "L'écran le plus immersif. Dynamic AMOLED 2X de 14,6 pouces, S Pen inclus, résistance à l'eau IP68. Processeur Snapdragon 8 Gen 2 pour Galaxy.",
        lien: "product?id=8",
        images: [],
        categorie: "Tablettes"
    },
    {
        id: 9,
        titre: "DJI Mavic 3 Pro",
        prix: "1 200 000 FCFA",
        description: "Le drone professionnel ultime. Triple caméra Hasselblad, capteur 4/3 CMOS, autonomie de 43 minutes. Détection d'obstacles omnidirectionnelle pour des vols en toute sécurité.",
        lien: "product?id=9",
        images: [],
        categorie: "Drones"
    },
    {
        id: 10,
        titre: "Sony Alpha A7 IV",
        prix: "1 800 000 FCFA",
        description: "L'hybride plein format nouvelle génération. Capteur 33 Mpx, vidéo 4K 60p, autofocus en temps réel. Stabilisation 5 axes intégrée au boîtier.",
        lien: "product?id=10",
        images: [],
        categorie: "Photo"
    },
    {
        id: 11,
        titre: "Bose QuietComfort Ultra",
        prix: "320 000 FCFA",
        description: "Son immersif sans compromis. Technologie CustomTune pour un audio personnalisé, mode Immersion spatiale, annulation de bruit de classe mondiale.",
        lien: "product?id=11",
        images: [],
        categorie: "Audio"
    },
    {
        id: 12,
        titre: "PlayStation 5 Pro",
        prix: "450 000 FCFA",
        description: "La nouvelle ère du gaming. GPU amélioré pour le ray-tracing, SSD ultra-rapide 2To, compatibilité 8K. Manette DualSense avec retour haptique.",
        lien: "product?id=12",
        images: [],
        categorie: "Gaming"
    }
];

// =====================================================
// STORAGE MANAGER
// =====================================================
class StorageManager {
    static STORAGE_KEY = 'cdp-products';

    static getProducts() {
        // Retourne les produits du cache local immédiatement
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Erreur parsing cache:', e);
            }
        }
        // Fallback sur les produits par défaut
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultProducts));
        return defaultProducts;
    }

    static async fetchProductsFromAPI() {
        try {
            const response = await fetch("/api/products");
            
            if (response.ok) {
                const data = await response.json();
                console.log('Produits récupérés depuis l\'API:', data);
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
                return data;
            } else {
                throw new Error('API non disponible');
            }
        } catch (error) {
            console.error('Erreur API:', error);
            return null;
        }
    }

    static saveProducts(products) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products));
    }

    static getNextId(products) {
        if (products.length === 0) return 1;
        return Math.max(...products.map(p => p.id)) + 1;
    }
}

// =====================================================
// THEME MANAGER
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
        }

        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggle());
        }
    }

    toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('cdp-theme', newTheme);
    }
}

// =====================================================
// TOAST NOTIFICATION
// =====================================================
class Toast {
    static show(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastIcon = document.getElementById('toastIcon');
        const toastMessage = document.getElementById('toastMessage');

        // Set icon based on type
        if (type === 'success') {
            toastIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>`;
        } else {
            toastIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>`;
        }

        toastMessage.textContent = message;
        toast.className = `toast ${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// =====================================================
// ADMIN PANEL MANAGER
// =====================================================
class AdminPanel {
    constructor() {
        this.products = StorageManager.getProducts();
        this.currentEditId = null;
        this.deleteProductId = null;
        
        this.initElements();
        this.initEvents();
        this.render();
        
        // Charger les produits depuis l'API en arrière-plan
        this.loadFromAPI();
    }

    async loadFromAPI() {
        const apiProducts = await StorageManager.fetchProductsFromAPI();
        if (apiProducts && apiProducts.length > 0) {
            this.products = apiProducts;
            this.render();
        }
    }

    initElements() {
        // Table
        this.tableBody = document.getElementById('productsTableBody');
        this.tableEmpty = document.getElementById('tableEmpty');
        this.searchInput = document.getElementById('searchProducts');
        
        // Stats
        this.totalProducts = document.getElementById('totalProducts');
        this.totalCategories = document.getElementById('totalCategories');
        
        // Modal Add/Edit
        this.modalOverlay = document.getElementById('modalOverlay');
        this.modal = document.getElementById('productModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.productForm = document.getElementById('productForm');
        this.btnAddProduct = document.getElementById('btnAddProduct');
        this.btnCancel = document.getElementById('btnCancel');
        this.modalClose = document.getElementById('modalClose');
        this.btnSubmitText = document.getElementById('btnSubmitText');
        
        // Form fields
        this.productId = document.getElementById('productId');
        this.productTitre = document.getElementById('productTitre');
        this.productPrix = document.getElementById('productPrix');
        this.productCategorie = document.getElementById('productCategorie');
        this.productDescription = document.getElementById('productDescription');
        this.productImages = document.getElementById('productImages');
        
        // Modal Delete
        this.deleteModalOverlay = document.getElementById('deleteModalOverlay');
        this.deleteProductName = document.getElementById('deleteProductName');
        this.btnCancelDelete = document.getElementById('btnCancelDelete');
        this.btnConfirmDelete = document.getElementById('btnConfirmDelete');
        this.deleteModalClose = document.getElementById('deleteModalClose');
    }

    initEvents() {
        // Open Add Modal
        this.btnAddProduct.addEventListener('click', () => this.openAddModal());
        
        // Close Modals
        this.btnCancel.addEventListener('click', () => this.closeModal());
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) this.closeModal();
        });
        
        // Form Submit
        this.productForm.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Delete Modal
        this.btnCancelDelete.addEventListener('click', () => this.closeDeleteModal());
        this.deleteModalClose.addEventListener('click', () => this.closeDeleteModal());
        this.deleteModalOverlay.addEventListener('click', (e) => {
            if (e.target === this.deleteModalOverlay) this.closeDeleteModal();
        });
        this.btnConfirmDelete.addEventListener('click', () => this.confirmDelete());
        
        // Search
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeDeleteModal();
            }
        });
    }

    // =====================================================
    // MODAL MANAGEMENT
    // =====================================================
    openAddModal() {
        this.currentEditId = null;
        this.modalTitle.textContent = 'Ajouter un produit';
        this.btnSubmitText.textContent = 'Ajouter';
        this.productForm.reset();
        this.productId.value = '';
        this.modalOverlay.classList.add('active');
        this.productTitre.focus();
    }

    openEditModal(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        this.currentEditId = id;
        this.modalTitle.textContent = 'Modifier le produit';
        this.btnSubmitText.textContent = 'Enregistrer';
        
        // Fill form with product data
        this.productId.value = product.id;
        this.productTitre.value = product.titre;
        this.productPrix.value = product.prix;
        this.productCategorie.value = product.categorie;
        this.productDescription.value = product.description;
        this.productImages.value = product.images ? product.images.join('\n') : '';
        
        this.modalOverlay.classList.add('active');
        this.productTitre.focus();
    }

    closeModal() {
        this.modalOverlay.classList.remove('active');
        this.currentEditId = null;
        this.productForm.reset();
    }

    openDeleteModal(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        this.deleteProductId = id;
        this.deleteProductName.textContent = product.titre;
        this.deleteModalOverlay.classList.add('active');
    }

    closeDeleteModal() {
        this.deleteModalOverlay.classList.remove('active');
        this.deleteProductId = null;
    }

    // =====================================================
    // CRUD OPERATIONS
    // =====================================================
    handleSubmit(e) {
        e.preventDefault();
        
        const imagesText = this.productImages.value.trim();
        const images = imagesText ? imagesText.split('\n').map(url => url.trim()).filter(url => url) : [];
        
        const productData = {
            titre: this.productTitre.value.trim(),
            prix: this.productPrix.value.trim(),
            categorie: this.productCategorie.value.trim(),
            description: this.productDescription.value.trim(),
            images: images
        };

        if (this.currentEditId) {
            // Update existing product
            this.updateProduct(this.currentEditId, productData);
        } else {
            // Add new product
            this.addProduct(productData);
        }

        this.closeModal();
    }

    addProduct(data) {
        const newProduct = {
            id: StorageManager.getNextId(this.products),
            ...data,
            lien: `product?id=${StorageManager.getNextId(this.products)}`
        };
        
        this.products.push(newProduct);
        StorageManager.saveProducts(this.products);
        this.render();
        Toast.show('Produit ajouté avec succès');
        fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                titre: newProduct.titre,
                prix: newProduct.prix,
                description: newProduct.description,
                image: newProduct.images.join(';;;'),
                categorie: newProduct.categorie
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Produit ajouté sur le serveur avec ID:', data.productId);
        })
        .catch(error => {
            console.error('Erreur lors de l\'ajout du produit sur le serveur:', error);
        });

    }
    updateProduct(id, data) {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.products[index] = {
                ...this.products[index],
                ...data                                                                                
            };
            StorageManager.saveProducts(this.products);
            this.render();
            Toast.show('Produit modifié avec succès');
            fetch('/api/products', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: id,
                    titre: data.titre,
                    prix: data.prix,
                    description: data.description,
                    image: data.images.join(';;;'),
                    categorie: data.categorie
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Produit modifié sur le serveur avec ID:', id);
            })
            .catch(error => {
                console.error('Erreur lors de la modification du produit sur le serveur:', error);
            });
        }
    }

    confirmDelete() {
        if (this.deleteProductId) {
            let fid=this.deleteProductId;
            console.log('ID du produit à supprimer:', fid);
            this.products = this.products.filter(p => p.id !== this.deleteProductId);
            console.log('Suppression du produit avec ID:', this.deleteProductId);
            fetch('/api/products', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: this.deleteProductId })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Produit supprimé sur le serveur avec ID:', fid);
            })
            .catch(error => {
                console.error('Erreur lors de la suppression du produit sur le serveur:', error);
            });
            console.log('Produits après suppression:', this.products);
            StorageManager.saveProducts(this.products);
            this.closeDeleteModal();
            this.render();
            Toast.show('Produit supprimé avec succès');
        }
    }

    // =====================================================
    // SEARCH
    // =====================================================
    handleSearch(query) {
        const filtered = this.products.filter(p => 
            p.titre.toLowerCase().includes(query.toLowerCase()) ||
            p.categorie.toLowerCase().includes(query.toLowerCase()) ||
            p.prix.toLowerCase().includes(query.toLowerCase())
        );
        this.renderTable(filtered);
    }

    // =====================================================
    // RENDER
    // =====================================================
    render() {
        this.updateStats();
        this.renderTable(this.products);
    }

    updateStats() {
        this.totalProducts.textContent = this.products.length;
        const categories = [...new Set(this.products.map(p => p.categorie))];
        this.totalCategories.textContent = categories.length;
    }

    renderTable(products) {
        if (products.length === 0) {
            this.tableBody.innerHTML = '';
            this.tableEmpty.style.display = 'flex';
            return;
        }

        this.tableEmpty.style.display = 'none';
        
        this.tableBody.innerHTML = products.map(product => `
            <tr data-id="${product.id}">
                <td>${product.id}</td>
                <td>
                    <div class="table-product-image ${product.images && product.images.length > 0 ? '' : 'placeholder'}">
                        ${product.images && product.images.length > 0 
                            ? `<img src="${product.images[0]}" alt="${product.titre}">`
                            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                            </svg>`
                        }
                    </div>
                </td>
                <td>
                    <span class="table-product-title">${product.titre}</span>
                </td>
                <td>
                    <span class="table-product-price">${product.prix}</span>
                </td>
                <td>
                    <span class="table-product-category">${product.categorie}</span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="table-action-btn edit" onclick="adminPanel.openEditModal(${product.id})" title="Modifier">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="table-action-btn delete" onclick="adminPanel.openDeleteModal(${product.id})" title="Supprimer">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// =====================================================
// INITIALIZE
// =====================================================
// Exposer adminPanel globalement pour les onclick dans le HTML
window.adminPanel = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Theme Manager
    new ThemeManager();
    
    // Initialize Admin Panel
    window.adminPanel = new AdminPanel();
});
