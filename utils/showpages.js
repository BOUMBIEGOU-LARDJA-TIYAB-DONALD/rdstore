import {join} from 'path';
import {access} from 'fs/promises';
import {dossier} from '../server.js';

export async function showpages(req, res) {
    const {page} = req.params;
    
    if(page.includes('..')) {
        return res.code(400).send('Invalid page name');
    }
    
    // Si c'est un fichier avec extension (css, js, etc.), le servir directement
    if(page.includes(".")){
        return res.sendFile(page);
    }
    
    // Sinon, chercher le fichier HTML correspondant
    const filePath = join(dossier, 'templates', `${page}.html`);
    try {
        await access(filePath);
        return res.sendFile(`${page}.html`);
    }
    catch (e){
        console.log(e);
        return res.code(404).send('Page not found');
    }
}