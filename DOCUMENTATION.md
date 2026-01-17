# 📋 RD'S TodoApp - Documentation Technique Complète

## 📖 Table des Matières

1. [Présentation du Projet](#présentation-du-projet)
2. [Architecture Globale](#architecture-globale)
3. [Stack Technique](#stack-technique)
4. [Structure des Fichiers](#structure-des-fichiers)
5. [Configuration du Serveur](#configuration-du-serveur)
6. [Base de Données](#base-de-données)
7. [Système de Routes](#système-de-routes)
8. [Utilitaires (Utils)](#utilitaires-utils)
9. [Authentification & Sessions](#authentification--sessions)
10. [Système d'Envoi d'Emails](#système-denvoi-demails)
11. [Interface Utilisateur (Templates)](#interface-utilisateur-templates)
12. [Gestion des Formulaires](#gestion-des-formulaires)
13. [Sécurité](#sécurité)
14. [Variables d'Environnement](#variables-denvironnement)
15. [Guide de Déploiement](#guide-de-déploiement)

---

## 🎯 Présentation du Projet

**RD'S TodoApp** est une application web moderne de gestion de tâches (Todo List) développée avec **Fastify** (framework Node.js). L'application permet aux utilisateurs de :

- ✅ Créer un compte avec vérification par email
- ✅ Se connecter de manière sécurisée
- ✅ Gérer leurs tâches (ajouter, marquer comme fait/non fait, supprimer)
- ✅ Réinitialiser leur mot de passe via email

---

## 🏗️ Architecture Globale

L'application suit une architecture **MVC simplifiée** avec séparation claire des responsabilités :

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                     HTML/CSS/JavaScript                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVER (Fastify)                           │
│                        server.js                                │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│    ROUTES     │    │    UTILS      │    │   TEMPLATES   │
│  get.js       │    │  verify.js    │    │  index.html   │
│  post.js      │    │  showpage.js  │    │  login.html   │
│  put.js       │    │  mailer.js    │    │  todos.html   │
│  delete.js    │    │               │    │  etc...       │
└───────────────┘    └───────────────┘    └───────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATABASE (PostgreSQL)                       │
│                  via Knex.js Query Builder                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Technique

### Backend
| Technologie | Version | Usage |
|-------------|---------|-------|
| **Fastify** | ^5.4.0 | Framework web principal |
| **Knex.js** | ^3.1.0 | Query builder SQL |
| **PostgreSQL** | - | Base de données (production) |
| **@fastify/secure-session** | ^8.2.0 | Gestion des sessions |
| **@fastify/static** | ^8.2.0 | Servir les fichiers statiques |
| **@fastify/formbody** | ^8.0.2 | Parser les formulaires |
| **@fastify/multipart** | ^9.0.3 | Upload de fichiers |
| **@node-rs/argon2** | ^2.0.2 | Hashage des mots de passe |
| **nodemailer** | ^7.0.5 | Envoi d'emails |
| **fastify-mailer** | ^2.3.1 | Plugin Fastify pour emails |
| **dotenv** | ^17.2.3 | Variables d'environnement |

### Frontend
| Technologie | Usage |
|-------------|-------|
| **HTML5** | Structure des pages |
| **CSS3** | Styling moderne avec variables CSS |
| **JavaScript (ES6+)** | Interactivité et appels API |

---

## 📁 Structure des Fichiers

```
fastify-first/
│
├── 📄 server.js              # Point d'entrée de l'application
├── 📄 knexfile.js            # Configuration Knex/BDD
├── 📄 package.json           # Dépendances et scripts
├── 📄 secret-key             # Clé secrète pour les sessions
│
├── 📁 routes/                # Logique des routes par méthode HTTP
│   ├── get.js                # Routes GET (lecture)
│   ├── post.js               # Routes POST (création)
│   ├── put.js                # Routes PUT (modification)
│   └── delete.js             # Routes DELETE (suppression)
│
├── 📁 utils/                 # Fonctions utilitaires
│   ├── verify.js             # Authentification et vérification
│   ├── showpage.js           # Affichage dynamique des pages
│   └── mailer.js             # Configuration email
│
├── 📁 templates/             # Fichiers HTML/CSS
│   ├── index.html            # Page d'accueil
│   ├── login.html            # Page de connexion
│   ├── signup.html           # Page d'inscription
│   ├── todos.html            # Page principale des tâches
│   ├── mail.html             # Vérification email
│   ├── reset.html            # Réinitialisation mot de passe
│   └── style.css             # Styles globaux
│
├── 📁 migrations/            # Migrations de base de données
│   ├── 20250804022055_initial_schema.js
│   ├── 20250804025842_create_users.js
│   ├── 20250804030839_create_schema.js
│   └── 20250804121727_create_schema.js
│
└── 📁 data/                  # Scripts et requêtes SQL
    ├── prepare.js            # Export de la connexion Knex
    └── query.sql             # Requêtes SQL de test
```

---

## ⚙️ Configuration du Serveur

### Fichier Principal : `server.js`

Le serveur est configuré en plusieurs étapes :

#### 1. Imports et Configuration de Base

```javascript
import {fastify} from "fastify"
import fastifyStatic from "@fastify/static"
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import secureSession from '@fastify/secure-session'
import {readFile} from "node:fs/promises"
import fastifyFormbody from "@fastify/formbody"
import fastifyMultipart from '@fastify/multipart';
import 'dotenv/config';
import mailerPlugin from "./utils/mailer.js";
```

**Explication** : On utilise les ES Modules (`type: "module"` dans package.json) pour importer les dépendances.

#### 2. Configuration du Répertoire

```javascript
export const dossier = dirname(fileURLToPath(import.meta.url))
```

**Explication** : Cette ligne récupère le chemin absolu du dossier actuel, nécessaire pour `__dirname` qui n'existe pas en ES Modules.

#### 3. Création de l'Application et Plugins

```javascript
const app = fastify()

// Plugin pour l'envoi d'emails
await app.register(mailerPlugin)

// Plugin pour l'upload de fichiers
app.register(fastifyMultipart)

// Plugin pour les sessions sécurisées
app.register(secureSession, {
  sessionName: 'session',
  cookieName: 'session',
  key: Buffer.from(key.toString('hex'), 'hex'),
  expiry: 24 * 30 * 60, // 30 jours
  cookie: { path: '/' }
})

// Plugin pour parser les formulaires
app.register(fastifyFormbody)

// Plugin pour servir les fichiers statiques
app.register(fastifyStatic, {
  root: join(dossier, 'templates'),
  prefix: "/",
})
```

#### 4. Définition des Routes

```javascript
// Pages
app.get("/", async(req,res) => res.type("text/html").sendFile("index.html"))
app.get("/:page", (req,res) => showpages(req,res))

// API Data - CRUD Todos
app.get("/data/users", async (req,res) => getuser(req, res, req.query.user))
app.get("/data/todos", (req,res) => gettodos(req,res))
app.post("/data/add", (req,res) => storedata(isconnected(req), req, res))
app.put("/data/do", (req,res) => dotask(req,res))
app.put("/data/undo", (req,res) => undotask(req,res))
app.delete("/data/rem", (req,res) => deltask(req,res))

// Authentification
app.post("/log/user", (req,res) => authlogin(req,res))
app.post("/register/user", (req,res) => registeruser(req,res))
app.post("/logout/user", (req,res) => logout(req,res))

// Vérification Email
app.post("/send/mail", (req,res) => Sendmail(req, res, app))
app.post("/verify/code", (req,res) => verifycode(req,res))

// Reset Password
app.put("/reset/user", (req,res) => sendresetmail(req, res, app))
app.put("/verify/reset", (req,res) => verifyreset(req,res))
app.put("/reset/pass", (req,res) => changepass(req,res))
```

#### 5. Démarrage du Serveur

```javascript
const start = async () => {
  const PORT = process.env.PORT || 3000;
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log("serveur à l'ecoute sur le port ", PORT)
}
start()
```

---

## 🗄️ Base de Données

### Configuration Knex : `knexfile.js`

```javascript
import 'dotenv/config';

export default {
  client: 'pg',  // PostgreSQL
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  },
  migrations: {
    directory: './migrations'
  }
};
```

### Export de la Connexion : `data/prepare.js`

```javascript
import knex from 'knex';
import config from '../knexfile.js';

const db = knex(config);

export default db;
```

**Explication** : Ce fichier crée une instance unique de Knex qui sera réutilisée dans toute l'application.

### Schéma de la Base de Données

Le schéma final (migration `20250804121727_create_schema.js`) définit 3 tables :

#### Table `users`
```javascript
table.bigIncrements('id').primary();    // ID auto-incrémenté
table.string('email').notNullable().unique();
table.string('password').notNullable();  // Hash Argon2
table.string('name');
```

#### Table `todos`
```javascript
table.bigIncrements('id').primary();
table.string('name').notNullable();      // Nom de la tâche
table.boolean('status').defaultTo(false); // Fait ou non
table.text('description');                // Description
table.text('date');                       // Date de création
table.bigInteger('user_id')               // Clé étrangère
     .references('id').inTable('users')
     .onDelete('CASCADE');
```

#### Table `codes`
```javascript
table.string('mail', 50).primary();  // Email de vérification
table.integer('code').notNullable(); // Code à 6 chiffres
```

#### Table `reset` (pour réinitialisation)
```javascript
table.string('mail', 50).primary();
table.integer('code').notNullable();
```

---

## 🛤️ Système de Routes

Les routes sont séparées par **méthode HTTP** dans le dossier `routes/` :

### 📥 GET Routes (`routes/get.js`)

**Objectif** : Lecture de données

```javascript
import db from "../data/prepare.js"

// Récupérer un utilisateur par nom
export async function getuser(req, res, use) {
    const user = await db('users').where({ name: use }).first();
    if (user === undefined) {
        return res.type("text/html").send("non user")
    }
    return res.type("application/json").send(user)
}

// Récupérer les todos de l'utilisateur connecté
export async function gettodos(req, res) {
    if (req.session.user) {
        const todos = await db('todos')
            .where({ user_id: req.session.user.id })
            .select();
        return res.type("application/json").send(todos)
    }
    return res.send("pas de todos pour vous")
}
```

### 📤 POST Routes (`routes/post.js`)

**Objectif** : Création de données

| Fonction | Description |
|----------|-------------|
| `storedata()` | Ajoute une nouvelle tâche |
| `registeruser()` | Inscrit un nouvel utilisateur |
| `logout()` | Déconnexion (supprime la session) |
| `Sendmail()` | Envoie un code de vérification par email |
| `verifycode()` | Vérifie le code de confirmation |

#### Exemple : Ajout d'une tâche

```javascript
export async function storedata(con, req, res) {
  if (con) {  // Si l'utilisateur est connecté
    let { name, description } = req.body
    let dat = new Date().toLocaleString('fr-FR')
    
    await db('todos').insert({
      name: name,
      status: false,
      date: dat,
      user_id: req.session.user.id,
      description: description
    });
    
    return res.redirect("/todos")
  }
  return res.code(302).redirect("/login")
}
```

#### Exemple : Inscription avec hashage

```javascript
export async function registeruser(req, res) {
  try {
    let { name, mail, password } = req.body
    password = await hash(password)  // Hashage Argon2
    
    await db('users').insert({
      id: Date.now(),
      name: name,
      email: mail,
      password: password
    });
    
    return res.redirect("/mail")
  } catch (error) {
    return res.code(302).redirect("/signup")
  }
}
```

### ✏️ PUT Routes (`routes/put.js`)

**Objectif** : Modification de données

| Fonction | Description |
|----------|-------------|
| `dotask()` | Marque une tâche comme terminée |
| `undotask()` | Marque une tâche comme non terminée |
| `sendresetmail()` | Envoie l'email de réinitialisation |
| `verifyreset()` | Vérifie le code de réinitialisation |
| `changepass()` | Change le mot de passe |

#### Exemple : Marquer une tâche comme faite

```javascript
export async function dotask(req, res) {
    if (req.session.user) {
        let { id } = req.session.user
        let name = JSON.parse(req.body).name
        
        const row = await db('todos')
            .where({ user_id: id, name: name })
            .first();
        
        if (row?.status === false) {
            await db('todos')
                .where({ user_id: id, name: name })
                .update({ status: true });
        }
    }
}
```

### 🗑️ DELETE Routes (`routes/delete.js`)

**Objectif** : Suppression de données

```javascript
export async function deltask(req, res) {
    if (req.session.user) {
        let { id } = req.session.user
        let name = JSON.parse(req.body).name
        
        await db('todos')
            .where({ user_id: id, name: name })
            .del();
        
        return res.send()
    }
}
```

---

## 🔧 Utilitaires (Utils)

### 1. Vérification (`utils/verify.js`)

Gère l'authentification et la vérification de session.

```javascript
import { verifySync } from "@node-rs/argon2"
import db from "../data/prepare.js"

// Vérifie si l'utilisateur est connecté
export function isconnected(req) {
    return !!req.session.user
}

// Authentifie l'utilisateur lors de la connexion
export async function authlogin(req, res) {
    let { mail, password: vpassword } = JSON.parse(req.body)
    
    try {
        const user = await db('users')
            .select('password', 'id')
            .where({ email: mail })
            .first();
        
        const { password, id } = user;
        
        // Vérification du hash Argon2
        if (verifySync(password, vpassword)) {
            req.session.set("user", { id, mail })
            return res.redirect("/todos?msg=connected")
        }
        return res.code("404").send()
    } catch (error) {
        return res.code(404).send("user not found")
    }
}
```

### 2. Affichage des Pages (`utils/showpage.js`)

Gère le routage dynamique des pages HTML.

```javascript
import { join } from 'path';
import { access } from "fs/promises";
import { dossier } from '../server.js';

export async function showpages(req, res) {
    let pages = ["login", "signup", "todos"]
    const { page } = req.params;
    const filePath = join(dossier, 'templates', `${page}.html`);
    
    // Gestion des fichiers statiques (images, etc.)
    if (page.includes(".")) {
        return res.sendFile(page)
    }
    
    // Pages protégées : redirection si déjà connecté
    if (pages.includes(page)) {
        if (req.session.user) {
            return res.redirect("/todos?msg=connected")
        }
    }
    
    // Vérification que la page existe
    try {
        await access(filePath)
        return res.type("text/html").sendFile(`${page}.html`)
    } catch (e) {
        return res.type("text/html").code(404).send("404 page non trouvée")
    }
}
```

### 3. Configuration Email (`utils/mailer.js`)

Plugin Fastify pour l'envoi d'emails via Nodemailer.

```javascript
import fp from "fastify-plugin"
import mailer from "fastify-mailer"
import 'dotenv/config';

export default fp(async function (app) {
    app.register(mailer, {
        defaults: { from: process.env.MAIL_DEFAULT_FROM },
        transport: {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            pool: true,
            maxConnections: 5,
            maxMessages: 100
        }
    })
})
```

---

## 🔐 Authentification & Sessions

### Flux d'Authentification

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   SIGNUP     │────▶│  SEND EMAIL  │────▶│ VERIFY CODE  │
│  /signup     │     │  /send/mail  │     │ /verify/code │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                                                  ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    LOGIN     │────▶│   SESSION    │────▶│    TODOS     │
│   /login     │     │   Created    │     │   /todos     │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │   LOGOUT     │
                                          │ /logout/user │
                                          └──────────────┘
```

### Gestion des Sessions

Les sessions utilisent `@fastify/secure-session` avec :
- **Clé secrète** stockée dans `secret-key`
- **Cookie sécurisé** nommé `session`
- **Expiration** : 30 jours

```javascript
// Création de session lors du login
req.session.set("user", { id: id, mail: mail })

// Lecture de session
if (req.session.user) { ... }

// Suppression de session (logout)
req.session.delete()
```

### Hashage des Mots de Passe

Utilisation d'**Argon2** (recommandation OWASP) :

```javascript
import { hash, verifySync } from "@node-rs/argon2"

// Hashage lors de l'inscription
const hashedPassword = await hash(password)

// Vérification lors du login
const isValid = verifySync(storedHash, providedPassword)
```

---

## 📧 Système d'Envoi d'Emails

### Types d'Emails Envoyés

1. **Code de vérification** (inscription)
2. **Code de réinitialisation** (mot de passe oublié)

### Template Email de Vérification

```javascript
const message = `
<div style="font-family:Arial; max-width:600px; margin:auto; padding:20px;">
    <h2>Bonjour,</h2>
    <p>Voici votre code de confirmation :</p>
    <div style="background:#f0f0f0; padding:15px; font-size:24px; text-align:center;">
        ${randomCode}
    </div>
    <p style="color:#e74c3c;"><strong>Ne partagez ce code avec personne.</strong></p>
    <p><strong>L'équipe RD'S TODOLIST</strong></p>
</div>
`;
```

### Envoi d'Email

```javascript
const info = await app.mailer.sendMail({
    to: email,
    subject: "Code de verification",
    html: message
})
```

---

## 🎨 Interface Utilisateur (Templates)

### Pages Disponibles

| Page | URL | Description |
|------|-----|-------------|
| `index.html` | `/` | Page d'accueil avec présentation |
| `login.html` | `/login` | Formulaire de connexion |
| `signup.html` | `/signup` | Formulaire d'inscription |
| `todos.html` | `/todos` | Liste des tâches (protégée) |
| `mail.html` | `/mail` | Vérification du code email |
| `reset.html` | `/reset` | Réinitialisation mot de passe |

### Design System (CSS)

Le fichier `style.css` définit un système de design moderne :

#### Variables CSS

```css
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #1a1a1a;
  --accent-primary: #00d4ff;
  --text-primary: #ffffff;
  --text-secondary: #cccccc;
  --shadow-glow: 0 0 20px rgba(0, 212, 255, 0.3);
}
```

#### Composants Stylés

- **Navigation** : Barre fixe avec effet blur
- **Cards** : Bordures avec effet glow au hover
- **Boutons** : Dégradés avec animations
- **Formulaires** : Inputs modernes avec focus animé
- **Animations** : fadeInUp, pulse

---

## 📝 Gestion des Formulaires

### Côté Client (JavaScript)

L'application utilise `fetch()` pour les appels API asynchrones :

```javascript
// Exemple : Connexion
form.addEventListener("submit", async (e) => {
    e.preventDefault()
    
    let reponse = await fetch("/log/user", {
        method: "post",
        body: JSON.stringify({ mail, password })
    })
    
    if (reponse.status === 200) {
        location.href = reponse.url
    }
})
```

### Validation

- **Email** : Regex côté client
- **Mots de passe** : Comparaison avant envoi
- **Boutons désactivés** jusqu'à validation

---

## 🛡️ Sécurité

### Mesures Implémentées

| Mesure | Description |
|--------|-------------|
| **Argon2** | Hashage sécurisé des mots de passe |
| **Sessions signées** | Cookies chiffrés avec clé secrète |
| **SSL PostgreSQL** | Connexion chiffrée à la BDD |
| **Vérification email** | Codes à 6 chiffres aléatoires |
| **Protection CSRF** | Sessions liées aux cookies |

### Points d'Amélioration Possibles

- Rate limiting sur les endpoints d'auth
- Expiration des codes de vérification
- Helmet pour les headers de sécurité
- Validation plus stricte des inputs

---

## 🔑 Variables d'Environnement

Créez un fichier `.env` à la racine :

```env
# Base de données
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Serveur
PORT=3000

# Email (SMTP)
MAIL_DEFAULT_FROM=noreply@votreapp.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre_email
SMTP_PASS=votre_mot_de_passe
```

---

## 🚀 Guide de Déploiement

### 1. Installation des Dépendances

```bash
npm install
```

### 2. Configuration de la Base de Données

```bash
# Exécuter les migrations
npx knex migrate:latest
```

### 3. Génération de la Clé Secrète

```bash
# Générer une clé de 32 bytes
node -e "require('crypto').randomBytes(32, (err, buf) => console.log(buf))" > secret-key
```

### 4. Démarrage

```bash
# Développement
npm start

# Ou directement
node server.js
```

### 5. Déploiement Production

L'application est prête pour le déploiement sur :
- **Railway** (PostgreSQL inclus)
- **Render**
- **Heroku**
- **VPS** (avec PM2)

---

## 📊 Récapitulatif de l'Architecture

```
                     ┌─────────────────────────────┐
                     │     server.js (Fastify)     │
                     │   Point d'entrée central    │
                     └─────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│     ROUTES      │      │      UTILS      │      │    TEMPLATES    │
│                 │      │                 │      │                 │
│ • get.js        │      │ • verify.js     │      │ • HTML pages    │
│   (lecture)     │      │   (auth)        │      │ • style.css     │
│ • post.js       │      │ • showpage.js   │      │                 │
│   (création)    │      │   (routing)     │      │                 │
│ • put.js        │      │ • mailer.js     │      │                 │
│   (modification)│      │   (emails)      │      │                 │
│ • delete.js     │      │                 │      │                 │
│   (suppression) │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
         │                          │
         └──────────────┬───────────┘
                        ▼
              ┌─────────────────┐
              │  data/prepare.js│
              │  (Knex export)  │
              └─────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │   PostgreSQL    │
              │   (via Knex)    │
              └─────────────────┘
```

---

## ✨ Conclusion

Cette application TodoList démontre une architecture Node.js moderne avec :

1. **Séparation claire** des responsabilités (routes par méthode HTTP)
2. **Sécurité** avec Argon2 et sessions chiffrées
3. **Base de données** gérée via migrations Knex
4. **Interface moderne** avec CSS custom properties
5. **Envoi d'emails** pour la vérification et le reset

Le code est organisé de manière à être facilement maintenable et extensible.

---

*Documentation générée le 14 janvier 2026*
