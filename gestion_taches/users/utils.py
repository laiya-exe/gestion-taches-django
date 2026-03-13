from django.utils import timezone
from datetime import timedelta
from tasks.models import Task

def calculate_completion_rate(user, start_date, end_date):
    """
    Calcule le pourcentage de tâches terminées à temps pour un utilisateur
    sur une période donnée (start_date → end_date).

    Retour:
        float : taux de complétion entre 0 et 100
    """
    # Récupère toutes les tâches assignées à l'utilisateur créées avant la fin de la période
    tasks = Task.objects.filter(
        assigned_to=user,
        created_at__date__lte=end_date
    )

    # Filtrer les tâches pertinentes pour la période
    tasks_in_period = [
        t for t in tasks
        if t.completed_at and start_date <= t.completed_at.date() <= end_date
        or not t.completed_at  # inclure les tâches non terminées pour le total
    ]

    total = len(tasks_in_period)
    if total == 0:
        return 0.0

    completed_on_time = sum(1 for t in tasks_in_period if t.completed_on_time())
    return (completed_on_time / total) * 100


def get_prime_eligibility(user):
    """
    Calcule les taux et primes pour un professeur :
    - trimestre en cours
    - année en cours

    Retour:
        dict : {
            'quarter': {'rate': float, 'prime': int},
            'year': {'rate': float, 'prime': int}
        }
    """
    if user.user_type != 'professeur':
        return {'error': 'Seuls les professeurs sont éligibles'}

    today = timezone.now().date()
    start_quarter = today - timedelta(days=90)
    start_year = today.replace(month=1, day=1)

    rate_quarter = calculate_completion_rate(user, start_quarter, today)
    rate_year = calculate_completion_rate(user, start_year, today)

    prime_quarter = 100 if rate_quarter == 100 else 30 if rate_quarter >= 90 else 0
    prime_year = 100 if rate_year == 100 else 30 if rate_year >= 90 else 0

    return {
        'quarter': {'rate': rate_quarter, 'prime': prime_quarter},
        'year': {'rate': rate_year, 'prime': prime_year}
    }