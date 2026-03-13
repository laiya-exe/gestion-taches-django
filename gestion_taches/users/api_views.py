# from rest_framework import viewsets, permissions
# from .models import User
# from .serializers import UserSerializer

# class UserViewSet(viewsets.ReadOnlyModelViewSet):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer
#     permission_classes = [permissions.IsAuthenticated]

from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from .models import User
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import update_session_auth_hash
from .serializers import UserSerializer, UserUpdateSerializer, PasswordChangeSerializer
from django.contrib.auth.password_validation import validate_password
from .serializers import RegisterSerializer


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint /api/users/
    Liste tous les utilisateurs (lecture seule).
    Accessible uniquement aux utilisateurs authentifiés.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserDetailView(generics.RetrieveUpdateAPIView):
    """
    Endpoint pour récupérer ou mettre à jour les informations de l'utilisateur connecté.
    GET : retourne le profil actuel
    PATCH/PUT : mise à jour (via UserUpdateSerializer)
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        # Utiliser un serializer différent pour la mise à jour (sans mot de passe)
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """
    Change le mot de passe de l'utilisateur connecté.
    Vérifie l'ancien mot de passe et valide le nouveau.
    Maintient la session active après le changement.
    """
    serializer = PasswordChangeSerializer(
        data=request.data, context={"request": request}  # ← ajoute le context ici
    )
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        update_session_auth_hash(request, user)
        return Response({"detail": "Mot de passe modifié avec succès."})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(generics.CreateAPIView):
    """
    Endpoint pour créer un nouvel utilisateur.
    Retourne le user créé + JWT (access + refresh).
    Accessible à tous (permissions.AllowAny)
    """
    serializer_class = UserSerializer  # ou un serializer spécifique
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        # Utiliser un serializer personnalisé pour l'inscription avec validation du mot de passe
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Générer un token JWT
            from rest_framework_simplejwt.tokens import RefreshToken

            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "user": UserSerializer(user).data,
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserUpdateView(generics.RetrieveUpdateAPIView):
    """
    Permet de récupérer ou mettre à jour l'utilisateur connecté
    similaire à UserDetailView, mais peut être utilisé séparément.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.GenericAPIView):
    """
    Vue générique pour changer le mot de passe.
    Utilise PasswordChangeSerializer et maintient la session active.
    """
    serializer_class = PasswordChangeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data["new_password"])
            user.save()
            update_session_auth_hash(request, user)  # Maintient la session active
            return Response(
                {"detail": "Mot de passe modifié avec succès."},
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
