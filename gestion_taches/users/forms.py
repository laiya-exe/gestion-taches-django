from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User


class CustomUserCreationForm(UserCreationForm):
    """
    Étend le formulaire de création d'utilisateur de Django pour inclure :
    - user_type (étudiant / professeur)
    - avatar
    """
    class Meta(UserCreationForm.Meta):
        model = User
        fields = UserCreationForm.Meta.fields + ('user_type', 'avatar')


class UserUpdateForm(forms.ModelForm):
    """
    Formulaire pour mettre à jour certaines informations de l'utilisateur :
    - prénom, nom, email, avatar
    """
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'avatar']