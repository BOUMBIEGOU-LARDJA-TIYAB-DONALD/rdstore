import db from '../data/prepare.js';

export async function getproducts(req, res) {
    try {
        // Ne récupérer que les produits approuvés pour le site public
        // Jointure avec la table vendeurs pour récupérer le nom du vendeur
        let products = await db('produits')
            .leftJoin('vendeurs', 'produits.vendeur_id', 'vendeurs.id')
            .select(
                'produits.*',
                'vendeurs.nom as vendeur_nom',
                'vendeurs.boutique_nom',
                'vendeurs.email as vendeur_email'
            )
            .where(function() {
                this.where('produits.statut_validation', 'approuve')
                    .orWhereNull('produits.statut_validation');
            });

        if (!products || products.length === 0) {
            return res.send([]);
        }
       
        products.forEach(product => {
            product.lien = `/product?id=${product.id}`;
            let imagess = product.image ? product.image.split(';;;') : [];
            product.images = imagess;
            
            // Extraire le site_url du vendeur si présent (format: email;;;site_url)
            if (product.vendeur_email && product.vendeur_email.includes(';;;')) {
                const parts = product.vendeur_email.split(';;;');
                product.vendeur_site_url = parts[1] || null;
            } else {
                product.vendeur_site_url = null;
            }
            // Ne pas exposer l'email complet au frontend
            delete product.vendeur_email;
        });
        console.log(products);
        return res.send(products);
    } catch (err) {
        console.error(err);
        return res.code(500).send({ error: "Erreur serveur" });
    }
}

// Récupérer toutes les commandes
export async function getCommandes(req, res) {
    try {
        let commandes = await db('commandes')
            .select('*')
            .orderBy('date_commande', 'desc');
        
        // Parser les articles JSON pour chaque commande
        commandes = commandes.map(cmd => ({
            ...cmd,
            articles: typeof cmd.articles === 'string' ? JSON.parse(cmd.articles) : cmd.articles
        }));
        
        return res.send(commandes);
    } catch (err) {
        console.error('Erreur récupération commandes:', err);
        return res.code(500).send({ error: "Erreur serveur" });
    }
}