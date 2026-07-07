data "aws_ssm_parameter" "al2023_ami" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

locals {
  ecr_registry = "${var.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com"
}

data "aws_iam_instance_profile" "ec2" {
  name = "urbanhub-ec2-instance-profile"
}

resource "aws_instance" "backend" {
  ami                    = data.aws_ssm_parameter.al2023_ami.value
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  iam_instance_profile   = data.aws_iam_instance_profile.ec2.name

  root_block_device {
    volume_size = var.root_volume_size_gb
    volume_type = "gp3"
    encrypted   = true
  }

  user_data = templatefile("${path.module}/templates/user_data.sh.tpl", {
    aws_region         = var.aws_region
    ecr_registry       = local.ecr_registry
    ecr_repository_url = aws_ecr_repository.backend.repository_url
    db_password_param  = aws_ssm_parameter.db_password.name
  })
  user_data_replace_on_change = true

  tags = {
    Name = "urbanhub-backend"
  }
}
