from rest_framework import serializers
from .models import Task
from users.serializers import UserSerializer


class TaskSerializer(serializers.ModelSerializer):
    # Sérialisation du détail de l'utilisateur assigné
    assigned_to_detail = UserSerializer(source='assigned_to', read_only=True)
    
    # Nom du projet associé à la tâche
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'project', 'project_name', 'title', 'description',
            'due_date', 'status', 'assigned_to', 'assigned_to_detail',
            'created_at', 'completed_at'
        ]
        # Les champs en lecture seule (création automatique par Django)
        read_only_fields = ['created_at', 'completed_at']