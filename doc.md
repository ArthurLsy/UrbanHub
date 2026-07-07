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
| 1 — Infrastructure Cloud & automatisation (EC04-1) | VPC, EC2, ALB, ECR, IAM, secrets, IaC | ✅ Réalisée |
| 2 — Sécurisation (EC04-2) | Risques, durcissement, supervision | 🟡 Partielle (mesures déjà intégrées) |
| 3 — Pipeline CI/CD (EC03-1) | build/test/qualité/sécurité/déploiement | ⬜ À faire |
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

## Mission 3 — Pipeline CI/CD (EC03-1) ⬜

*À construire.* Cible : build reproductible → tests → qualité (SonarQube) →
scan sécurité → image Docker → push ECR → déploiement via SSM. L'infra est
**déjà prête** à l'accueillir : rôle OIDC `role-urbanhub-ci`, dépôt ECR
`urbanhub-backend`, déclenchement de déploiement par `ssm:SendCommand`.
*(Section à rédiger lors de la réalisation.)*

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
