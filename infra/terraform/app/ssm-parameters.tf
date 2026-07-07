resource "random_password" "db" {
  length  = 24
  special = false
}

resource "aws_ssm_parameter" "db_password" {
  name        = "/urbanhub/db/password"
  description = "Mot de passe TimescaleDB, lu par l'instance backend au démarrage"
  type        = "SecureString"
  value       = random_password.db.result

  lifecycle {
    ignore_changes = [value]
  }
}
