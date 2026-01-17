import db from '../data/prepare.js';

export async function addProduct(req, res) {
    const { titre, prix, description,image,categorie } = req.body;
    if (!titre || !prix   || !categorie) {
        return res.status(400).send("Tous les champs sont requis");
    }
    try {
        const [id] = await db('produits').insert({ titre, prix, description,image,categorie }).returning('id');
        return res.status(201).send({ message: "Produit ajouté avec succès", productId: id });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Erreur lors de l'ajout du produit");
    }
}

