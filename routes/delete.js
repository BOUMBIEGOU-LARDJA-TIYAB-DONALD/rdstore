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