resource "aws_security_group" "alb" {
  name        = "urbanhub-alb-sg"
  description = "Trafic entrant public vers ALB UrbanHub"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP public"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Vers instance backend uniquement"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "urbanhub-alb-sg"
  }
}

resource "aws_security_group" "ec2" {
  name        = "urbanhub-ec2-sg"
  description = "Trafic entrant vers instance backend, restreint a ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Backend Spring Boot, depuis ALB uniquement"
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "Sortant : pull image ECR, appels SSM/CloudWatch, mises a jour systeme"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "urbanhub-ec2-sg"
  }
}
