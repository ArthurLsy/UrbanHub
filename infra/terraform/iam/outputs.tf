output "github_oidc_provider_arn" {
  value = aws_iam_openid_connect_provider.github_actions.arn
}

output "ci_role_arn" {
  description = "ARN à utiliser dans le workflow GitHub Actions (permissions: id-token: write)"
  value       = aws_iam_role.ci.arn
}

output "ec2_instance_profile_name" {
  description = "Nom de l'instance profile à attacher à l'instance EC2 backend"
  value       = aws_iam_instance_profile.ec2.name
}

output "admin_group_name" {
  value = aws_iam_group.admin.name
}

output "team_group_name" {
  value = aws_iam_group.team.name
}
