from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from .models import Project
from .forms import ProjectForm

# Create your views here.

@login_required
def project_list(request):
    """
    Affiche tous les projets accessibles à l'utilisateur :
    - projets créés par l'utilisateur
    - projets auxquels l'utilisateur participe
    """
    projects_created = request.user.projects_created.all()
    projects_participating = request.user.projects_participating.all()
    context = {
        'projects_created': projects_created,
        'projects_participating': projects_participating,
    }
    return render(request, 'projects/project_list.html', context)

@login_required
def project_create(request):
    """
    Crée un nouveau projet. 
    - Le créateur est l'utilisateur connecté.
    - Les membres peuvent être ajoutés via le formulaire.
    """
    if request.method == 'POST':
        form = ProjectForm(request.POST)
        if form.is_valid():
            project = form.save(commit=False)
            project.created_by = request.user
            project.save()
            # Ajouter les membres sélectionnés
            form.save_m2m()
            messages.success(request, 'Projet créé avec succès.')
            return redirect('project_list')
    else:
        form = ProjectForm()
    return render(request, 'projects/project_form.html', {'form': form, 'action': 'Créer'})

@login_required
def project_update(request, pk):
    """
    Met à jour un projet existant.
    Seul le créateur peut modifier le projet.
    """
    project = get_object_or_404(Project, pk=pk)
    if project.created_by != request.user:
        messages.error(request, "Vous n'êtes pas autorisé à modifier ce projet.")
        return redirect('project_list')
    if request.method == 'POST':
        form = ProjectForm(request.POST, instance=project)
        if form.is_valid():
            form.save()
            messages.success(request, 'Projet mis à jour.')
            return redirect('project_list')
    else:
        form = ProjectForm(instance=project)
    return render(request, 'projects/project_form.html', {'form': form, 'action': 'Modifier'})

@login_required
def project_delete(request, pk):
    """
    Supprime un projet.
    Seul le créateur peut supprimer.
    Confirmation via template avant suppression.
    """
    project = get_object_or_404(Project, pk=pk)
    if project.created_by != request.user:
        messages.error(request, "Vous n'êtes pas autorisé à supprimer ce projet.")
        return redirect('project_list')
    if request.method == 'POST':
        project.delete()
        messages.success(request, 'Projet supprimé.')
        return redirect('project_list')
    return render(request, 'projects/project_confirm_delete.html', {'project': project})