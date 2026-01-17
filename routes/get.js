import db from '../data/prepare.js';

export async function getproducts(req, res) {
    try {
        let products = await db('produits').select('*');
        if (!products || products.length === 0) {
            return res.code(404).send({ error: "Pas de produits trouvés" });
        }
       
       products.forEach(product => {
              product.lien=`/product?id=${product.id}`;
              let imagess= product.image.split(';;;');
                product.images=imagess;
         });
         console.log(products);
        return res.send(products);
    } catch (err) {
        console.error(err);
        return res.code(500).send({ error: "Erreur serveur" });
    }
}