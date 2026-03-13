from rest_framework import viewsets, permissions
from .models import Project
from .serializers import ProjectSerializer
from .permissions import IsProjectCreatorOrReadOnly
from django.db.models import Q


class ProjectViewSet(viewsets.ModelViewSet):
    """
    API CRUD pour les projets.
    - Un utilisateur ne voit que les projets dont il est membre ou créateur.
    - Seul le créateur peut modifier ou supprimer (via IsProjectCreatorOrReadOnly).
    """
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['name', 'created_by']
    
    def get_queryset(self):
        """
        Restreint les projets visibles à l'utilisateur connecté :
        - créateur
        - membre
        """
        # Un utilisateur ne voit que les projets dont il est membre ou créateur
        user = self.request.user
        return Project.objects.filter(
            Q(created_by=user) | Q(members=user)
        ).distinct()

    def perform_create(self, serializer):
        """
        Lors de la création d'un projet :
        - Le créateur est automatiquement l'utilisateur connecté
        - On l'ajoute aussi aux membres pour qu'il puisse voir le projet
        """
        # Le créateur est automatiquement l'utilisateur connecté
        project = serializer.save(created_by=self.request.user)
        # Ajouter automatiquement le créateur aux membres
        project.members.add(self.request.user)

    permission_classes = [permissions.IsAuthenticated, IsProjectCreatorOrReadOnly]
