from rest_framework import permissions

class IsProjectCreatorOrReadOnly(permissions.BasePermission):
    """
    Permission personnalisée : lecture seule pour tous, écriture seulement pour le créateur.
    """
    def has_object_permission(self, request, view, obj):
        # Lecture toujours autorisée
        if request.method in permissions.SAFE_METHODS:
            return True
        # Écriture réservée au créateur
        return obj.created_by == request.user