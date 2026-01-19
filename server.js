
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
    app.get("/api/products", (req,res) => getproducts(req, res));
    app.get("/api/commandes", (req,res) => getCommandes(req, res));
    app.post("/api/products",(req,res) => addProduct(req, res));
    app.post("/api/commandes",(req,res) => addCommande(req, res));
    app.put("/api/products", (req,res) => modifiyproduct(req, res));
    app.put("/api/commandes", (req,res) => modifyCommande(req, res));
    app.delete("/api/products", (req,res) => delproduct(req, res));
    app.delete("/api/commandes", (req,res) => delCommande(req, res));
    const start = async ()=>{
        const PORT = process.env.PORT || 3000;
        await app.listen({port:PORT, host: '0.0.0.0'});
        console.log(`Serveur lancé sur le port ${PORT}`);

    }
    start();