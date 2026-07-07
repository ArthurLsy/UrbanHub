# Infrastructure UrbanHub — Terraform (Dossier EC04-1)

Ce dossier contient l'ensemble de l'Infrastructure as Code (Terraform) qui
déploie le backend UrbanHub dans le cloud AWS, de façon **reproductible,
automatisée et sécurisée**.

- **Fournisseur** : AWS
- **Région** : `eu-west-3` (Paris)
- **Outil** : Terraform (≥ 1.9), AWS CLI v2
- **Compte cible** : `627403012708`

Les **choix techniques et leurs justifications** (architecture, IAM, analyse
coûts) sont centralisés dans [`../doc.md`](../doc.md). Ce fichier-ci donne la
**vue d'ensemble** et la **procédure de déploiement**.

## 1. Présentation

### Organisation en 3 modules

L'infra est découpée en trois modules Terraform indépendants, chacun avec son
propre state. Ce découpage sépare les domaines de changement (on ne rejoue pas
tout l'IAM quand on modifie une règle réseau) et limite le rayon d'impact
d'une erreur.

```
infra/terraform/
├── bootstrap/   → Bucket S3 qui héberge le state Terraform (state LOCAL)
├── iam/         → Identités & accès : OIDC, groupes, rôles (state sur S3)
└── app/         → Réseau & compute : VPC, EC2, ALB, ECR, SSM (state sur S3)
```

| Module | Rôle | State | Fréquence de changement |
|---|---|---|---|
| `bootstrap` | Crée le bucket S3 du state | Local (fichier) | Quasi jamais (1 fois) |
| `iam` | Provider OIDC, groupes humains, rôles de service | S3 `iam/` | Rare |
| `app` | VPC, Security Groups, EC2, ALB, ECR, secret SSM | S3 `app/` | Courant |

### Ce que l'infra déploie

```
        Internet ──HTTP:80──> ALB (public, 2 subnets)
                                 │  :8080 (SG à SG)
                                 ▼
                          EC2 t3.small (Amazon Linux 2023)
                          docker compose : backend + TimescaleDB
                          administrée par SSM (aucun SSH)
                             │ pull image        │ lit secret
                             ▼                    ▼
                            ECR            SSM Parameter Store
                     urbanhub-backend       /urbanhub/db/password
```

### Principes structurants

- **Aucune clé AWS statique dans le CI** : le pipeline s'authentifie par OIDC
  (rôle `role-urbanhub-ci`).
- **Aucun secret en clair** : le mot de passe de la base est généré par
  Terraform et stocké chiffré dans SSM Parameter Store.
- **Moindre privilège** : chaque policy est scopée par tag `Project=urbanhub`
  ou par préfixe de ressource `urbanhub-*`.
- **Pas de SSH** : administration et déploiement via AWS Systems Manager (SSM).
- **Simplicité assumée** : une seule instance en `docker compose`, pas
  d'orchestrateur, adapté à une équipe au DevOps limité.

Détails et justifications complètes (IAM, architecture, **analyse coûts**) :
[`../doc.md`](../doc.md).

## 2. Prérequis

| Outil / élément | Détail |
|---|---|
| Terraform | ≥ 1.9 (`terraform version`) |
| AWS CLI | v2, configuré (`aws sts get-caller-identity`) |
| Credentials AWS | Un utilisateur/rôle avec droits admin pour le **premier** apply (bootstrap + iam créent des ressources IAM) |
| Compte AWS | ID connu (ici `627403012708`) |

> Les credentials de bootstrap sont volontairement gardés à part (compte
> « break-glass »), non gérés par Terraform — cf. [`../doc.md`](../doc.md).

## 3. Procédure de déploiement

L'ordre est **impératif** : chaque module dépend des précédents.

### Étape 1 — Bucket de state (une seule fois)

```bash
cd infra/terraform/bootstrap
terraform init
terraform apply -var="account_id=627403012708"
```

Crée le bucket `urbanhub-terraform-state-627403012708` (versionné, chiffré,
non public) qui stockera le state des deux autres modules.

### Étape 2 — Identités & accès (IAM)

```bash
cd ../iam
terraform init      # configure le backend S3 créé à l'étape 1
terraform plan      # à relire avant d'appliquer
terraform apply
```

Crée le provider OIDC GitHub, les groupes `urbanhub-admin` / `urbanhub-team`,
et les rôles `role-urbanhub-ci` (déploiement) et `role-urbanhub-ec2`
(instance). À faire **avant** `app`, qui référence l'instance profile.

### Étape 3 — Réseau & compute (application)

```bash
cd ../app
terraform init
terraform plan
terraform apply
```

Crée le VPC, les Security Groups, le dépôt ECR, le secret SSM, l'instance EC2
et l'ALB. En sortie :

```
alb_dns_name       = "http://urbanhub-alb-xxxxxxxx.eu-west-3.elb.amazonaws.com"
ecr_repository_url = "627403012708.dkr.ecr.eu-west-3.amazonaws.com/urbanhub-backend"
instance_id        = "i-xxxxxxxxxxxxxxxxx"
```

### Étape 4 — Première image applicative

À ce stade, l'infra tourne mais le conteneur backend ne démarre pas encore :
**aucune image n'est présente dans ECR**. C'est le rôle du pipeline CI/CD
(Mission 3) de construire l'image, la pousser sur ECR, puis déclencher le
redéploiement sur l'instance via SSM. Tant que l'image n'existe pas, seule la
base de données tourne (c'est normal).

## 4. Vérification du déploiement

```bash
# Instance démarrée et pilotable par SSM (sans SSH)
aws ec2 describe-instance-status --instance-ids <instance_id> --region eu-west-3
aws ssm describe-instance-information --region eu-west-3 \
  --filters "Key=InstanceIds,Values=<instance_id>"

# ALB joignable (502/503 tant qu'il n'y a pas d'image backend = normal)
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://<alb_dns_name>/actuator/health

# La base n'est PAS exposée publiquement (doit être filtré)
nc -z -w5 <ip_publique_instance> 5432   # échec attendu
```

## 5. Détruire l'infra

```bash
cd infra/terraform/app  && terraform destroy   # d'abord le compute
cd ../iam               && terraform destroy    # puis l'IAM
# bootstrap : le bucket de state a prevent_destroy ; le vider/supprimer
# manuellement si nécessaire.
```

## 6. Points d'attention

- **GitHub vs GitLab** : le sujet attend un rendu GitLab ; le développement est
  actuellement sur GitHub et l'OIDC est configuré pour GitHub Actions. À
  reprendre avant le rendu final (cf. [`../doc.md`](../doc.md)).
- **HTTP seulement** : pas de nom de domaine → pas de certificat ACM. Passage à
  HTTPS documenté comme piste d'amélioration (cf. [`../doc.md`](../doc.md)).
- **State = données sensibles** : le state `app/` contient le mot de passe DB.
  Le bucket est chiffré et son accès est refusé au groupe `urbanhub-team`.
