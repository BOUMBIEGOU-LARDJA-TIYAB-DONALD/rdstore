/**
 * RD Store - Vendeur Authentication JavaScript
 * Gestion connexion/inscription vendeur
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
// AUTH MANAGER
// =====================================================
class VendeurAuth {
    constructor() {
        this.initElements();
        this.initEvents();
        this.checkExistingSession();
    }

    initElements() {
        // Tabs
        this.tabs = document.querySelectorAll('.auth-tab');
        this.panels = document.querySelectorAll('.auth-panel');
        this.switchButtons = document.querySelectorAll('[data-switch]');

        // Forms
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');

        // Password toggles
        this.passwordToggles = document.querySelectorAll('.toggle-password');
    }

    initEvents() {
        // Tab switching
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        this.switchButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.switch));
        });

        // Form submissions
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));

        // Password visibility toggle
        this.passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', () => this.togglePassword(toggle));
        });
    }

    // Check if user already has a session
    checkExistingSession() {
        const token = localStorage.getItem('vendeur-token');
        if (token) {
            // Verify token is still valid
            this.verifyToken(token);
        }
    }

    async verifyToken(token) {
        try {
            const response = await fetch('/api/vendeurs/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Token valid, redirect to dashboard
                window.location.href = '/rdvendeur';
            } else {
                // Token invalid, clear it
                localStorage.removeItem('vendeur-token');
            }
        } catch (error) {
            console.error('Erreur vérification token:', error);
        }
    }

    switchTab(tabName) {
        // Update tabs
        this.tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update panels
        this.panels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}Panel`);
        });
    }

    togglePassword(toggle) {
        const wrapper = toggle.closest('.password-input-wrapper');
        const input = wrapper.querySelector('input');
        const eyeOpen = toggle.querySelector('.eye-open');
        const eyeClosed = toggle.querySelector('.eye-closed');

        if (input.type === 'password') {
            input.type = 'text';
            eyeOpen.style.display = 'none';
            eyeClosed.style.display = 'block';
        } else {
            input.type = 'password';
            eyeOpen.style.display = 'block';
            eyeClosed.style.display = 'none';
        }
    }

    // =====================================================
    // LOGIN
    // =====================================================
    async handleLogin(e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            Toast.show('Veuillez remplir tous les champs', 'error');
            return;
        }

        const submitBtn = this.loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Connexion...</span>';

        try {
            const response = await fetch('/api/vendeurs/connexion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, mot_de_passe: password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store token
                localStorage.setItem('vendeur-token', data.token);
                localStorage.setItem('vendeur-info', JSON.stringify(data.vendeur));

                Toast.show('Connexion réussie !');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '/rdvendeur';
                }, 1000);
            } else {
                Toast.show(data.message || 'Identifiants incorrects', 'error');
            }
        } catch (error) {
            console.error('Erreur connexion:', error);
            Toast.show('Erreur de connexion au serveur', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Se connecter</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>`;
        }
    }

    // =====================================================
    // REGISTER
    // =====================================================
    async handleRegister(e) {
        e.preventDefault();

        const nom = document.getElementById('registerNom').value.trim();
        const telephone = document.getElementById('registerTelephone').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const boutique_nom = document.getElementById('registerBoutique').value.trim();
        const boutique_description = document.getElementById('registerDescription').value.trim();
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
        const terms = document.getElementById('registerTerms').checked;

        // Validations
        if (!nom || !telephone || !email || !boutique_nom || !password) {
            Toast.show('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }

        if (password.length < 6) {
            Toast.show('Le mot de passe doit contenir au moins 6 caractères', 'error');
            return;
        }

        if (password !== passwordConfirm) {
            Toast.show('Les mots de passe ne correspondent pas', 'error');
            return;
        }

        if (!terms) {
            Toast.show('Vous devez accepter les conditions d\'utilisation', 'error');
            return;
        }

        const submitBtn = this.registerForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Création en cours...</span>';

        try {
            const response = await fetch('/api/vendeurs/inscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nom,
                    telephone,
                    email,
                    boutique_nom,
                    boutique_description,
                    mot_de_passe: password
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                Toast.show('Compte créé ! En attente de validation.');
                
                // Switch to login tab
                setTimeout(() => {
                    this.switchTab('login');
                    this.registerForm.reset();
                }, 2000);
            } else {
                Toast.show(data.message || 'Erreur lors de l\'inscription', 'error');
            }
        } catch (error) {
            console.error('Erreur inscription:', error);
            Toast.show('Erreur de connexion au serveur', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Créer mon compte</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                    <line x1="20" y1="8" x2="20" y2="14"/>
                    <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>`;
        }
    }
}

// =====================================================
// INITIALIZE
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    new VendeurAuth();
});
