import db from '../data/prepare.js';

export async function delproduct(req,res){
    const { id } = req.body;
    if (!id) {
        return res.status(400).send("L'ID du produit est requis");
    }
    try {
        const deleted = await db('produits')
            .where({ id })
            .del();
        if (deleted) {
            return res.status(200).send({ message: "Produit supprimé avec succès" });
        }
        else {
            return res.status(404).send("Produit non trouvé");
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send("Erreur lors de la suppression du produit");
    }
}

// Supprimer une commande
export async function delCommande(req, res) {
    const { id } = req.body;
    if (!id) {
        return res.code(400).send({ success: false, message: "L'ID de la commande est requis" });
    }
    try {
        const deleted = await db('commandes')
            .where({ id })
            .del();
        if (deleted) {
            return res.code(200).send({ success: true, message: "Commande supprimée avec succès" });
        } else {
            return res.code(404).send({ success: false, message: "Commande non trouvée" });
        }
    } catch (error) {
        console.error('Erreur suppression commande:', error);
        return res.code(500).send({ success: false, message: "Erreur lors de la suppression" });
    }
}