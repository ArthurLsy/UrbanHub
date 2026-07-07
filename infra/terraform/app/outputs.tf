output "alb_dns_name" {
  description = "URL publique du backend (HTTP)"
  value       = "http://${aws_lb.main.dns_name}"
}

output "ecr_repository_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "instance_id" {
  description = "Utilisé pour cibler l'instance via SSM SendCommand depuis le pipeline CI"
  value       = aws_instance.backend.id
}

output "vpc_id" {
  value = aws_vpc.main.id
}
