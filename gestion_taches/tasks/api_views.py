from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend, FilterSet
from django.shortcuts import get_object_or_404
from django_filters import rest_framework as boolean_filters
from django.utils import timezone
from .models import Task
from projects.models import Project
from .serializers import TaskSerializer
from django.db.models import Q
from users.models import User


def can_assign_user(assigner, assigned_user):
    """
    Vérifie si `assigner` peut assigner `assigned_user` à une tâche.
    - Les professeurs peuvent assigner n'importe qui.
    - Les étudiants ne peuvent assigner que d'autres étudiants.
    """
    # Si assigner est professeur, pas de restriction
    if assigner.user_type == "professeur":
        return True
    # Si assigner est étudiant, il ne peut assigner que des étudiants
    if assigner.user_type == "etudiant":
        return assigned_user.user_type == "etudiant"
    return False


class TaskFilter(FilterSet):
    """Filtrage avancé pour les tâches"""
    # Filtre booléen pour les tâches non assignées
    assigned_to__isnull = boolean_filters.BooleanFilter(
        field_name="assigned_to", lookup_expr="isnull"
    )

    class Meta:
        model = Task
        fields = ["project", "status", "assigned_to", "assigned_to__isnull"]


class TaskViewSet(viewsets.ModelViewSet):
    """CRUD complet pour les tâches avec permissions et filtrage"""
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    search_fields = ["title", "description"]
    ordering_fields = ["due_date", "created_at"]
    filterset_fields = ["project", "status", "assigned_to"]
    filterset_class = TaskFilter

    def get_queryset(self):
        """
        Limite les tâches visibles à celles des projets auxquels l'utilisateur a accès
        (créateur ou membre)
        """
        # Ne montrer que les tâches des projets accessibles par l'utilisateur
        user = self.request.user
        projects = Project.objects.filter(
            Q(created_by=user) | Q(members=user)
        ).distinct()
        return Task.objects.filter(project__in=projects)

    def perform_create(self, serializer):
        """Logique de création avec vérifications de permission et assignation"""
        project_id = self.request.data.get("project")
        project = get_object_or_404(Project, id=project_id)

        # Vérifier que l'utilisateur peut créer une tâche dans ce projet
        if project.created_by != self.request.user:
            raise PermissionDenied(
                "Seul le créateur du projet peut ajouter des tâches."
            )

        # Vérifier l'assignation si provided
        assigned_to_id = self.request.data.get("assigned_to")
        if assigned_to_id:
            assigned_user = get_object_or_404(User, id=assigned_to_id)

            # Vérification selon ton can_assign_user
            if not can_assign_user(self.request.user, assigned_user):
                raise PermissionDenied(
                    "Vous n'avez pas le droit d'assigner cette personne."
                )

            # Vérifier que assigned_user est membre du projet ou créateur
            if (
                assigned_user != project.created_by
                and assigned_user not in project.members.all()
            ):
                raise PermissionDenied(
                    "L'utilisateur assigné doit être membre du projet."
                )

        # Sauvegarder la tâche
        serializer.save()

    def perform_update(self, serializer):
        """Logique de mise à jour avec contrôle sur assignation et statut"""
        task = self.get_object()
        user = self.request.user

        # Vérifier les droits généraux : créateur ou assigné
        if task.project.created_by != user and task.assigned_to != user:
            raise PermissionDenied("Vous n'avez pas le droit de modifier cette tâche.")

        # Vérifier si l'assigné change
        assigned_to_id = self.request.data.get("assigned_to")
        if assigned_to_id:
            # Seul le créateur du projet peut reassigner
            if task.project.created_by != user:
                raise PermissionDenied(
                    "Seul le créateur du projet peut reassigner la tâche."
                )

            assigned_user = get_object_or_404(User, id=assigned_to_id)
            # Vérifier que le créateur peut assigner cette personne
            if not can_assign_user(user, assigned_user):
                raise PermissionDenied(
                    "Vous n'avez pas le droit d'assigner cette personne."
                )
            # Vérifier que assigned_user est membre du projet ou créateur
            if (
                assigned_user != task.project.created_by
                and assigned_user not in task.project.members.all()
            ):
                raise PermissionDenied(
                    "L'utilisateur assigné doit être membre du projet."
                )

        # Vérifier si le statut change vers 'termine'
        if "status" in self.request.data and self.request.data["status"] == "termine":
            serializer.save(completed_at=timezone.now())
        else:
            serializer.save()

    def perform_destroy(self, instance):
        """Seul le créateur du projet peut supprimer la tâche"""
        # Seul le créateur du projet peut supprimer
        if instance.project.created_by != self.request.user:
            raise PermissionDenied(
                "Seul le créateur du projet peut supprimer des tâches."
            )
        instance.delete()
