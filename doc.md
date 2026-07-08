# Documentation technique — UrbanHub (EC03 / EC04)

Document unique de documentation et de justification des choix techniques pour
l'ensemble de l'épreuve. Il couvre les 4 missions ; chaque section indique son
état d'avancement.

- **Projet** : UrbanHub — plateforme de capteurs smart-city (backend Spring
  Boot / Java / Gradle, base TimescaleDB, ingestion MQTT + HTTP).
- **Cible** : industrialisation (CI/CD), déploiement cloud (AWS), sécurisation.
- **Cloud** : AWS, région `eu-west-3` (Paris), compte `627403012708`.
- **IaC** : Terraform (≥ 1.9).

> La **procédure de déploiement** pas-à-pas est dans un fichier séparé,
> [`infra/README.md`](infra/README.md) (livrable « ReadMe »). Le présent
> document est le livrable « Documentation » : il explique **pourquoi** ces
> choix, pas seulement **comment** déployer.

| Mission | Périmètre | État |
|---|---|---|
| 1 — Infrastructure Cloud & automatisation (EC04-1) | VPC, EC2, ALB, ECR, IAM, secrets, IaC | ✅ Réalisée (infra détruite entre les sessions pour maîtriser le coût — le code est prêt, à ré-appliquer avant démo) |
| 2 — Sécurisation (EC04-2) | Risques, durcissement, supervision | 🟡 Partielle (mesures déjà intégrées) |
| 3 — Pipeline CI/CD (EC03-1) | build/test/qualité/sécurité/déploiement | ✅ Workflow écrit, pas encore exécuté en conditions réelles (infra à ré-appliquer) |
| 4 — Documentation technique du pipeline (EC03-2) | doc du pipeline | ⬜ À faire |

---

## Fil directeur et cohérence de la démarche

Le contexte impose trois contraintes qui reviennent dans **tous** les choix
ci-dessous, et servent de critère d'arbitrage :

1. **On-premise → cloud progressif** : on reproduit d'abord l'existant
   (`docker compose`) dans le cloud, sans tout réécrire.
2. **Équipe à DevOps limité** : à chaque embranchement, on choisit la solution
   la plus simple qui répond au besoin, quitte à documenter une alternative
   plus « cloud-native » comme évolution future. La surcomplexité est
   explicitement pénalisée par le sujet.
3. **Sécurité transverse (DevSecOps)** : la sécurité n'est pas une mission à
   part qu'on ajoute à la fin — elle est présente dès la Mission 1 (OIDC,
   secrets, moindre privilège, pas de SSH). La Mission 2 la formalise et la
   complète, elle ne la découvre pas.

---

## Mission 1 — Infrastructure Cloud & automatisation (EC04-1) ✅

### 1.1 Architecture générale

```
        Internet ──HTTP:80──> ALB (public, 2 subnets, 2 AZ)
                                 │  :8080  (Security Group à Security Group)
                                 ▼
                          EC2 t3.small — Amazon Linux 2023
                          docker compose : backend + TimescaleDB
                          administrée par SSM (aucun port SSH ouvert)
                             │ pull image          │ lit le secret DB
                             ▼                      ▼
                            ECR              SSM Parameter Store (SecureString)
                     urbanhub-backend          /urbanhub/db/password
```

Périmètre volontairement limité (le sujet le permet) : centré sur le service
applicatif backend. Le front-end et le simulateur IoT (MQTT) ne sont pas
déployés dans le cloud — désactivés ici (`MQTT_ENABLED=false`) et décrits, pas
recréés.

### 1.2 Organisation de l'IaC — 3 modules Terraform

| Module | Rôle | State |
|---|---|---|
| `infra/terraform/bootstrap` | Crée le bucket S3 du state | Local (fichier) |
| `infra/terraform/iam` | OIDC, groupes, rôles | S3 `iam/` |
| `infra/terraform/app` | VPC, SG, EC2, ALB, ECR, SSM | S3 `app/` |

**Pourquoi découper ?** Séparer les domaines de changement : on ne rejoue pas
tout l'IAM pour modifier une règle réseau, et une erreur dans `app` ne peut pas
corrompre le state IAM. Le state est distant (S3, chiffré, versionné) pour
qu'il soit partageable et non lié à une machine ; verrouillage natif S3
(Terraform ≥ 1.10), ce qui évite d'ajouter une table DynamoDB (une brique de
moins à gérer).

### 1.3 Choix d'architecture et justifications

#### EC2 + `docker compose`, pas ECS/Fargate/Kubernetes
Le backend tourne déjà en `docker compose` en local. Le reproduire sur une EC2
est le chemin le plus court entre « ça marche en local » et « ça marche en
prod » : aucune abstraction nouvelle à apprendre. ECS/EKS apporteraient
l'autoscaling et un plan de contrôle managé, mais c'est du sur-dimensionnement
pour un service sans contrainte de charge actuelle. **Choix réversible** :
migrer vers ECS plus tard ne toucherait ni l'IAM ni l'image Docker.

#### TimescaleDB en conteneur, pas RDS
RDS PostgreSQL **ne supporte pas** l'extension TimescaleDB, dont dépend
l'`hypertable` du projet. Garder la base en conteneur (comme en local) préserve
la compatibilité et évite de réécrire la couche d'accès aux données. *Limite
assumée* : la base partage le sort de l'instance (pas de HA, sauvegarde à
ajouter — cf. pistes d'amélioration).

#### Subnets publics + Security Groups, sans NAT Gateway
L'instance est dans un subnet public, mais **son Security Group n'autorise
aucune entrée depuis Internet** : seul l'ALB (SG distinct) atteint le port
8080. Le vrai contrôle d'accès est le SG, pas le placement réseau. Un subnet
privé + NAT Gateway ajouterait une défense en profondeur, mais le NAT coûte
~32 €/mois + trafic pour une seule instance : disproportionné. C'est le point
d'amélioration n°1 pour une vraie prod.

#### Administration et déploiement par SSM, pas SSH
Aucune paire de clés SSH, aucun port 22 ouvert. L'accès shell passe par AWS
Systems Manager Session Manager (rôle `role-urbanhub-ec2` +
`AmazonSSMManagedInstanceCore`). Cela supprime toute la gestion des clés SSH et
la surface d'attaque associée. Bonus : c'est le **même** mécanisme (SSM
`SendCommand`) que le pipeline CI utilisera pour déployer, en remplacement du
`ssh + SSH_PRIVATE_KEY` du `.gitlab-ci.yml` on-premise actuel.

### 1.4 IAM — identités et accès (volet DevSecOps de la Mission 1)

Ressources créées :

| Ressource | But |
|---|---|
| Provider OIDC GitHub | Fédère l'identité de GitHub Actions vers AWS |
| Groupe `urbanhub-admin` | Contrôle complet **du projet** (pas admin AWS global) |
| Groupe `urbanhub-team` | Exploitation (start/stop) + lecture seule, sans IAM |
| Rôle `role-urbanhub-ci` | Assumé par le CI via OIDC — **aucun droit IAM** |
| Rôle `role-urbanhub-ec2` | Instance profile — lecture secrets, pull ECR, logs |

#### OIDC plutôt qu'une clé d'accès statique dans le CI
Une clé statique doit être stockée (donc peut fuiter), tourne rarement, et
reste valide même si le repo est compromis. Avec OIDC, GitHub Actions présente
un jeton signé, valable le temps du job, vérifié par AWS avant de délivrer des
credentials temporaires. Rien à stocker, rien à faire tourner. Contrepartie :
mise en place initiale plus complexe (provider + condition de confiance) —
acceptée car faite une seule fois. La condition de confiance restreint
l'assume-role à `repo:ArthurLsy/UrbanHub:ref:refs/heads/main` : un push sur une
autre branche ou depuis un fork ne peut pas assumer le rôle.

#### 2 groupes humains, pas 3 (Admin/Dev/Analyst du TD1)
Le découpage à trois groupes vaut pour une équipe où des besoins distincts sont
stables (un analyste qui ne doit jamais toucher l'infra). Pour une équipe aussi
réduite, la seule frontière qui compte est **admin vs non-admin** ; séparer
« dev » et « analyst » ajoute de la gestion sans bénéfice réel. `urbanhub-team`
réunit donc exploitation + lecture seule. Scinder plus tard = changement
Terraform mineur.

#### Le rôle CI n'a aucun droit IAM
Leçon directe du TD1-b : donner `IAMFullAccess` à un pipeline permet à un
attaquant qui le compromet de se créer des accès persistants. `role-urbanhub-ci`
ne sait faire que deux choses : pousser une image sur *un* repo ECR précis, et
déclencher un déploiement SSM sur *les* instances taguées `Project=urbanhub`.
Les changements d'IAM restent appliqués manuellement par un admin humain
(`terraform apply` local), jamais depuis le pipeline. On sépare volontairement
« déployer l'appli » (auto, risque contenu) de « changer les droits » (manuel,
revu).

#### Moindre privilège appliqué partout
Chaque policy est scopée par tag `Project=urbanhub` ou par préfixe de ressource
`urbanhub-*` / path `/urbanhub/`. `Resource: "*"` n'est utilisé que pour les
actions qui ne supportent structurellement pas le scoping
(`ecr:GetAuthorizationToken`, `ssm:GetCommandInvocation`…).

*Limite assumée* : `ec2:RunInstances` ne se restreint que par `aws:RequestTag`
(le tag posé par la requête), alors que les actions sur ressource existante
utilisent `aws:ResourceTag`. Les deux sont couvertes, mais un oubli de tag à la
création sort du périmètre. Même limite que le TD1 (« granularité difficile de
l'IAM ») : atténuée par convention de nommage plutôt que résolue entièrement,
ce qui serait disproportionné.

### 1.5 Gestion des secrets
Le mot de passe de la base est **généré** par Terraform (`random_password`) et
stocké en `SecureString` dans SSM Parameter Store. L'instance le lit au
démarrage via son rôle, l'écrit dans un `.env` en `chmod 600`, et l'injecte aux
conteneurs par `env_file`. Il n'apparaît jamais dans le code, le
`docker-compose.yml` déployé ou un script versionné.

### 1.6 Analyse performances / coût

| Ressource | Détail | ~ €/mois |
|---|---|---|
| EC2 `t3.small` | 2 vCPU, 2 Go, 24/7 | ~15 € |
| Volume EBS gp3 | 20 Go | ~1,7 € |
| Application Load Balancer | 1 ALB, LCU faible | ~18-20 € |
| ECR | stockage images (<1 Go) | ~0,1 € |
| SSM Parameter Store | Standard | gratuit |
| S3 (state Terraform) | quelques Ko | ~0 € |
| **Total estimé** | | **~35-40 €/mois** |

Poste le plus lourd : l'ALB (presque le prix de l'instance). Alternative
d'économie pour une démo : exposer l'instance directement (Elastic IP + SG) et
supprimer l'ALB (~-19 €/mois), au prix de la terminaison TLS et d'un point
d'entrée stable. ALB conservé car il prépare proprement HTTPS et le
health-check. Estimations à la demande ; un Savings Plan 1 an réduirait l'EC2
d'environ 30 %.

**Performances** : `t3.small` (2 Go) plutôt que `t3.micro` (1 Go) car la JVM et
TimescaleDB cohabitent sur la même machine — 1 Go serait à risque d'OOM. Les T3
sont « burstable », adaptés à des pointes ponctuelles. Si l'ingestion MQTT
devient continue : passer à une famille `m` ou séparer la base.

### 1.6bis Corrections apportées en préparant la Mission 3

En construisant le pipeline CI/CD, deux choix de la Mission 1 se sont révélés
incompatibles avec un déploiement continu — corrigés avant d'écrire le workflow :

- **ECR `IMMUTABLE` → `MUTABLE`** (`infra/terraform/app/ecr.tf`) : un repo
  ECR `IMMUTABLE` interdit de re-pousser un tag déjà existant. Le déploiement
  pull `:latest`, qui doit justement être réécrit à chaque build : les deux
  étaient incompatibles (le tout premier push aurait réussi, tous les
  suivants auraient échoué). Passé en `MUTABLE`, avec double tag `:latest` +
  `:<git-sha>` pour conserver une traçabilité par build malgré tout.
- **`role-urbanhub-ci` : ajout de `ec2:DescribeInstances`**
  (`infra/terraform/iam/iam-role-ci.tf`) : nécessaire pour que le job
  `deploy` retrouve l'instance cible par tag plutôt que par un ID en dur.
  Action de lecture seule, `Resource: "*"` (ne supporte pas le scoping —
  cohérent avec le reste des permissions "descriptives" déjà accordées ailleurs).

### 1.7 Vérifications effectuées (pas seulement « sur le papier »)
- IAM validé avec `aws iam simulate-principal-policy` : le rôle CI ne peut pas
  créer d'utilisateur IAM (`implicitDeny`), peut pousser sur `urbanhub-backend`
  mais pas sur un autre repo (`implicitDeny`) ; `urbanhub-team` ne peut jamais
  terminer une instance (`explicitDeny`).
- Instance : `running`, enregistrée dans SSM (`Online`) → administration sans
  SSH opérationnelle.
- Conteneur TimescaleDB : `Up (healthy)`.
- Sécurité réseau testée depuis l'extérieur : ports 5432 (DB) et 8080 (direct)
  filtrés ; ALB joignable en HTTP.
- Backend non démarré à ce stade : **normal**, aucune image dans ECR (Mission
  3). La cible ALB passera `healthy` au premier déploiement d'image.

---

## Mission 2 — Sécurisation (EC04-2) 🟡

Mesures **déjà** intégrées dès la Mission 1 (la sécurité est transverse) :

| Exigence du sujet | Mesure en place |
|---|---|
| Réduire la surface d'exposition | SG : seul l'ALB atteint le backend ; DB jamais exposée ; pas de port SSH |
| Protéger les données sensibles | Secret DB généré + SSM SecureString, jamais en clair dans le repo |
| Gestion des accès (moindre privilège) | Groupes/rôles scopés par tag/ARN ; rôle CI sans droit IAM |
| Sécurité dans le cycle de vie | Auth CI par OIDC (pas de clé statique) ; state chiffré |
| Corriger de mauvaises pratiques | Deny explicite du groupe `team` sur le bucket de state (contient des secrets) ; mot de passe en dur dans `application-production.properties` signalé pour correction |

**Reste à faire** pour compléter la Mission 2 : analyse formelle et
classification des risques (tableau menace / impact / probabilité / mesure) ;
supervision (logs CloudWatch, métriques, alertes) ; scan de vulnérabilités des
dépendances ; passage HTTPS. *(Section à compléter au fil de l'avancement.)*

---

## Mission 3 — Pipeline CI/CD (EC03-1) ✅ (workflow écrit, non encore exécuté en réel)

Workflow : [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml).

### 3.1 Pourquoi GitHub Actions et pas GitLab CI

Le sujet attend un rendu GitLab, mais le développement a lieu sur GitHub
(`ArthurLsy/UrbanHub`) — cf. la réserve déjà notée en Mission 1. Le pipeline a
donc été construit pour **GitHub Actions**, en reprenant la structure et la
logique de l'ancien `.gitlab-ci.yml` (mêmes 4 grandes étapes : build, test,
qualité, déploiement), adaptée aux mécanismes GitHub (OIDC natif, artefacts,
Security tab). *À reprendre pour GitLab CI avant le rendu final si le dépôt
bascule — la logique métier ne change pas, seule la syntaxe et l'auth OIDC
changent (issuer `gitlab.com` au lieu de `token.actions.githubusercontent.com`).*

### 3.2 Découpage en 6 jobs

| Job | Rôle | Dépend de | Sur quels événements |
|---|---|---|---|
| `build` | `./gradlew assemble` — reproductibilité du build | — | push + PR sur main |
| `test` | `./gradlew test jacocoTestReport`, résultats publiés en annotations | `build` | push + PR sur main |
| `quality` | Analyse SonarQube, quality gate bloquant | `test` | push + PR sur main |
| `security` | Scan de dépendances Trivy (SARIF + gate CRITICAL) | — (parallèle) | push + PR sur main |
| `package` | Build image Docker (`Dockerfile.prod`), scan, push ECR | `test`, `quality`, `security` | **push sur main uniquement** |
| `deploy` | Déclenchement du redéploiement via SSM | `package` | **push sur main uniquement** |

Le séquençage reproduit celui de l'ancien pipeline (build → test → qualité →
déploiement), en ajoutant un job `security` dédié (le sujet le demande
explicitement, l'ancien pipeline n'en avait pas) et un job `package` distinct
du déploiement (produire l'artefact et le déployer sont deux responsabilités
différentes, avec des échecs de nature différente).

`package` et `deploy` ne tournent que sur push vers `main` : sur une pull
request, le code est construit, testé, analysé et scanné, mais aucune image
n'est publiée ni déployée — exactement la même logique que `rules: if
$CI_COMMIT_BRANCH == 'main'` / `only: main` de l'ancien `.gitlab-ci.yml`.

### 3.3 Authentification AWS : OIDC, pas de secret statique

`package` et `deploy` assument `role-urbanhub-ci` (créé en Mission 1) via
`aws-actions/configure-aws-credentials`. Aucun `AWS_ACCESS_KEY_ID` /
`AWS_SECRET_ACCESS_KEY` en secret GitHub : la confiance vient de la condition
OIDC (dépôt + branche `main`), pas d'une clé qui pourrait fuiter. Seuls ces
deux jobs reçoivent la permission `id-token: write` — le reste du workflow
(`build`, `test`, `quality`, `security`) n'a aucun accès AWS, cohérent avec le
principe de moindre privilège déjà appliqué à l'IAM.

### 3.4 Artefact déployable : `Dockerfile.prod`

Le `Dockerfile` existant ne produit **pas** d'artefact exécutable : il sert
uniquement au dev local, où `docker-compose.yml` lance `./gradlew bootRun`
(hot-reload). Pour la CI, un `Dockerfile.prod` dédié a été ajouté :
build multi-stage (`bootJar` dans un stage JDK, puis copie du jar dans un
stage **JRE** minimal), utilisateur non-root, `ENTRYPOINT` explicite. Séparer
les deux Dockerfile évite de complexifier le chemin de dev pour satisfaire un
besoin de prod, et inversement.

Chaque build pousse **deux tags** sur la même image : `:latest` (mobile,
utilisé par le déploiement) et `:<git-sha>` (fixe, traçabilité/rollback). Ce
choix a nécessité de revenir sur une décision de la Mission 1 : le dépôt ECR
avait été créé en `IMMUTABLE`, ce qui aurait interdit de re-pousser `:latest`
à chaque build — corrigé en `MUTABLE` (cf. Mission 1, § 1.6bis ci-dessous).

### 3.5 Sécurité (DevSecOps) dans le pipeline

- **Scan de dépendances** (job `security`, Trivy `fs`) : rapport complet
  toujours publié dans l'onglet *Security* du repo (SARIF), même si le job
  échoue ensuite ; un second passage, bloquant uniquement sur `CRITICAL`,
  fait échouer le pipeline. Sévérité `HIGH` remontée mais non bloquante — un
  `HIGH` mérite d'être vu, pas nécessairement d'arrêter tout déploiement pour
  une équipe qui débute en DevSecOps (éviter le pipeline "qui bloque tout le
  temps" que plus personne ne regarde).
- **Scan de l'image** (job `package`, Trivy `image`) : même logique, sur
  l'image buildée juste avant de la pousser sur ECR — double contrôle avec le
  scan `scan_on_push` déjà configuré sur le repo ECR (Mission 1), qui lui agit
  après coup, côté registre.
- **Quality gate Sonar bloquant** : `sonar.qualitygate.wait=true` (déjà dans
  `build.gradle`) fait échouer la tâche Gradle — donc le job — si le gate est
  rouge, ce qui bloque `package`/`deploy` en aval.

### 3.6 Déploiement sans SSH, instance retrouvée dynamiquement

Le job `deploy` ne connaît **aucun ID d'instance en dur** : il interroge
`ec2:DescribeInstances` (tag `Project=urbanhub`, état `running`) pour trouver
sa cible, puis déclenche `/opt/urbanhub/redeploy.sh` via `ssm:SendCommand`
(script créé par le `user-data` Terraform de la Mission 1, cf.
`infra/terraform/app/templates/user_data.sh.tpl`). Ce choix rend le pipeline
résilient à une recréation de l'instance (nouvel ID) sans toucher au workflow.
Le job **attend activement** le résultat de la commande SSM (jusqu'à 2 min) et
échoue explicitement si le redéploiement échoue côté instance — pas de faux
positif "commande envoyée = déploiement réussi".

### 3.7 Prérequis (secrets et variables GitHub)

| Nom | Type | Valeur |
|---|---|---|
| `SONAR_HOST_URL` | Secret | URL de l'instance SonarQube auto-hébergée (fournie séparément) |
| `SONAR_TOKEN` | Secret | Token d'analyse Sonar |

`AWS_ROLE_ARN` n'est **pas** un secret (c'est un identifiant, pas une
credential) : il est en dur dans le workflow (`env:`), assumable uniquement
depuis ce dépôt et cette branche grâce à la condition OIDC côté AWS.

### 3.8 Point de vigilance : infra détruite entre les sessions

L'infra AWS (modules `iam` et `app`) a été détruite volontairement après la
Mission 1 pour ne pas payer pendant les périodes d'inactivité. Le pipeline a
donc été écrit et relu, mais **pas encore exécuté en conditions réelles** — un
`terraform apply` (iam puis app) est nécessaire avant le premier run réussi de
`package`/`deploy`. À faire avant la démonstration finale.

---

## Mission 4 — Documentation technique du pipeline (EC03-2) ⬜

*À rédiger une fois le pipeline en place* : logique globale et découpage, outils
et raisons du choix, prérequis (variables, secrets, services), intégration avec
l'infra cloud, interprétation des résultats (tests/qualité/sécurité), limites et
pistes d'amélioration.

---

## Limites connues et pistes d'amélioration (transverses)

1. **HTTP seulement** : pas de nom de domaine → pas de certificat ACM. En prod :
   domaine + ACM + listener HTTPS (443) + redirection 80→443.
2. **Pas de haute disponibilité** : une instance, une AZ pour le compute.
3. **Base non sauvegardée** : ajouter des snapshots EBS planifiés ou externaliser.
4. **Réseau à durcir** : subnet privé + NAT (ou VPC endpoints) si le budget le permet.
5. **GitHub vs GitLab** : le sujet attend un rendu GitLab ; le dev est sur
   GitHub et l'OIDC est configuré pour GitHub Actions. À reprendre avant le
   rendu final (adapter l'issuer OIDC et la condition `sub` au format GitLab).

---

## Retour d'expérience sur l'usage des outils d'assistance (IA)

> *Section à personnaliser — trame honnête basée sur la démarche suivie.*

- **Apports** : accélération de l'écriture du Terraform et des policies IAM
  (syntaxe, ARN, conditions), et surtout aide à **expliciter les compromis**
  (NAT vs SG, EC2 vs ECS, RDS vs conteneur) plutôt qu'à produire du code brut.
- **Limites** : l'assistant ne connaît pas le contexte implicite (budget réel,
  choix GitHub/GitLab, périmètre attendu) — chaque décision structurante a dû
  être tranchée par moi, pas déléguée. Quelques détails techniques ont nécessité
  correction (descriptions de Security Group refusant les accents/apostrophes).
- **Posture adoptée** : validation systématique avant tout `apply` sur le compte
  réel, relecture des plans Terraform, et vérification effective du résultat
  (simulation IAM, tests réseau) plutôt que confiance aveugle. Le code n'a été
  retenu que quand j'en comprenais la justification.
