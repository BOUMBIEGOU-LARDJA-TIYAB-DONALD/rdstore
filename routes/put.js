import db from '../data/prepare.js';

export async function modifiyproduct(req,res) {
    const { id,titre, prix, description, image, categorie } = req.body;
    if (!titre || !prix || !description  || !categorie) {
        return res.status(400).send("Tous les champs sont requis");
    }
    try {
        const updated = await db('produits')
            .where({ id })
            .update({ titre, prix, description, image, categorie });
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