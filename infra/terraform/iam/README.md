# IAM — UrbanHub (EC04 Partie 1, volet sécurité/accès)

## Contexte et objectif

UrbanHub passe d'un déploiement on-premise (SSH + clé privée stockée en variable
CI) à un environnement cloud AWS. Cette étape définit **qui/quoi peut faire
quoi** sur ce compte AWS, avant même de créer la moindre machine : c'est la
base sur laquelle le reste de l'infra (réseau, calcul, CI/CD) s'appuiera.

Contraintes du contexte prises en compte :
- équipe réduite, compétences DevOps limitées → **2 groupes humains**, pas 3
  (voir justification plus bas), pas de multi-repo IAM central/projet ;
- exposition à minimiser → aucune clé AWS statique dans le CI (OIDC) ;
- moindre privilège → chaque policy scope ses actions par tag ou par ARN,
  jamais `Resource: "*"` sur une action d'écriture quand c'est évitable.

## Ce qui a été créé

| Ressource | But |
|---|---|
| `aws_iam_openid_connect_provider.github_actions` | Fait confiance à GitHub Actions comme fournisseur d'identité fédérée |
| Groupe `urbanhub-admin` | Contrôle complet des ressources **du projet** (pas admin AWS global) |
| Groupe `urbanhub-team` | Exploitation courante (start/stop/reboot) + lecture seule, sans IAM |
| Rôle `role-urbanhub-ci` | Assumé par GitHub Actions (OIDC) pour déployer — aucun droit IAM |
| Rôle `role-urbanhub-ec2` | Instance profile de la VM backend — lecture secrets, pull image, logs |

## Choix argumentés

### Pourquoi OIDC et pas une clé d'accès (access key) dans un secret CI ?
Une clé statique doit être stockée (donc peut fuiter), tourne rarement, et
reste valide même si le repo qui l'utilise est compromis. Avec OIDC, GitHub
Actions présente un jeton signé, valable seulement le temps du job, vérifié
par AWS avant de délivrer des credentials temporaires. Rien à stocker, rien à
faire tourner. Contrepartie : plus complexe à mettre en place la première
fois (configuration du provider + condition de confiance) — accepté car fait
une seule fois, ici.

### Pourquoi 2 groupes humains et pas 3 (Admin/Dev/Analyst) ?
Le découpage à trois groupes a du sens pour une équipe où plusieurs personnes
ont des besoins distincts et stables (un data analyst qui ne doit jamais
toucher à l'infra, par exemple). Pour une équipe aussi restreinte
qu'UrbanHub aujourd'hui, dupliquer cette séparation ajoute de la gestion
(rattacher/dérattacher les gens au bon groupe) sans bénéfice de sécurité
réel : la frontière qui compte vraiment est **admin vs non-admin**, pas
**dev vs analyst**. `urbanhub-team` réunit donc les deux usages (exploitation
+ lecture seule). Si l'équipe grandit avec un vrai rôle data/analytics
séparé, scinder `urbanhub-team` en deux groupes est un changement Terraform
mineur (dupliquer le groupe, répartir les statements existants).

### Pourquoi le rôle CI n'a aucun droit IAM ?
C'est directement la leçon du TD1-b : donner `IAMFullAccess` (ou un
équivalent) à un pipeline signifie qu'un attaquant qui compromet ce pipeline
peut se créer ses propres accès et les faire persister, même après coup. Le
rôle `role-urbanhub-ci` ne sait faire que deux choses — pousser une image sur
*un* repo ECR précis, et déclencher un déploiement via SSM sur *les*
instances taguées `Project=urbanhub`. Les changements d'IAM eux-mêmes
(ce module) restent appliqués manuellement par un admin humain (`terraform
apply` local), pas depuis le pipeline. C'est un choix délibéré de séparer
"déployer l'appli" (automatisé, risque contenu) de "changer l'infra/les
droits" (manuel, revu).

### Pourquoi Session Manager (SSM) plutôt que SSH ?
`AmazonSSMManagedInstanceCore` permet de se connecter à l'instance sans port
22 ouvert et sans paire de clés SSH à distribuer/révoquer. Le pipeline CI
déclenche aussi le déploiement via `ssm:SendCommand` plutôt que `ssh` +
clé privée (c'est exactement le `SSH_PRIVATE_KEY` du `.gitlab-ci.yml`
actuel que ce choix supprime).

### Limite connue, assumée : le scoping par tag n'est pas parfait
`ec2:RunInstances` ne peut être restreint qu'via `aws:RequestTag` (le tag
que *la requête* pose), alors que les actions sur une instance existante
(`StartInstances`, `TerminateInstances`...) utilisent `aws:ResourceTag` (le
tag déjà présent sur la ressource). Les deux conditions sont bien présentes
dans `urbanhub-admin`, mais rien n'empêche techniquement quelqu'un
d'oublier le tag `Project=urbanhub` à la création d'une ressource et de se
retrouver hors du périmètre couvert. C'est la même limite que celle
observée dans le TD1 ("granularité difficile des permissions IAM") : on
l'atténue par convention de nommage (`urbanhub-*`) plutôt que de la résoudre
entièrement, ce qui serait disproportionné pour la taille du projet.

### Point d'attention : GitHub vs GitLab
Le sujet demande un rendu sur un fork **GitLab**. Le développement a pour
l'instant lieu sur un repo **GitHub** (`ArthurLsy/UrbanHub`), avec migration
prévue vers GitHub Actions pour le CI/CD. Le provider OIDC configuré ici
(`token.actions.githubusercontent.com`) est donc spécifique à GitHub — s'il
faut basculer vers GitLab avant le rendu final, cette partie (`oidc.tf` +
la condition de confiance dans `iam-role-ci.tf`) devra être reprise pour
pointer vers l'OIDC issuer de GitLab (`https://gitlab.com` ou une instance
self-hosted) et adapter la condition `sub` au format GitLab
(`project_path:...:ref_type:branch:ref:main`).

## Vérifications effectuées

`aws iam simulate-principal-policy` a été utilisé pour valider concrètement
(pas juste "sur le papier") que :
- `role-urbanhub-ci` ne peut pas créer d'utilisateur IAM (`implicitDeny`) ;
- `role-urbanhub-ci` peut pousser une image sur `urbanhub-backend`
  (`allowed`) mais pas sur un autre repo ECR (`implicitDeny`) ;
- `urbanhub-team` ne peut jamais terminer une instance, même par erreur de
  policy future (`explicitDeny`, filet de sécurité volontaire).

## Prérequis / reproductibilité

```bash
cd infra/terraform/bootstrap
terraform init
terraform apply -var="account_id=<ID_COMPTE_AWS>"   # une seule fois

cd ../iam
terraform init
terraform plan
terraform apply
```

Le state est stocké dans le bucket S3 créé par `bootstrap` (verrouillage
natif S3, pas de table DynamoDB nécessaire — Terraform ≥ 1.10).

## Prochaine étape (hors périmètre de ce module)

Les ARN référencés ici (`repository/urbanhub-backend`, tag
`Project=urbanhub` sur l'instance) anticipent la couche **compute/réseau**
(architecture de déploiement, point 1 de la Mission 1), qui n'est pas encore
créée. Tant qu'elle ne l'est pas, ces permissions sont "prêtes mais
inertes" — c'est volontaire (sécurité dès la conception), mais signifie
aussi qu'il faudra revérifier que les noms de ressources choisis à cette
étape correspondent bien à ceux définis ici.
