import db from '../data/prepare.js';
import crypto from 'crypto';

// =====================================================
// UTILS - Hashage simple (en production, utiliser bcrypt)
// =====================================================
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken() {
    return crypto.randomUUID() + '-' + crypto.randomUUID();
}

// =====================================================
// INSCRIPTION VENDEUR
// =====================================================
export async function inscriptionVendeur(req, res) {
    const { nom, email, telephone, mot_de_passe, boutique_nom, boutique_description } = req.body;

    // Validation
    if (!nom || !email || !telephone || !mot_de_passe || !boutique_nom) {
        return res.code(400).send({
            success: false,
            message: "Tous les champs obligatoires doivent être remplis"
        });
    }

    if (mot_de_passe.length < 6) {
        return res.code(400).send({
            success: false,
            message: "Le mot de passe doit contenir au moins 6 caractères"
        });
    }

    try {
        // Vérifier si l'email existe déjà
        const existingVendeur = await db('vendeurs').where({ email }).first();
        if (existingVendeur) {
            return res.code(400).send({
                success: false,
                message: "Un compte avec cet email existe déjà"
            });
        }

        // Créer le vendeur
        const [vendeur] = await db('vendeurs').insert({
            nom,
            email,
            telephone,
            mot_de_passe: hashPassword(mot_de_passe),
            boutique_nom,
            boutique_description: boutique_description || null,
            statut: 'en_attente'
        }).returning(['id', 'nom', 'email', 'boutique_nom']);

        console.log('Nouveau vendeur inscrit:', vendeur);

        return res.code(201).send({
            success: true,
            message: "Inscription réussie ! Votre compte est en attente de validation.",
            vendeur: {
                id: vendeur.id,
                nom: vendeur.nom,
                boutique_nom: vendeur.boutique_nom
            }
        });

    } catch (error) {
        console.error('Erreur inscription vendeur:', error);
        return res.code(500).send({
            success: false,
            message: "Erreur lors de l'inscription"
        });
    }
}

// =====================================================
// CONNEXION VENDEUR
// =====================================================
export async function connexionVendeur(req, res) {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
        return res.code(400).send({
            success: false,
            message: "Email et mot de passe requis"
        });
    }

    try {
        // Trouver le vendeur
        const vendeur = await db('vendeurs').where({ email }).first();

        if (!vendeur) {
            return res.code(401).send({
                success: false,
                message: "Email ou mot de passe incorrect"
            });
        }

        // Vérifier le mot de passe
        if (vendeur.mot_de_passe !== hashPassword(mot_de_passe)) {
            return res.code(401).send({
                success: false,
                message: "Email ou mot de passe incorrect"
            });
        }

        // Générer un token de session
        const token = generateToken();
        const expiration = new Date();
        expiration.setDate(expiration.getDate() + 7); // Expire dans 7 jours

        // Sauvegarder la session
        await db('vendeur_sessions').insert({
            vendeur_id: vendeur.id,
            token,
            date_expiration: expiration
        });

        // Mettre à jour la dernière connexion
        await db('vendeurs').where({ id: vendeur.id }).update({
            derniere_connexion: new Date()
        });

        console.log('Vendeur connecté:', vendeur.email);

        return res.code(200).send({
            success: true,
            message: "Connexion réussie",
            token,
            vendeur: {
                id: vendeur.id,
                nom: vendeur.nom,
                email: vendeur.email,
                telephone: vendeur.telephone,
                boutique_nom: vendeur.boutique_nom,
                boutique_description: vendeur.boutique_description,
                statut: vendeur.statut
            }
        });

    } catch (error) {
        console.error('Erreur connexion vendeur:', error);
        return res.code(500).send({
            success: false,
            message: "Erreur lors de la connexion"
        });
    }
}

// =====================================================
// DÉCONNEXION VENDEUR
// =====================================================
export async function deconnexionVendeur(req, res) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.code(401).send({
            success: false,
            message: "Non authentifié"
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        await db('vendeur_sessions').where({ token }).del();

        return res.code(200).send({
            success: true,
            message: "Déconnexion réussie"
        });

    } catch (error) {
        console.error('Erreur déconnexion:', error);
        return res.code(500).send({
            success: false,
            message: "Erreur lors de la déconnexion"
        });
    }
}

// =====================================================
// INFOS VENDEUR CONNECTÉ
// =====================================================
export async function getVendeurMe(req, res) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.code(401).send({
            success: false,
            message: "Non authentifié"
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Vérifier le token
        const session = await db('vendeur_sessions')
            .where({ token })
            .where('date_expiration', '>', new Date())
            .first();

        if (!session) {
            return res.code(401).send({
                success: false,
                message: "Session expirée ou invalide"
            });
        }

        // Récupérer les infos vendeur
        const vendeur = await db('vendeurs')
            .where({ id: session.vendeur_id })
            .first();

        if (!vendeur) {
            return res.code(404).send({
                success: false,
                message: "Vendeur non trouvé"
            });
        }

        return res.code(200).send({
            success: true,
            vendeur: {
                id: vendeur.id,
                nom: vendeur.nom,
                email: vendeur.email,
                telephone: vendeur.telephone,
                boutique_nom: vendeur.boutique_nom,
                boutique_description: vendeur.boutique_description,
                statut: vendeur.statut,
                date_inscription: vendeur.date_inscription
            }
        });

    } catch (error) {
        console.error('Erreur get vendeur:', error);
        return res.code(500).send({
            success: false,
            message: "Erreur serveur"
        });
    }
}

// =====================================================
// PRODUITS DU VENDEUR
// =====================================================
export async function getVendeurProduits(req, res) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.code(401).send({
            success: false,
            message: "Non authentifié"
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Vérifier le token
        const session = await db('vendeur_sessions')
            .where({ token })
            .where('date_expiration', '>', new Date())
            .first();

        if (!session) {
            return res.code(401).send({
                success: false,
                message: "Session expirée"
            });
        }

        // Récupérer les produits du vendeur
        const produits = await db('produits')
            .where({ vendeur_id: session.vendeur_id })
            .orderBy('date_soumission', 'desc');

        // Formater les images
        const produitsFormates = produits.map(p => ({
            ...p,
            images: p.image ? p.image.split(';;;') : []
        }));

        return res.code(200).send({
            success: true,
            produits: produitsFormates
        });

    } catch (error) {
        console.error('Erreur get produits vendeur:', error);
        return res.code(500).send({
            success: false,
            message: "Erreur serveur"
        });
    }
}

// =====================================================
// AJOUTER PRODUIT (VENDEUR)
// =====================================================
export async function addVendeurProduit(req, res) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.code(401).send({
            success: false,
            message: "Non authentifié"
        });
    }

    const token = authHeader.split(' ')[1];
    const { titre, prix, description, categorie, images } = req.body;

    if (!titre || !prix || !description || !categorie) {
        return res.code(400).send({
            success: false,
            message: "Tous les champs obligatoires doivent être remplis"
        });
    }

    try {
        // Vérifier le token et le statut du vendeur
        const session = await db('vendeur_sessions')
            .where({ token })
            .where('date_expiration', '>', new Date())
            .first();

        if (!session) {
            return res.code(401).send({
                success: false,
                message: "Session expirée"
            });
        }

        const vendeur = await db('vendeurs').where({ id: session.vendeur_id }).first();

        if (vendeur.statut !== 'actif') {
            return res.code(403).send({
                success: false,
                message: "Votre compte doit être validé pour ajouter des produits"
            });
        }

        // Créer le produit
        const imageString = Array.isArray(images) ? images.join(';;;') : '';

        const [produit] = await db('produits').insert({
            titre,
            prix,
            description,
            image: imageString,
            categorie,
            vendeur_id: session.vendeur_id,
            statut_validation: 'en_attente',
            date_soumission: new Date()
        }).returning(['id', 'titre']);

        console.log('Nouveau produit soumis:', produit);

        return res.code(201).send({
            success: true,
            message: "Produit soumis pour validation",
            produit: {
                id: produit.id,
                titre: produit.titre
            }
        });

    } catch (error) {
        console.error('Erreur ajout produit vendeur:', error);
        return res.code(500).send({
            success: false,
            message: "Erreur lors de l'ajout du produit"
        });
    }
}

// =====================================================
// MODIFIER PRODUIT (VENDEUR)
// =====================================================
export async function updateVendeurProduit(req, res) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.code(401).send({
            success: false,
            message: "Non authentifié"
        });
    }

    const token = authHeader.split(' ')[1];
    const { id, titre, prix, description, categorie, images } = req.body;

    if (!id) {
        return res.code(400).send({
            success: false,
            message: "ID du produit requis"
        });
    }

    try {
        // Vérifier le token
        const session = await db('vendeur_sessions')
            .where({ token })
            .where('date_expiration', '>', new Date())
            .first();

        if (!session) {
            return res.code(401).send({
                success: false,
                message: "Session expirée"
            });
        }

        // Vérifier que le produit appartient au vendeur
        const produit = await db('produits')
            .where({ id, vendeur_id: session.vendeur_id })
            .first();

        if (!produit) {
            return res.code(404).send({
                success: false,
                message: "Produit non trouvé ou non autorisé"
            });
        }

        // Mettre à jour
        const updateData = {};
        if (titre) updateData.titre = titre;
        if (prix) updateData.prix = prix;
        if (description) updateData.description = description;
        if (categorie) updateData.categorie = categorie;
        if (images) updateData.image = Array.isArray(images) ? images.join(';;;') : images;

        // Remettre en attente si modifié (optionnel)
        updateData.statut_validation = 'en_attente';
        updateData.date_soumission = new Date();

        await db('produits').where({ id }).update(updateData);

        return res.code(200).send({
            success: true,
            message: "Produit modifié et soumis pour revalidation"
        });

    } catch (error) {
        console.error('Erreur modification produit vendeur:', error);
        return res.code(500).send({
            success: false,
            message: "Erreur lors de la modification"
        });
    }
}

// =====================================================
// SUPPRIMER PRODUIT (VENDEUR)
// =====================================================
export async function deleteVendeurProduit(req, res) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.code(401).send({
            success: false,
            message: "Non authentifié"
        });
    }

    const token = authHeader.split(' ')[1];
    const { id } = req.body;

    if (!id) {
        return res.code(400).send({
            success: false,
            message: "ID du produit requis"
        });
    }

    try {
        // Vérifier le token
        const session = await db('vendeur_sessions')
            .where({ token })
            .where('date_expiration', '>', new Date())
            .first();

        if (!session) {
            return res.code(401).send({
                success: false,
                message: "Session expirée"
            });
        }

        // Supprimer le produit (uniquement si appartient au vendeur)
        const deleted = await db('produits')
            .where({ id, vendeur_id: session.vendeur_id })
            .del();

        if (deleted) {
            return res.code(200).send({
                success: true,
                message: "Produit supprimé avec succès"
            });
        } else {
            return res.code(404).send({
                success: false,
                message: "Produit non trouvé ou non autorisé"
            });
        }

    } catch (error) {
        console.error('Erreur suppression produit vendeur:', error);
        return res.code(500).send({
            success: false,
            message: "Erreur lors de la suppression"
        });
    }
}

// =====================================================
// ADMIN: Liste des vendeurs
// =====================================================
export async function getVendeurs(req, res) {
    try {
        const vendeurs = await db('vendeurs')
            .select('id', 'nom', 'email', 'telephone', 'boutique_nom', 'statut', 'date_inscription', 'derniere_connexion')
            .orderBy('date_inscription', 'desc');

        return res.code(200).send({
            success: true,
            vendeurs
        });

    } catch (error) {
        console.error('Erreur get vendeurs:', error);
        return res.code(500).send({
            success: false,
            message: "Erreur serveur"
        });
    }
}

// =====================================================
// ADMIN: Changer statut vendeur
// =====================================================
export async function updateVendeurStatut(req, res) {
    const { id, statut, site_url } = req.body;

    if (!id || !statut) {
        return res.code(400).send({
            success: false,
            message: "ID et statut requis"
        });
    }

    if (!['en_attente', 'actif', 'suspendu'].includes(statut)) {
        return res.code(400).send({
            success: false,
            message: "Statut invalide"
        });
    }

    try {
        // Récupérer le vendeur actuel pour obtenir l'email
        const vendeur = await db('vendeurs').where({ id }).first();
        if (!vendeur) {
            return res.code(404).send({
                success: false,
                message: "Vendeur non trouvé"
            });
        }

        // Extraire l'email de base (sans l'ancien site_url)
        let emailBase = vendeur.email;
        if (emailBase && emailBase.includes(';;;')) {
            emailBase = emailBase.split(';;;')[0];
        }

        // Construire le nouvel email avec ou sans site_url
        let newEmail = emailBase;
        if (site_url && site_url.trim()) {
            newEmail = `${emailBase};;;${site_url.trim()}`;
        }

        const updated = await db('vendeurs')
            .where({ id })
            .update({ 
                statut,
                email: newEmail
            });

        if (updated) {
            return res.code(200).send({
                success: true,
                message: `Vendeur mis à jour avec succès`
            });
        } else {
            return res.code(404).send({
                success: false,
                message: "Vendeur non trouvé"
            });
        }

    } catch (error) {
        console.error('Erreur update statut vendeur:', error);
        return res.code(500).send({
            success: false,
            message: "Erreur serveur"
        });
    }
}

// =====================================================
// ADMIN: Valider/Refuser produit
// =====================================================
export async function validateProduit(req, res) {
    const { id, statut_validation, motif_refus } = req.body;

    if (!id || !statut_validation) {
        return res.code(400).send({
            success: false,
            message: "ID et statut requis"
        });
    }

    if (!['approuve', 'refuse'].includes(statut_validation)) {
        return res.code(400).send({
            success: false,
            message: "Statut de validation invalide"
        });
    }

    try {
        const updateData = { statut_validation };
        if (statut_validation === 'refuse' && motif_refus) {
            updateData.motif_refus = motif_refus;
        }

        const updated = await db('produits')
            .where({ id })
            .update(updateData);

        if (updated) {
            return res.code(200).send({
                success: true,
                message: `Produit ${statut_validation === 'approuve' ? 'approuvé' : 'refusé'}`
            });
        } else {
            return res.code(404).send({
                success: false,
                message: "Produit non trouvé"
            });
        }

    } catch (error) {
        console.error('Erreur validation produit:', error);
        return res.code(500).send({
            success: false,
            message: "Erreur serveur"
        });
    }
}

// =====================================================
// ADMIN: Produits en attente de validation
// =====================================================
export async function getProduitsEnAttente(req, res) {
    try {
        const produits = await db('produits')
            .leftJoin('vendeurs', 'produits.vendeur_id', 'vendeurs.id')
            .where('produits.statut_validation', 'en_attente')
            .select(
                'produits.*',
                'vendeurs.nom as vendeur_nom',
                'vendeurs.boutique_nom'
            )
            .orderBy('produits.date_soumission', 'desc');

        const produitsFormates = produits.map(p => ({
            ...p,
            images: p.image ? p.image.split(';;;') : []
        }));

        return res.code(200).send({
            success: true,
            produits: produitsFormates
        });

    } catch (error) {
        console.error('Erreur get produits en attente:', error);
        return res.code(500).send({
            success: false,
            message: "Erreur serveur"
        });
    }
}
