# Nom en dur "urbanhub-backend" : doit rester identique à celui référencé
# dans infra/terraform/iam/iam-role-ci.tf et iam-role-ec2.tf.
#
# MUTABLE (pas IMMUTABLE) : le déploiement pull le tag mobile ":latest", qui
# doit pouvoir être réécrit à chaque build. La traçabilité par build est
# assurée autrement : le pipeline pousse systématiquement DEUX tags sur la
# même image (":latest" et ":<git-sha>"), le second n'étant jamais réutilisé
# en pratique -> traçabilité/rollback possibles sans la contrainte d'un repo
# IMMUTABLE (qui interdirait de re-pousser ":latest").
resource "aws_ecr_repository" "backend" {
  name                 = "urbanhub-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Garder les 10 dernières images, purger le reste"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = { type = "expire" }
      }
    ]
  })
}
