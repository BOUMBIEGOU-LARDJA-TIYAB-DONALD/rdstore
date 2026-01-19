/**
 * RD Store - Vendeur Dashboard JavaScript
 * Gestion des produits du vendeur
 */

// =====================================================
// TOAST NOTIFICATION
// =====================================================
class Toast {
    static show(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastIcon = document.getElementById('toastIcon');
        const toastMessage = document.getElementById('toastMessage');

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
// VENDEUR DASHBOARD
// =====================================================
class VendeurDashboard {
    constructor() {
        this.vendeur = null;
        this.products = [];
        this.currentEditId = null;
        this.deleteProductId = null;

        this.init();
    }

    async init() {
        // Check authentication
        const token = localStorage.getItem('vendeur-token');
        if (!token) {
            window.location.href = '/rdvendeur-login';
            return;
        }

        // Load vendeur info
        await this.loadVendeurInfo();
        
        if (!this.vendeur) {
            return; // loadVendeurInfo handles redirect
        }

        this.initElements();
        this.initEvents();
        await this.loadProducts();
        this.updateUI();
    }

    async loadVendeurInfo() {
        const token = localStorage.getItem('vendeur-token');
        
        try {
            const response = await fetch('/api/vendeurs/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.vendeur = data.vendeur;
                localStorage.setItem('vendeur-info', JSON.stringify(this.vendeur));
            } else {
                // Token invalid
                localStorage.removeItem('vendeur-token');
                localStorage.removeItem('vendeur-info');
                window.location.href = '/rdvendeur-login';
            }
        } catch (error) {
            console.error('Erreur chargement vendeur:', error);
            // Try to use cached info
            const cached = localStorage.getItem('vendeur-info');
            if (cached) {
                this.vendeur = JSON.parse(cached);
            } else {
                window.location.href = '/rdvendeur-login';
            }
        }
    }

    initElements() {
        // Header elements
        this.vendeurAvatar = document.getElementById('vendeurAvatar');
        this.vendeurName = document.getElementById('vendeurName');
        this.boutiqueName = document.getElementById('boutiqueName');
        this.btnLogout = document.getElementById('btnLogout');

        // Status banner
        this.statusBanner = document.getElementById('statusBanner');
        this.statusTitle = document.getElementById('statusTitle');
        this.statusMessage = document.getElementById('statusMessage');

        // Stats
        this.statApproved = document.getElementById('statApproved');
        this.statPending = document.getElementById('statPending');
        this.statRejected = document.getElementById('statRejected');
        this.statViews = document.getElementById('statViews');

        // Products
        this.productsTableBody = document.getElementById('productsTableBody');
        this.productsEmpty = document.getElementById('productsEmpty');
        this.filterStatus = document.getElementById('filterStatus');
        this.btnAddProduct = document.getElementById('btnAddProduct');
        this.btnAddFirstProduct = document.getElementById('btnAddFirstProduct');

        // Product Modal
        this.productModalOverlay = document.getElementById('productModalOverlay');
        this.productModalTitle = document.getElementById('productModalTitle');
        this.productForm = document.getElementById('productForm');
        this.productModalClose = document.getElementById('productModalClose');
        this.btnCancelProduct = document.getElementById('btnCancelProduct');
        this.btnSubmitText = document.getElementById('btnSubmitText');

        // Form fields
        this.productId = document.getElementById('productId');
        this.productTitre = document.getElementById('productTitre');
        this.productPrix = document.getElementById('productPrix');
        this.productCategorie = document.getElementById('productCategorie');
        this.productDescription = document.getElementById('productDescription');
        this.productImages = document.getElementById('productImages');

        // Delete Modal
        this.deleteModalOverlay = document.getElementById('deleteModalOverlay');
        this.deleteProductName = document.getElementById('deleteProductName');
        this.deleteModalClose = document.getElementById('deleteModalClose');
        this.btnCancelDelete = document.getElementById('btnCancelDelete');
        this.btnConfirmDelete = document.getElementById('btnConfirmDelete');
    }

    initEvents() {
        // Logout
        this.btnLogout.addEventListener('click', () => this.logout());

        // Add product buttons
        this.btnAddProduct.addEventListener('click', () => this.openAddModal());
        this.btnAddFirstProduct.addEventListener('click', () => this.openAddModal());

        // Filter
        this.filterStatus.addEventListener('change', () => this.renderProducts());

        // Product Modal
        this.productModalClose.addEventListener('click', () => this.closeProductModal());
        this.btnCancelProduct.addEventListener('click', () => this.closeProductModal());
        this.productModalOverlay.addEventListener('click', (e) => {
            if (e.target === this.productModalOverlay) this.closeProductModal();
        });
        this.productForm.addEventListener('submit', (e) => this.handleProductSubmit(e));

        // Delete Modal
        this.deleteModalClose.addEventListener('click', () => this.closeDeleteModal());
        this.btnCancelDelete.addEventListener('click', () => this.closeDeleteModal());
        this.deleteModalOverlay.addEventListener('click', (e) => {
            if (e.target === this.deleteModalOverlay) this.closeDeleteModal();
        });
        this.btnConfirmDelete.addEventListener('click', () => this.confirmDelete());

        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeProductModal();
                this.closeDeleteModal();
            }
        });
    }

    updateUI() {
        if (!this.vendeur) return;

        // Update header
        const initials = this.vendeur.nom.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        this.vendeurAvatar.textContent = initials;
        this.vendeurName.textContent = this.vendeur.nom;
        this.boutiqueName.textContent = this.vendeur.boutique_nom;

        // Update status banner
        this.updateStatusBanner();

        // Enable/disable add buttons based on status
        const canAddProducts = this.vendeur.statut === 'actif';
        this.btnAddProduct.disabled = !canAddProducts;
        this.btnAddFirstProduct.disabled = !canAddProducts;
    }

    updateStatusBanner() {
        const status = this.vendeur.statut;
        
        this.statusBanner.className = 'status-banner ' + (status === 'actif' ? 'active' : status === 'suspendu' ? 'suspended' : 'pending');

        if (status === 'actif') {
            this.statusBanner.querySelector('.status-icon').innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>`;
            this.statusTitle.textContent = 'Compte actif';
            this.statusMessage.textContent = 'Votre compte est validé. Vous pouvez ajouter et gérer vos produits.';
        } else if (status === 'suspendu') {
            this.statusBanner.querySelector('.status-icon').innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>`;
            this.statusTitle.textContent = 'Compte suspendu';
            this.statusMessage.textContent = 'Votre compte a été suspendu. Contactez l\'administrateur pour plus d\'informations.';
        } else {
            this.statusBanner.querySelector('.status-icon').innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>`;
            this.statusTitle.textContent = 'Compte en attente de validation';
            this.statusMessage.textContent = 'Votre compte est en cours d\'examen par notre équipe. Vous pourrez ajouter des produits une fois validé.';
        }
    }

    // =====================================================
    // PRODUCTS LOADING
    // =====================================================
    async loadProducts() {
        const token = localStorage.getItem('vendeur-token');
        
        try {
            const response = await fetch('/api/vendeurs/produits', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.products = data.produits || [];
                this.updateStats();
                this.renderProducts();
            } else {
                Toast.show('Erreur chargement des produits', 'error');
            }
        } catch (error) {
            console.error('Erreur chargement produits:', error);
            Toast.show('Erreur de connexion', 'error');
        }
    }

    updateStats() {
        const approved = this.products.filter(p => p.statut_validation === 'approuve').length;
        const pending = this.products.filter(p => p.statut_validation === 'en_attente').length;
        const rejected = this.products.filter(p => p.statut_validation === 'refuse').length;
        const views = this.products.reduce((sum, p) => sum + (p.vues || 0), 0);

        this.statApproved.textContent = approved;
        this.statPending.textContent = pending;
        this.statRejected.textContent = rejected;
        this.statViews.textContent = views;
    }

    renderProducts() {
        let filtered = this.products;
        
        // Apply filter
        const filterValue = this.filterStatus.value;
        if (filterValue) {
            filtered = this.products.filter(p => p.statut_validation === filterValue);
        }

        if (filtered.length === 0) {
            this.productsTableBody.innerHTML = '';
            this.productsEmpty.style.display = 'flex';
            return;
        }

        this.productsEmpty.style.display = 'none';

        this.productsTableBody.innerHTML = filtered.map(product => {
            const images = product.images || (product.image ? product.image.split(';;;') : []);
            const statusLabel = {
                'en_attente': 'En attente',
                'approuve': 'Approuvé',
                'refuse': 'Refusé'
            }[product.statut_validation] || 'En attente';

            return `
                <tr data-id="${product.id}">
                    <td>
                        <div class="table-product-image ${images.length > 0 ? '' : 'placeholder'}">
                            ${images.length > 0 
                                ? `<img src="${images[0]}" alt="${product.titre}">`
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
                        <span class="product-status ${product.statut_validation}">${statusLabel}</span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="table-action-btn edit" onclick="vendeurDashboard.openEditModal(${product.id})" title="Modifier">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </button>
                            <button class="table-action-btn delete" onclick="vendeurDashboard.openDeleteModal(${product.id})" title="Supprimer">
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
            `;
        }).join('');
    }

    // =====================================================
    // MODAL MANAGEMENT
    // =====================================================
    openAddModal() {
        if (this.vendeur.statut !== 'actif') {
            Toast.show('Votre compte doit être validé pour ajouter des produits', 'error');
            return;
        }

        this.currentEditId = null;
        this.productModalTitle.textContent = 'Ajouter un produit';
        this.btnSubmitText.textContent = 'Soumettre';
        this.productForm.reset();
        this.productId.value = '';
        this.productModalOverlay.classList.add('active');
        this.productTitre.focus();
    }

    openEditModal(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        this.currentEditId = id;
        this.productModalTitle.textContent = 'Modifier le produit';
        this.btnSubmitText.textContent = 'Enregistrer';

        this.productId.value = product.id;
        this.productTitre.value = product.titre;
        this.productPrix.value = product.prix;
        this.productCategorie.value = product.categorie;
        this.productDescription.value = product.description;
        
        const images = product.images || (product.image ? product.image.split(';;;') : []);
        this.productImages.value = images.join('\n');

        this.productModalOverlay.classList.add('active');
        this.productTitre.focus();
    }

    closeProductModal() {
        this.productModalOverlay.classList.remove('active');
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
    async handleProductSubmit(e) {
        e.preventDefault();

        const imagesText = this.productImages.value.trim();
        const images = imagesText ? imagesText.split('\n').map(url => url.trim()).filter(url => url) : [];

        const productData = {
            titre: this.productTitre.value.trim(),
            prix: this.productPrix.value.trim(),
            categorie: this.productCategorie.value,
            description: this.productDescription.value.trim(),
            images: images
        };

        const token = localStorage.getItem('vendeur-token');

        try {
            let response;
            
            if (this.currentEditId) {
                // Update
                response = await fetch('/api/vendeurs/produits', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ id: this.currentEditId, ...productData })
                });
            } else {
                // Create
                response = await fetch('/api/vendeurs/produits', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(productData)
                });
            }

            const data = await response.json();

            if (response.ok && data.success) {
                Toast.show(this.currentEditId ? 'Produit modifié avec succès' : 'Produit soumis pour validation');
                this.closeProductModal();
                await this.loadProducts();
            } else {
                Toast.show(data.message || 'Erreur lors de l\'opération', 'error');
            }
        } catch (error) {
            console.error('Erreur produit:', error);
            Toast.show('Erreur de connexion', 'error');
        }
    }

    async confirmDelete() {
        if (!this.deleteProductId) return;

        const token = localStorage.getItem('vendeur-token');

        try {
            const response = await fetch('/api/vendeurs/produits', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id: this.deleteProductId })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                Toast.show('Produit supprimé avec succès');
                this.closeDeleteModal();
                await this.loadProducts();
            } else {
                Toast.show(data.message || 'Erreur lors de la suppression', 'error');
            }
        } catch (error) {
            console.error('Erreur suppression:', error);
            Toast.show('Erreur de connexion', 'error');
        }
    }

    // =====================================================
    // LOGOUT
    // =====================================================
    logout() {
        localStorage.removeItem('vendeur-token');
        localStorage.removeItem('vendeur-info');
        window.location.href = '/rdvendeur-login';
    }
}

// =====================================================
// INITIALIZE
// =====================================================
let vendeurDashboard = null;

document.addEventListener('DOMContentLoaded', () => {
    vendeurDashboard = new VendeurDashboard();
});
