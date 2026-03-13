from django.db import models
from django.conf import settings
from django.utils import timezone

# Create your models here.

class Task(models.Model):
    STATUS_CHOICES = [
        ('a_faire', 'À faire'),
        ('en_cours', 'En cours'),
        ('termine', 'Terminé'),
    ]

    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='a_faire')
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks_assigned'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title

    def completed_on_time(self):
        """
        Retourne True si la tâche est terminée et complétée à temps (avant ou à la due_date)
        """
        return (
            self.status == 'termine'
            and self.completed_at
            and self.completed_at.date() <= self.due_date
        )

    def save(self, *args, **kwargs):
        """
        Si le statut est 'termine' et que completed_at n'est pas défini,
        on définit la date actuelle automatiquement.
        """
        if self.status == "termine" and not self.completed_at:
            self.completed_at = timezone.now()
        super().save(*args, **kwargs)