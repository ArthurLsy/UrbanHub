# Architecture de déploiement — UrbanHub (EC04 Partie 1)

Ce module Terraform déploie le backend UrbanHub dans le cloud AWS
(région `eu-west-3` / Paris). Il complète le module `../iam/` (identités et
accès) et s'appuie sur le bucket de state créé par `../bootstrap/`.

## Schéma

```
                Internet
                    │  HTTP :80
                    ▼
        ┌───────────────────────┐
        │  ALB (public)          │   urbanhub-alb-sg : entrée 80 depuis 0.0.0.0/0
        │  2 subnets publics     │
        └───────────┬───────────┘
                    │  :8080 (SG à SG, jamais exposé publiquement)
                    ▼
        ┌───────────────────────┐
        │  EC2 t3.small          │   urbanhub-ec2-sg : entrée 8080 depuis l'ALB seulement
        │  Amazon Linux 2023     │   instance profile role-urbanhub-ec2 (SSM, pas de SSH)
        │  ┌─────────┐┌────────┐ │
        │  │ backend ││   db   │ │   docker compose (image backend = ECR ; TimescaleDB)
        │  │ :8080   ││ :5432  │ │   :5432 jamais exposé hors de l'instance
        │  └─────────┘└────────┘ │
        └───────────────────────┘
             │ pull image      │ get-parameter (secret DB)
             ▼                 ▼
          ECR             SSM Parameter Store (SecureString)
     urbanhub-backend        /urbanhub/db/password
```

## Choix d'architecture et justifications

### Une seule instance EC2 avec `docker compose`, pas ECS/Fargate/EKS
Le backend tourne déjà en `docker compose` en local (`docker-compose.yml` à la
racine). Reproduire ce même mode d'exécution sur une EC2 est le chemin le plus
court entre "ça marche sur ma machine" et "ça marche en prod" : aucune
nouvelle abstraction à apprendre pour une équipe au DevOps limité. ECS/Fargate
apporterait de l'autoscaling et un plan de contrôle managé, mais c'est du
sur-dimensionnement pour un service qui n'a pas encore de contrainte de
charge — et le sujet pénalise explicitement la surcomplexité. Choix
réversible : on pourra migrer vers ECS plus tard sans rien changer à l'IAM ni
à l'image Docker.

### TimescaleDB en conteneur sur la même instance, pas RDS
RDS PostgreSQL **ne supporte pas** l'extension TimescaleDB (seul Amazon
Timestream ou une souscription managée tierce le ferait, à un coût sans
rapport avec le projet). Garder TimescaleDB en conteneur, comme en local,
préserve la compatibilité de l'`hypertable` et évite de réécrire la couche
d'accès aux données. Limite assumée : la base partage la vie de l'instance
(pas de haute disponibilité, sauvegarde à mettre en place — voir pistes
d'amélioration).

### Subnets publics + Security Groups, pas de subnet privé ni de NAT Gateway
L'instance est dans un subnet public mais **son Security Group n'autorise
aucune entrée depuis Internet** : seul l'ALB (lui-même dans un SG distinct)
peut atteindre le port 8080. Le vrai contrôle d'accès, c'est le SG, pas le
placement réseau. Un subnet privé + NAT Gateway apporterait une défense en
profondeur supplémentaire, mais un NAT Gateway coûte ~32 €/mois + le trafic,
pour une seule instance : disproportionné ici. Ce compromis est le point
d'amélioration n°1 si le projet passe en production réelle.

### Administration via SSM Session Manager, pas de SSH
Aucune paire de clés SSH, aucun port 22 ouvert. L'accès shell à l'instance se
fait par AWS Systems Manager (le rôle `role-urbanhub-ec2` porte
`AmazonSSMManagedInstanceCore`). Cela supprime toute la gestion de clés SSH et
la surface d'attaque associée — et c'est exactement ce mécanisme (SSM
`SendCommand`) que le pipeline CI utilisera pour déclencher un redéploiement,
en remplacement du `ssh + SSH_PRIVATE_KEY` du `.gitlab-ci.yml` actuel.

### Secrets dans SSM Parameter Store, jamais en clair
Le mot de passe de la base est **généré** par Terraform (`random_password`) et
stocké en `SecureString` dans SSM. L'instance le lit au démarrage via son
rôle, l'écrit dans un `.env` en `chmod 600`, et l'injecte aux conteneurs par
`env_file`. Il n'apparaît jamais dans le code, le `docker-compose.yml` ou un
script versionné. (Le fichier `.env` local du repo garde une valeur factice
pour le dev.)

## Analyse coût (estimation mensuelle, eu-west-3, à la demande)

| Ressource | Détail | ~ €/mois |
|---|---|---|
| EC2 `t3.small` | 2 vCPU, 2 Go, 24/7 | ~15 € |
| Volume EBS gp3 | 20 Go | ~1,7 € |
| Application Load Balancer | 1 ALB + LCU faible | ~18-20 € |
| ECR | stockage images (<1 Go) | ~0,1 € |
| SSM Parameter Store | Standard | gratuit |
| S3 (state Terraform) | quelques Ko | ~0 € |
| **Total estimé** | | **~35-40 €/mois** |

Poste le plus lourd : l'ALB (presque aussi cher que l'instance). Piste
d'économie si le budget est très contraint pour une démo : exposer l'instance
directement (Elastic IP + SG) et supprimer l'ALB (~-19 €/mois), au prix de la
terminaison TLS et du point d'entrée stable. Retenu ici malgré le coût car
l'ALB prépare proprement le passage à HTTPS et le health-check.

> Estimations à la demande ; un engagement Savings Plan 1 an sur l'EC2
> réduirait ce poste d'environ 30 %. Hors coûts de sortie réseau (faibles à
> cette échelle).

## Performances

`t3.small` (2 Go) est retenu plutôt que `t3.micro` (1 Go) car la JVM Spring
Boot **et** TimescaleDB cohabitent sur la même machine : 1 Go serait à risque
d'OOM au démarrage. Les instances T3 sont "burstable" (crédits CPU), ce qui
convient à une charge de collectivité en pointes ponctuelles plutôt que
soutenue. Si la charge d'ingestion MQTT devient continue, il faudra soit
passer à une famille non-burstable (`m`), soit séparer la base sur sa propre
instance/service.

## État vérifié au déploiement

- Instance EC2 : `running`, enregistrée dans SSM (`Online`) — accès sans SSH OK.
- Conteneur TimescaleDB : `Up (healthy)`.
- Conteneur backend : ne démarre pas encore — **normal**, aucune image n'a
  encore été poussée dans ECR (c'est l'objet de la Mission 3, CI/CD). Le
  déploiement de l'image fera passer la cible ALB en `healthy`.
- Sécurité réseau vérifiée depuis l'extérieur : port 5432 (DB) filtré, port
  8080 filtré en direct (seul l'ALB y accède), ALB joignable en HTTP.

## Prérequis / procédure de déploiement

```bash
# 1. (une seule fois) bucket de state — cf. ../bootstrap
# 2. (une seule fois) identités et accès — cf. ../iam
# 3. réseau + compute :
cd infra/terraform/app
terraform init
terraform plan
terraform apply
# URL publique renvoyée dans l'output alb_dns_name
```

Dépendance inter-modules : ce module lit l'instance profile
`urbanhub-ec2-instance-profile` (data source) créé par `../iam` — appliquer
`../iam` **avant** `app`.

## Limites connues et pistes d'amélioration

1. **HTTP seulement** : pas de nom de domaine disponible → pas de certificat
   ACM. En production : domaine + certificat ACM + listener HTTPS (443) +
   redirection 80→443.
2. **Pas de haute disponibilité** : une seule instance, une seule AZ pour le
   compute. Un arrêt de l'instance = interruption de service.
3. **Base non sauvegardée** : ajouter des snapshots EBS planifiés, ou
   externaliser la base.
4. **Réseau à durcir** : subnet privé + NAT (ou VPC endpoints) pour l'instance
   si le budget le permet.
5. **GitHub vs GitLab** : même réserve que pour l'IAM (cf. `../iam/README.md`).
