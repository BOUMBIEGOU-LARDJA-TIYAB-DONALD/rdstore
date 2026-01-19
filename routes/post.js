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

// Ajouter une commande
export async function addCommande(req, res) {
    const { client_nom, client_telephone, client_adresse, note, articles, total } = req.body;
    
    // Validation des champs requis
    if (!client_nom || !client_telephone || !articles || !total) {
        return res.code(400).send({ 
            success: false, 
            message: "Les champs nom, téléphone, articles et total sont requis" 
        });
    }
    
    try {
        // Générer un numéro de commande unique
        const numero_commande = 'CMD-' + Date.now();
        
        // Insérer la commande dans la base de données
        const [commande] = await db('commandes').insert({
            numero_commande,
            client_nom,
            client_telephone,
            client_adresse: client_adresse || null,
            note: note || null,
            articles: JSON.stringify(articles), // Convertir en JSON string pour PostgreSQL
            total,
            statut: 'en_attente'
        }).returning(['id', 'numero_commande']);
        
        console.log('Commande créée:', commande);
        
        return res.code(201).send({ 
            success: true,
            message: "Commande enregistrée avec succès", 
            commande: {
                id: commande.id,
                numero_commande: commande.numero_commande
            }
        });
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la commande:', error);
        return res.code(500).send({ 
            success: false,
            message: "Erreur lors de l'enregistrement de la commande" 
        });
    }
}

