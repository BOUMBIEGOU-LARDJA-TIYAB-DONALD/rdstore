import db from '../data/prepare.js';

export async function getproducts(req, res) {
    try {
        // Ne récupérer que les produits approuvés pour le site public
        let products = await db('produits')
            .select('*')
            .where(function() {
                this.where('statut_validation', 'approuve')
                    .orWhereNull('statut_validation');
            });
        
        // Retourner un tableau vide si pas de produits (pas d'erreur 404)
        if (!products || products.length === 0) {
            return res.send([]);
        }
       
        products.forEach(product => {
            product.lien = `/product?id=${product.id}`;
            let imagess = product.image ? product.image.split(';;;') : [];
            product.images = imagess;
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