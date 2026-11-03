# Grimoire des Douze

Encyclopédie Dofus (objets, panoplies, bestiaire, montures) : API Express + MongoDB et pages statiques servies depuis `public/`.

## Prérequis

- Node.js 24 ou plus
- pnpm 10 (`corepack enable` suffit)
- Docker Desktop (pour la base MongoDB locale)

## Démarrer l'application

```bash
pnpm install
cp .env.example .env
pnpm db:up
pnpm db:seed
pnpm css:build
pnpm dev
```

L'application est disponible sur http://localhost:5000.

| Étape | Rôle |
| --- | --- |
| `cp .env.example .env` | crée la configuration locale (`PORT`, `DATABASE_URL`) |
| `pnpm db:up` | lance le conteneur MongoDB `dofus-mongo` |
| `pnpm db:seed` | importe les données depuis dofusdude et DofusDB |
| `pnpm css:build` | génère `public/css/style.css` (Tailwind, non versionné) |
| `pnpm dev` | lance le serveur en mode watch |

Pendant le développement du style, lancer `pnpm css:watch` dans un second terminal.

### Production

```bash
pnpm build
pnpm css:build
pnpm start
```

### Arrêter la base

```bash
pnpm db:down
```

Les données sont conservées dans le volume Docker `mongo-data`. Pour repartir de zéro : `docker compose down -v` puis relancer `pnpm db:up` et `pnpm db:seed`.

## Accéder à la base MongoDB en local

| Paramètre | Valeur |
| --- | --- |
| Hôte | `localhost` |
| Port | `27017` |
| Base | `dofus` |
| Authentification | aucune |
| URI | `mongodb://localhost:27017/dofus` |

Collections : `items`, `equipmentsets`, `monsters`, `mounts`.

### Avec MongoDB Compass

1. Installer [MongoDB Compass](https://www.mongodb.com/products/tools/compass).
2. Cliquer sur **New connection** et coller `mongodb://localhost:27017/dofus`.
3. Cliquer sur **Connect**, puis ouvrir la base `dofus`.

### Avec mongosh dans le conteneur

```bash
docker exec -it dofus-mongo mongosh dofus
```

Exemples de requêtes :

```js
show collections
db.items.countDocuments()
db.monsters.findOne({ name: /Bouftou/ })
db.mounts.find().limit(5)
```

### Avec l'extension VS Code

Installer l'extension **MongoDB for VS Code** et ajouter une connexion avec l'URI `mongodb://localhost:27017/dofus`.

## API

| Route | Description |
| --- | --- |
| `GET /api/items` | liste des objets |
| `GET /api/items/types` | types d'objets |
| `GET /api/items/:id` | détail d'un objet |
| `GET /api/sets` | liste des panoplies |
| `GET /api/sets/:id` | détail d'une panoplie |
| `GET /api/monsters` | liste des monstres |
| `GET /api/monsters/:id` | détail d'un monstre |
| `GET /api/mounts` | liste des montures |
| `GET /api/mounts/:id` | détail d'une monture |
| `GET /api/stats` | compteurs globaux |
