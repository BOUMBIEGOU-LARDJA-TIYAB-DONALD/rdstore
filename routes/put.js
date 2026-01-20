import db from '../data/prepare.js';

export async function modifiyproduct(req,res) {
    const { id, titre, prix, description, image, categorie, vendeur_id } = req.body;
    if (!titre || !prix || !description || !categorie) {
        return res.status(400).send("Tous les champs sont requis");
    }
    try {
        const updateData = { titre, prix, description, image, categorie };
        
        // Ajouter vendeur_id si fourni
        if (vendeur_id) {
            updateData.vendeur_id = vendeur_id;
        }
        
        const updated = await db('produits')
            .where({ id })
            .update(updateData);
        if (updated) {
            return res.status(200).send({ message: "Produit mis à jour avec succès" });
        } else {
            return res.status(404).send("Produit non trouvé");
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send("Erreur lors de la mise à jour du produit");
    }
}

// Modifier une commande (principalement le statut)
export async function modifyCommande(req, res) {
    const { id, statut, client_nom, client_telephone, client_adresse, note } = req.body;
    
    if (!id) {
        return res.code(400).send({ success: false, message: "L'ID de la commande est requis" });
    }
    
    try {
        const updateData = {};
        if (statut) updateData.statut = statut;
        if (client_nom) updateData.client_nom = client_nom;
        if (client_telephone) updateData.client_telephone = client_telephone;
        if (client_adresse !== undefined) updateData.client_adresse = client_adresse;
        if (note !== undefined) updateData.note = note;
        
        const updated = await db('commandes')
            .where({ id })
            .update(updateData);
            
        if (updated) {
            return res.code(200).send({ success: true, message: "Commande mise à jour avec succès" });
        } else {
            return res.code(404).send({ success: false, message: "Commande non trouvée" });
        }
    } catch (error) {
        console.error('Erreur modification commande:', error);
        return res.code(500).send({ success: false, message: "Erreur lors de la mise à jour" });
    }
}