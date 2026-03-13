from rest_framework import serializers
from .models import User
from django.contrib.auth.password_validation import validate_password


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer utilisé pour exposer les informations d'un utilisateur
    via l'API (GET /user/ ou liste d'utilisateurs)
    """
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "user_type", "avatar"]


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer utilisé pour mettre à jour le profil de l'utilisateur
    via l'API (PUT / PATCH /user/)
    """
    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "avatar",
        ]


class PasswordChangeSerializer(serializers.Serializer):
    """
    Vérifie et valide le changement de mot de passe.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)

    def validate_old_password(self, value):
        """Vérifie que l'ancien mot de passe correspond à l'utilisateur"""
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Mot de passe actuel incorrect.")
        return value

    def validate(self, data):
        """Vérifie que le nouveau mot de passe correspond et respecte la complexité Django"""
        if data["new_password"] != data["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Les mots de passe ne correspondent pas."}
            )
        # Valider la complexité du mot de passe Django
        validate_password(data["new_password"], user=self.context["request"].user)
        return data


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer utilisé pour créer un nouvel utilisateur.
    Le mot de passe est hashé avant sauvegarde.
    """
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "user_type"]

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)  # 🔴 hash du mot de passe
        user.save()

        return user
