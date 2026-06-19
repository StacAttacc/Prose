# Prose

An internship management platform for higher-education programs. Students
upload CVs, employers post and review applications, professors approve
workplace evaluations, and program managers oversee the full agreement
lifecycle, from CV approval through signed internship agreements to
end-of-term evaluations.

Built as a team class project (Sprints 1 to 3) by five contributors. UI is
primarily in French with i18next wiring for English.

## Tech stack

- **Backend**: Java 21, Spring Boot 3.5.5, Spring Security + JWT, Spring
  Data JPA / Hibernate, PostgreSQL, Maven
- **Frontend**: React 19, Vite 7, Tailwind CSS 4, React Router 7, axios,
  i18next, React PDF
- **Tests**: JUnit + Spring Security Test (backend), Vitest + Testing
  Library + MSW (frontend)
- **Infra**: Docker Compose for PostgreSQL

## Domain model

Four user roles drive the workflow:

| Role | Capabilities |
|---|---|
| **Étudiant** (student) | Upload CV, browse stages, apply to offers, sign ententes |
| **Employeur** (employer) | Post stages, review applicants, schedule interviews, sign ententes, evaluate students |
| **Professeur** (professor) | Approve workplace evaluations for their students |
| **Gestionnaire** (program manager) | Approve CVs, oversee ententes, manage the global state of the program |

The lifecycle a single internship travels through:
`CV → Stage offer → Candidature → Convocation (interview) → Entente (agreement) → Evaluation`.

## Quick start

### Prerequisites

- JDK 21
- Node.js 20+ and npm
- Docker (for the PostgreSQL container)

### 1. Database

```bash
cp .env.example .env       # then edit values as needed
docker compose up -d       # starts PostgreSQL on :5432
```

### 2. Backend

```bash
./mvnw spring-boot:run     # http://localhost:8080
```

On first run, four demo users are seeded (see below). Schema is created
automatically via `spring.jpa.hibernate.ddl-auto=update`.

### 3. Frontend

```bash
cd prose-fe
cp .env.example .env
npm install
npm run dev                # http://localhost:5173
```

## Demo accounts

The backend seeds these users on startup for local development. Password for
all of them is `password123`.

| Role | Email |
|---|---|
| Étudiant | `etudiant@etudiant.com` |
| Employeur | `employeur@employeur.com` |
| Gestionnaire | `gestionnaire@gestionnaire.com` |
| Professeur | `professeur@professeur.com` |

> The seeding runner is gated on `@Profile({"dev", "local", "test"})` and
> `spring.profiles.active` defaults to `dev`. For LAN or production, set
> `SPRING_PROFILES_ACTIVE=prod` (or any other value) to skip seeding.

## Deployment

The production setup is a split-stack architecture, fully on free tiers:

| Layer | Host | Notes |
|---|---|---|
| Frontend | **Vercel** (Hobby) | React build, auto-deployed on push via GitHub integration |
| Backend | **Oracle Cloud Infrastructure** (Always Free) | Spring Boot jar on an Ampere A1 ARM VM |
| Database | **Neon** (free tier) | Managed Postgres, branch-per-PR ready |
| Ingress | **Cloudflare Tunnel** | Public HTTPS for the backend without port forwarding or static IP |

### Backend on Oracle (Ampere A1 ARM)

1. Provision a `VM.Standard.A1.Flex` instance (1 OCPU, 6 GB RAM is enough for
   one Prose backend; the Always Free pool gives you 4 OCPU / 24 GB total).
2. Install a JDK 21 ARM build (Temurin or Corretto) plus `docker` and
   `docker compose`.
3. Set the runtime environment on the host (or in a systemd `EnvironmentFile`):
   ```bash
   PROSE_JWT_SECRET=...                # 256-bit hex string
   PROSE_DB_URL=jdbc:postgresql://...neon.tech/prose?sslmode=require
   PROSE_DB_USERNAME=...
   PROSE_DB_PASSWORD=...
   SPRING_PROFILES_ACTIVE=prod         # disables the demo-user seeder
   ```
4. Build and run:
   ```bash
   ./mvnw -DskipTests clean package
   java -jar target/prose-0.0.1-SNAPSHOT.jar
   ```
   Wrap in a systemd unit so it auto-restarts on crash and on boot.

### Database on Neon

1. Create a Neon project, copy the JDBC connection string (with `?sslmode=require`).
2. Apply any patches from [`db/patches/`](db/patches/README.md) once against the
   fresh database. Schema is then maintained by `spring.jpa.hibernate.ddl-auto=update`.

### Ingress via Cloudflare Tunnel

1. Install `cloudflared` on the Oracle VM, authenticate against your
   Cloudflare account, create a tunnel pointing at `http://localhost:8080`.
2. Bind it to a hostname like `api.yourdomain.com`. Cloudflare issues the
   TLS cert automatically.
3. No inbound ports need to be opened on the OCI security list.

### Frontend on Vercel

1. Import the repo on Vercel with `prose-fe/` as the project root.
2. Set `VITE_API_BASE_URL=https://api.yourdomain.com` in the project's
   environment variables.
3. Vercel rebuilds on every push to `main`. No GitHub Actions required for
   the frontend.

### Local / LAN-only deploy

If you'd rather skip the cloud entirely, the same jar runs on any LAN host:
build with `./mvnw clean package`, set the env vars above pointing at a local
Postgres, run the jar, and point the frontend build at
`http://<lan-host>:8080`.

## Tests

```bash
./mvnw test                # backend
cd prose-fe && npm test    # frontend
```

## Project layout

```
.
├── src/main/java/com/AL565/prose/   # Spring Boot app
│   ├── controller/                  # REST controllers per role
│   ├── model/                       # JPA entities (Stage, CV, Candidature, Entente, …)
│   ├── repository/                  # Spring Data repositories
│   ├── security/                    # JWT filter, exceptions
│   └── service/                     # business logic + DTOs
├── prose-fe/src/
│   ├── components/                  # grouped by role: etudiant-, employeur-, gestionnaire-, professeur-
│   ├── services/                    # axios clients per role
│   └── ...                          # context providers, routes, i18n
├── db/patches/                      # manual SQL patches for ddl-auto edge cases
└── compose.yaml                     # PostgreSQL dev container
```

## Internationalization

`prose-fe/public/locales/{en,fr}/translations.json` holds bilingual strings
loaded via `i18next`. Coverage is heavier in French (the original language
of the project); contributions to the English translation are welcome.

## Contributors

In alphabetical order:

- [@LuisFonmarty](https://github.com/LuisFonmarty)
- [@MokhttaAr](https://github.com/MokhttaAr)
- [@RobyCeo](https://github.com/RobyCeo)
- [@StacAttacc](https://github.com/StacAttacc)
- [@ZacharieBouchard16](https://github.com/ZacharieBouchard16)

## License

[MIT](LICENSE). See file for copyright line.

---

# Prose (français)

Plateforme de gestion de stages pour programmes d'enseignement supérieur.
Les étudiants déposent leur CV, les employeurs publient des offres et
évaluent les candidatures, les professeurs approuvent les évaluations en
milieu de travail, et les gestionnaires de programme supervisent tout le
cycle de vie des ententes, de l'approbation du CV jusqu'aux évaluations
de fin de session, en passant par la signature des ententes de stage.

Réalisé en équipe dans le cadre d'un projet de classe (sprints 1 à 3) par
cinq personnes. L'interface est principalement en français, avec une
infrastructure i18next pour l'anglais.

## Pile technique

- **Backend** : Java 21, Spring Boot 3.5.5, Spring Security + JWT, Spring
  Data JPA / Hibernate, PostgreSQL, Maven
- **Frontend** : React 19, Vite 7, Tailwind CSS 4, React Router 7, axios,
  i18next, React PDF
- **Tests** : JUnit + Spring Security Test (backend), Vitest + Testing
  Library + MSW (frontend)
- **Infra** : Docker Compose pour PostgreSQL

## Modèle du domaine

Quatre rôles utilisateurs animent le flux :

| Rôle | Capacités |
|---|---|
| **Étudiant** | Déposer un CV, parcourir les stages, postuler aux offres, signer des ententes |
| **Employeur** | Publier des stages, évaluer les candidatures, planifier des entrevues, signer des ententes, évaluer les étudiants |
| **Professeur** | Approuver les évaluations en milieu de travail de ses étudiants |
| **Gestionnaire** | Approuver les CV, superviser les ententes, gérer l'état global du programme |

Le cycle de vie d'un stage :
`CV → Offre de stage → Candidature → Convocation (entrevue) → Entente → Évaluation`.

## Démarrage rapide

### Prérequis

- JDK 21
- Node.js 20+ et npm
- Docker (pour le conteneur PostgreSQL)

### 1. Base de données

```bash
cp .env.example .env       # ajustez les valeurs au besoin
docker compose up -d       # démarre PostgreSQL sur :5432
```

### 2. Backend

```bash
./mvnw spring-boot:run     # http://localhost:8080
```

Au premier démarrage, quatre comptes de démonstration sont créés (voir
ci-dessous). Le schéma est généré automatiquement via
`spring.jpa.hibernate.ddl-auto=update`.

### 3. Frontend

```bash
cd prose-fe
cp .env.example .env
npm install
npm run dev                # http://localhost:5173
```

## Comptes de démonstration

Le backend crée ces utilisateurs au démarrage pour le développement local.
Le mot de passe est `password123` pour tous.

| Rôle | Courriel |
|---|---|
| Étudiant | `etudiant@etudiant.com` |
| Employeur | `employeur@employeur.com` |
| Gestionnaire | `gestionnaire@gestionnaire.com` |
| Professeur | `professeur@professeur.com` |

> Le seeder est encadré par `@Profile({"dev", "local", "test"})` et
> `spring.profiles.active` vaut `dev` par défaut. Pour un déploiement LAN
> ou en production, définissez `SPRING_PROFILES_ACTIVE=prod` (ou toute
> autre valeur) afin de désactiver le seeding.

## Déploiement

L'architecture de production est répartie sur plusieurs services, entièrement
sur des paliers gratuits :

| Couche | Hébergement | Notes |
|---|---|---|
| Frontend | **Vercel** (Hobby) | Build React, redéployé automatiquement à chaque push via l'intégration GitHub |
| Backend | **Oracle Cloud Infrastructure** (Always Free) | jar Spring Boot sur une VM ARM Ampere A1 |
| Base de données | **Neon** (palier gratuit) | Postgres infogéré, prêt pour le branchement par PR |
| Ingress | **Cloudflare Tunnel** | HTTPS public vers le backend, sans redirection de ports ni IP statique |

### Backend sur Oracle (Ampere A1 ARM)

1. Provisionnez une instance `VM.Standard.A1.Flex` (1 OCPU, 6 Go de RAM
   suffisent pour un backend Prose ; le palier Always Free offre au total
   4 OCPU / 24 Go).
2. Installez un JDK 21 ARM (Temurin ou Corretto), ainsi que `docker` et
   `docker compose`.
3. Définissez l'environnement d'exécution sur l'hôte (ou dans un
   `EnvironmentFile` systemd) :
   ```bash
   PROSE_JWT_SECRET=...                # chaîne hexadécimale 256 bits
   PROSE_DB_URL=jdbc:postgresql://...neon.tech/prose?sslmode=require
   PROSE_DB_USERNAME=...
   PROSE_DB_PASSWORD=...
   SPRING_PROFILES_ACTIVE=prod         # désactive le seeder de comptes de démo
   ```
4. Compilez et lancez :
   ```bash
   ./mvnw -DskipTests clean package
   java -jar target/prose-0.0.1-SNAPSHOT.jar
   ```
   Encapsulez le tout dans une unité systemd pour le redémarrage automatique
   en cas de plantage ou de reboot.

### Base de données sur Neon

1. Créez un projet Neon, copiez la chaîne de connexion JDBC (avec
   `?sslmode=require`).
2. Appliquez une fois les correctifs de [`db/patches/`](db/patches/README.md)
   sur la base neuve. Le schéma est ensuite maintenu par
   `spring.jpa.hibernate.ddl-auto=update`.

### Ingress via Cloudflare Tunnel

1. Installez `cloudflared` sur la VM Oracle, authentifiez-vous auprès de
   votre compte Cloudflare, créez un tunnel pointant vers
   `http://localhost:8080`.
2. Liez-le à un nom d'hôte du type `api.votredomaine.com`. Cloudflare émet
   le certificat TLS automatiquement.
3. Aucun port entrant n'est à ouvrir dans la security list OCI.

### Frontend sur Vercel

1. Importez le dépôt dans Vercel avec `prose-fe/` comme racine du projet.
2. Définissez `VITE_API_BASE_URL=https://api.votredomaine.com` dans les
   variables d'environnement du projet Vercel.
3. Vercel reconstruit à chaque push sur `main`. Aucun workflow GitHub
   Actions n'est nécessaire pour le frontend.

### Déploiement local / réseau local

Si vous préférez éviter le cloud, le même jar fonctionne sur n'importe quel
hôte du réseau local : compilez avec `./mvnw clean package`, définissez les
variables d'environnement ci-dessus en pointant vers un Postgres local,
exécutez le jar, et compilez le frontend en pointant sur
`http://<hôte-lan>:8080`.

## Tests

```bash
./mvnw test                # backend
cd prose-fe && npm test    # frontend
```

## Arborescence du projet

```
.
├── src/main/java/com/AL565/prose/   # application Spring Boot
│   ├── controller/                  # contrôleurs REST par rôle
│   ├── model/                       # entités JPA (Stage, CV, Candidature, Entente, …)
│   ├── repository/                  # dépôts Spring Data
│   ├── security/                    # filtre JWT, exceptions
│   └── service/                     # logique métier + DTO
├── prose-fe/src/
│   ├── components/                  # regroupés par rôle : etudiant-, employeur-, gestionnaire-, professeur-
│   ├── services/                    # clients axios par rôle
│   └── ...                          # providers de contexte, routes, i18n
├── db/patches/                      # correctifs SQL manuels pour les cas limites de ddl-auto
└── compose.yaml                     # conteneur PostgreSQL de développement
```

## Internationalisation

`prose-fe/public/locales/{en,fr}/translations.json` contient les chaînes
bilingues chargées via `i18next`. La couverture est plus complète en
français (langue d'origine du projet) ; les contributions à la
traduction anglaise sont bienvenues.

## Contributeurs

Par ordre alphabétique :

- [@LuisFonmarty](https://github.com/LuisFonmarty)
- [@MokhttaAr](https://github.com/MokhttaAr)
- [@RobyCeo](https://github.com/RobyCeo)
- [@StacAttacc](https://github.com/StacAttacc)
- [@ZacharieBouchard16](https://github.com/ZacharieBouchard16)

## Licence

[MIT](LICENSE). Voir le fichier pour la mention de copyright.
