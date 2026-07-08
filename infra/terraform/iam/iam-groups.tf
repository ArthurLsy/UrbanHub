resource "aws_iam_group" "admin" {
  name = "urbanhub-admin"
  path = var.iam_path
}

data "aws_iam_policy_document" "admin" {
  statement {
    sid    = "ReadOnlyWide"
    effect = "Allow"
    actions = [
      "ec2:Describe*",
      "s3:List*",
      "s3:GetBucket*",
      "ecr:Describe*",
      "ecr:List*",
      "ssm:Describe*",
      "logs:Describe*",
      "cloudwatch:Describe*",
      "cloudwatch:Get*",
      "cloudwatch:List*",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "Ec2ManageProjectResources"
    effect = "Allow"
    actions = [
      "ec2:StartInstances",
      "ec2:StopInstances",
      "ec2:RebootInstances",
      "ec2:TerminateInstances",
      "ec2:CreateTags",
      "ec2:ModifyInstanceAttribute",
    ]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "aws:ResourceTag/Project"
      values   = ["urbanhub"]
    }
  }

  statement {
    sid    = "Ec2CreateProjectResources"
    effect = "Allow"
    actions = [
      "ec2:RunInstances",
      "ec2:CreateSecurityGroup",
      "ec2:CreateVolume",
    ]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "aws:RequestTag/Project"
      values   = ["urbanhub"]
    }
  }

  statement {
    sid     = "S3ManageProjectBuckets"
    effect  = "Allow"
    actions = ["s3:*"]
    resources = [
      "arn:aws:s3:::urbanhub-*",
      "arn:aws:s3:::urbanhub-*/*",
    ]
  }

  statement {
    sid       = "EcrManageProjectRepos"
    effect    = "Allow"
    actions   = ["ecr:*"]
    resources = ["arn:aws:ecr:${var.aws_region}:${var.account_id}:repository/urbanhub-*"]
  }

  statement {
    sid       = "SsmManageProjectParameters"
    effect    = "Allow"
    actions   = ["ssm:*"]
    resources = ["arn:aws:ssm:${var.aws_region}:${var.account_id}:parameter${var.iam_path}*"]
  }

  statement {
    sid    = "LogsManageProjectGroups"
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:PutRetentionPolicy",
      "logs:DeleteLogGroup",
      "logs:Get*",
      "logs:FilterLogEvents",
    ]
    resources = ["arn:aws:logs:${var.aws_region}:${var.account_id}:log-group:${var.iam_path}*"]
  }

  statement {
    sid    = "IamManageProjectResources"
    effect = "Allow"
    actions = [
      "iam:*Role*",
      "iam:*Policy*",
      "iam:*Group*",
      "iam:*InstanceProfile*",
      "iam:*OpenIDConnectProvider*",
      "iam:TagUser",
      "iam:List*",
      "iam:Get*",
    ]
    resources = [
      "arn:aws:iam::${var.account_id}:role${var.iam_path}*",
      "arn:aws:iam::${var.account_id}:policy${var.iam_path}*",
      "arn:aws:iam::${var.account_id}:group${var.iam_path}*",
      "arn:aws:iam::${var.account_id}:instance-profile${var.iam_path}*",
      "arn:aws:iam::${var.account_id}:oidc-provider/*",
    ]
  }
}

resource "aws_iam_policy" "admin" {
  name        = "urbanhub-admin-policy"
  path        = var.iam_path
  description = "Contrôle complet des ressources UrbanHub (scopé projet, pas admin AWS global)"
  policy      = data.aws_iam_policy_document.admin.json
}

resource "aws_iam_group_policy_attachment" "admin" {
  group      = aws_iam_group.admin.name
  policy_arn = aws_iam_policy.admin.arn
}

resource "aws_iam_group" "team" {
  name = "urbanhub-team"
  path = var.iam_path
}

data "aws_iam_policy_document" "team" {
  statement {
    sid    = "Ec2OperateProjectInstances"
    effect = "Allow"
    actions = [
      "ec2:DescribeInstances",
      "ec2:StartInstances",
      "ec2:StopInstances",
      "ec2:RebootInstances",
    ]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "aws:ResourceTag/Project"
      values   = ["urbanhub"]
    }
  }

  statement {
    sid       = "DenyTerminate"
    effect    = "Deny"
    actions   = ["ec2:TerminateInstances"]
    resources = ["*"]
  }

  statement {
    sid     = "DenyTerraformStateBucket"
    effect  = "Deny"
    actions = ["s3:*"]
    resources = [
      "arn:aws:s3:::urbanhub-terraform-state-*",
      "arn:aws:s3:::urbanhub-terraform-state-*/*",
    ]
  }

  statement {
    sid    = "ReadOnlyObservability"
    effect = "Allow"
    actions = [
      "logs:Describe*",
      "logs:Get*",
      "logs:FilterLogEvents",
      "cloudwatch:Describe*",
      "cloudwatch:Get*",
      "cloudwatch:List*",
      "ecr:Describe*",
      "ecr:List*",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "ReadOnlyProjectBuckets"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:ListBucket",
    ]
    resources = [
      "arn:aws:s3:::urbanhub-*",
      "arn:aws:s3:::urbanhub-*/*",
    ]
  }
}

resource "aws_iam_policy" "team" {
  name        = "urbanhub-team-policy"
  path        = var.iam_path
  description = "Exploitation courante (start/stop) + lecture seule, sans IAM ni suppression d'infra"
  policy      = data.aws_iam_policy_document.team.json
}

resource "aws_iam_group_policy_attachment" "team" {
  group      = aws_iam_group.team.name
  policy_arn = aws_iam_policy.team.arn
}
