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

variable "vpc_cidr" {
  description = "Bloc CIDR du VPC UrbanHub"
  type        = string
  default     = "10.42.0.0/16"
}

variable "azs" {
  description = "Zones de disponibilité utilisées pour les subnets publics"
  type        = list(string)
  default     = ["eu-west-3a", "eu-west-3b"]
}

variable "public_subnet_cidrs" {
  description = "CIDR des subnets publics, un par AZ"
  type        = list(string)
  default     = ["10.42.1.0/24", "10.42.2.0/24"]
}

variable "instance_type" {
  description = "Type d'instance EC2 pour le backend + TimescaleDB. t3.small (2 Go RAM) car t3.micro (1 Go) est risqué pour une JVM + Postgres cohabitant sur la même machine."
  type        = string
  default     = "t3.small"
}

variable "root_volume_size_gb" {
  description = "Taille du volume racine (image Docker + données TimescaleDB)"
  type        = number
  default     = 20
}
