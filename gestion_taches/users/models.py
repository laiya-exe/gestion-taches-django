from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser):
    """
    Modèle utilisateur étendu à partir d'AbstractUser.
    Permet de stocker le type d'utilisateur et un avatar.
    """
    USER_TYPE_CHOICES = (
        ('etudiant', 'Étudiant'),
        ('professeur', 'Professeur'),
    )
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='etudiant')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    def __str__(self):
        """Affichage lisible dans l'admin ou console"""
        return f"{self.username} ({self.get_user_type_display()})"