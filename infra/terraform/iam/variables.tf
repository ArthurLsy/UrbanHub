variable "aws_region" {
  description = "Région AWS cible"
  type        = string
  default     = "eu-west-3"
}

variable "account_id" {
  description = "ID du compte AWS"
  type        = string
  default     = "627403012708"
}

variable "github_repo" {
  description = "Dépôt GitHub autorisé à assumer le rôle CI (org/repo)"
  type        = string
  default     = "ArthurLsy/UrbanHub"
}

variable "iam_path" {
  description = "Path IAM utilisé pour toutes les ressources du projet"
  type        = string
  default     = "/urbanhub/"
}
