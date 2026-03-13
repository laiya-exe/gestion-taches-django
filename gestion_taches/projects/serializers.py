from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Project
from users.serializers import UserSerializer

User = get_user_model()

class ProjectSerializer(serializers.ModelSerializer):
    # Info du créateur (read-only)

    created_by = UserSerializer(read_only=True)

    # Liste des membres (read-only)

    members = UserSerializer(many=True, read_only=True)
    
    # Champ d'écriture pour assigner des membres via leurs IDs
    member_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=User.objects.all(),
        source='members'
    )

    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'created_by', 'created_at', 'members', 'member_ids']
        read_only_fields = ['created_by', 'created_at']