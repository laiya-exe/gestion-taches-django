from django.contrib.auth import login, logout, update_session_auth_hash
from django.contrib.auth.forms import AuthenticationForm, PasswordChangeForm
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.contrib import messages
from .forms import CustomUserCreationForm
from .forms import UserUpdateForm
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import UserSerializer
from datetime import timedelta
from .utils import get_prime_eligibility, calculate_completion_rate
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken



def signup_view(request):
    """
    Gestion de l'inscription d'un nouvel utilisateur.
    - POST : validation du formulaire, création de l'utilisateur, login automatique et redirection.
    - GET : affiche le formulaire vide.
    """
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST, request.FILES)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Inscription réussie ! Bienvenue.')
            return redirect('home')
    else:
        form = CustomUserCreationForm()
    return render(request, 'users/signup.html', {'form': form})


class CustomLoginView(LoginView):
    """
    Vue de login personnalisée.
    - Affiche le template de connexion.
    - Ajoute un message de succès après login.
    - Redirige vers le dashboard ou la page d'accueil.
    """
    template_name = 'users/login.html'

    def form_valid(self, form):
        messages.success(self.request, 'Connexion réussie.')
        return super().form_valid(form)

    def get_success_url(self):
        return '/'   # ou reverse('dashboard')


class CustomLogoutView(LogoutView):
    """
    Vue de logout personnalisée.
    - Supporte GET/POST pour se déconnecter.
    - Ajoute un message d'information.
    - Redirige vers la page de login.
    """
    next_page = 'login'

    http_method_names = ['get', 'post', 'head', 'options']

    def get(self, request, *args, **kwargs):
        messages.info(request, 'Vous avez été déconnecté.')
        return self.post(request, *args, **kwargs)


@login_required
def profile_view(request):
    """
    Gestion du profil utilisateur.
    - GET : affiche les formulaires de mise à jour profil et mot de passe.
    - POST : 
        - update_profile : met à jour l'utilisateur et affiche un message.
        - change_password : change le mot de passe et met à jour la session.
    """
    user = request.user
    if request.method == 'POST':
        # Déterminer quel formulaire a été soumis (via un champ caché ou le bouton)
        if 'update_profile' in request.POST:
            profile_form = UserUpdateForm(request.POST, request.FILES, instance=user)
            if profile_form.is_valid():
                profile_form.save()
                messages.success(request, 'Profil mis à jour avec succès.')
                return redirect('profile')
        elif 'change_password' in request.POST:
            password_form = PasswordChangeForm(user, request.POST)
            if password_form.is_valid():
                user = password_form.save()
                update_session_auth_hash(request, user)  # Important pour rester connecté
                messages.success(request, 'Mot de passe modifié avec succès.')
                return redirect('profile')
    else:
        profile_form = UserUpdateForm(instance=user)
        password_form = PasswordChangeForm(user)

    context = {
        'profile_form': profile_form,
        'password_form': password_form,
    }
    return render(request, 'users/profile.html', context)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """
    Renvoie les données de l'utilisateur courant en JSON.
    - Utilisé côté frontend Angular pour charger le user après login.
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    """
    Renvoie les statistiques de l'utilisateur.
    - Pour les professeurs : prime eligibility.
    - Pour les étudiants : taux de complétion trimestriel et annuel.
    """
    user = request.user
    today = timezone.now().date()
    start_quarter = today - timedelta(days=90)
    start_year = today.replace(month=1, day=1)

    if user.user_type == 'professeur':
        data = get_prime_eligibility(user)
    else:
        rate_quarter = calculate_completion_rate(user, start_quarter, today)
        rate_year = calculate_completion_rate(user, start_year, today)
        data = {
            'quarter': {'rate': rate_quarter},
            'year': {'rate': rate_year}
        }

    return Response(data)


def get_tokens_for_user(user):
    """
    Génère un refresh token et un access token pour un utilisateur.
    - Utilisé pour l'authentification Angular via JWT.
    """
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class CustomLoginView(LoginView):
    """
    Variante du login qui redirige vers Angular avec access & refresh token.
    - Après authentification Django, génère les tokens JWT.
    - Redirige vers l'URL Angular avec les tokens en query params.
    """
    def form_valid(self, form):
        # Appel parent pour authentifier l'utilisateur
        response = super().form_valid(form)
        # Générer les tokens
        tokens = get_tokens_for_user(self.request.user)
        # Construire l'URL de redirection vers Angular avec le token
        angular_url = f"http://localhost:4200/auth/callback?access={tokens['access']}&refresh={tokens['refresh']}"
        return redirect(angular_url)