data "aws_iam_policy_document" "ci_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github_actions.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repo}:ref:refs/heads/main"]
    }
  }
}

resource "aws_iam_role" "ci" {
  name                 = "role-urbanhub-ci"
  path                 = var.iam_path
  assume_role_policy   = data.aws_iam_policy_document.ci_assume_role.json
  max_session_duration = 3600
}

data "aws_iam_policy_document" "ci_permissions" {
  statement {
    sid       = "EcrAuth"
    effect    = "Allow"
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }

  statement {
    sid    = "EcrPushBackendImage"
    effect = "Allow"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:PutImage",
      "ecr:BatchGetImage",
    ]
    resources = ["arn:aws:ecr:${var.aws_region}:${var.account_id}:repository/urbanhub-backend"]
  }

  # Le job "deploy" du pipeline retrouve l'instance cible dynamiquement par
  # tag (pas d'ID d'instance codé en dur dans le workflow, qui changerait à
  # chaque recreation Terraform).
  statement {
    sid       = "FindTargetInstance"
    effect    = "Allow"
    actions   = ["ec2:DescribeInstances"]
    resources = ["*"] # action de lecture seule, ne supporte pas le scoping par ressource
  }

  statement {
    sid    = "TriggerDeployViaSsm"
    effect = "Allow"
    actions = [
      "ssm:SendCommand",
    ]
    resources = ["arn:aws:ssm:${var.aws_region}::document/AWS-RunShellScript"]
  }

  statement {
    sid       = "TriggerDeployOnProjectInstance"
    effect    = "Allow"
    actions   = ["ssm:SendCommand"]
    resources = ["arn:aws:ec2:${var.aws_region}:${var.account_id}:instance/*"]
    condition {
      test     = "StringEquals"
      variable = "ssm:resourceTag/Project"
      values   = ["urbanhub"]
    }
  }

  statement {
    sid       = "ReadDeployResult"
    effect    = "Allow"
    actions   = ["ssm:GetCommandInvocation", "ssm:ListCommandInvocations"]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "ci" {
  name        = "urbanhub-ci-deploy-policy"
  path        = var.iam_path
  description = "Droits minimaux du pipeline CI : push ECR + déclenchement déploiement SSM, aucun droit IAM"
  policy      = data.aws_iam_policy_document.ci_permissions.json
}

resource "aws_iam_role_policy_attachment" "ci" {
  role       = aws_iam_role.ci.name
  policy_arn = aws_iam_policy.ci.arn
}
