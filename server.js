
import {fastify} from "fastify"
import fastifyStatic from "@fastify/static"
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
//import { getuser,gettodos} from "./routes/get.js";
import { showpages } from "./utils/showpages.js";
//import { isconnected,authlogin } from "./utils/verify.js";
//import secureSession from '@fastify/secure-session'
//import {readFile} from "node:fs/promises"
//import fastifyFormbody from "@fastify/formbody"

import { delproduct, delCommande} from "./routes/delete.js";
import {modifiyproduct, modifyCommande } from "./routes/put.js";
import { addProduct, addCommande} from "./routes/post.js";
import { getproducts, getCommandes} from "./routes/get.js";

// Import routes vendeurs
import { 
    inscriptionVendeur,
    connexionVendeur,
    deconnexionVendeur,
    getVendeurMe,
    getVendeurProduits,
    addVendeurProduit,
    updateVendeurProduit,
    deleteVendeurProduit,
    getVendeurs,
    updateVendeurStatut,
    validateProduit,
    getProduitsEnAttente
} from "./routes/vendeurs.js";

import 'dotenv/config';

//import mailerPlugin  from "./utils/mailer.js";
import fastifyMultipart from '@fastify/multipart';
export const dossier = dirname(fileURLToPath(import.meta.url));

const app = fastify({logger:true});

app.register(fastifyStatic,{
    root: join(dossier,'templates'),
    prefix: '/',});

    // Route pour la page d'accueil
    app.get("/", (req, res) => {
        return res.sendFile('index.html');
    });

    // Route pour les autres pages
    app.get("/:page",(req,res) => showpages(req, res));
    
    // =====================================================
    // API PRODUITS
    // =====================================================
    app.get("/api/products", (req,res) => getproducts(req, res));
    app.post("/api/products",(req,res) => addProduct(req, res));
    app.put("/api/products", (req,res) => modifiyproduct(req, res));
    app.delete("/api/products", (req,res) => delproduct(req, res));
    
    // =====================================================
    // API COMMANDES
    // =====================================================
    app.get("/api/commandes", (req,res) => getCommandes(req, res));
    app.post("/api/commandes",(req,res) => addCommande(req, res));
    app.put("/api/commandes", (req,res) => modifyCommande(req, res));
    app.delete("/api/commandes", (req,res) => delCommande(req, res));
    
    // =====================================================
    // API VENDEURS - Authentification
    // =====================================================
    app.post("/api/vendeurs/inscription", (req, res) => inscriptionVendeur(req, res));
    app.post("/api/vendeurs/connexion", (req, res) => connexionVendeur(req, res));
    app.post("/api/vendeurs/deconnexion", (req, res) => deconnexionVendeur(req, res));
    app.get("/api/vendeurs/me", (req, res) => getVendeurMe(req, res));
    
    // =====================================================
    // API VENDEURS - Produits du vendeur
    // =====================================================
    app.get("/api/vendeurs/produits", (req, res) => getVendeurProduits(req, res));
    app.post("/api/vendeurs/produits", (req, res) => addVendeurProduit(req, res));
    app.put("/api/vendeurs/produits", (req, res) => updateVendeurProduit(req, res));
    app.delete("/api/vendeurs/produits", (req, res) => deleteVendeurProduit(req, res));
    
    // =====================================================
    // API ADMIN - Gestion vendeurs et validation
    // =====================================================
    app.get("/api/admin/vendeurs", (req, res) => getVendeurs(req, res));
    app.put("/api/admin/vendeurs/statut", (req, res) => updateVendeurStatut(req, res));
    app.get("/api/admin/produits/en-attente", (req, res) => getProduitsEnAttente(req, res));
    app.put("/api/admin/produits/validation", (req, res) => validateProduit(req, res));

    const start = async ()=>{
        const PORT = process.env.PORT || 3000;
        await app.listen({port:PORT, host: '0.0.0.0'});
        console.log(`Serveur lancé sur le port ${PORT}`);

    }
    start();