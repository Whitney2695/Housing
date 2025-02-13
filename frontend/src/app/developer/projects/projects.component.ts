import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ProjectService } from '../../services/project.service';

interface GISLocation {
  Latitude: number;
  Longitude: number;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  projects: any[] = [];
  selectedProject: any = null;
  editProjectData: any = null;
  deleteProjectData: any = null;
  successMessage: string = '';
  showAddModal = false;
  newProject: any = {
    Title: '',
    Description: '',
    Status: 'Planned',
    ProgressPercentage: 0,
    EligibilityCriteria: { income: '', employment: '' },
    MinCreditScore: null,
    InterestRate: null,
    Price: null,
    ProjectImageUrl: '', // ✅ Fixed Property Name
    DeveloperID: '', // ✅ Ensured DeveloperID is always included
    StartDate: new Date().toISOString(),
    CreatedAt: new Date().toISOString(),
    Location: '',
    GIS_Locations: [] as GISLocation[] // ✅ Ensured GIS_Locations is an array of GISLocation
  };
  selectedFile: File | null = null;

  constructor(private projectService: ProjectService) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.projectService.getProjects().subscribe(
      (data: any) => {
        this.projects = data.map((project: any) => ({
          ...project,
          DeveloperID: project.DeveloperID ?? '',
          GIS_Locations: Array.isArray(project.GIS_Locations) ? project.GIS_Locations : [] // ✅ Ensure it's always an array
        }));
      },
      (error: any) => {
        console.error('Error fetching projects', error);
      }
    );
  }
  

  openViewModal(project: any) {
    this.selectedProject = project;
  }

  closeViewModal() {
    this.selectedProject = null;
  }

  openEditModal(project: any) {
    this.editProjectData = { ...project };
  }

  closeEditModal() {
    this.editProjectData = null;
  }

  updateProject() {
    if (this.editProjectData) {
      this.projectService.updateProject(
        this.editProjectData.ProjectID,
        this.editProjectData,
        this.selectedFile || undefined
      ).subscribe(
        () => {
          this.loadProjects();
          this.closeEditModal();
          this.showSuccessMessage('Project updated successfully!');
        },
        (error: any) => console.error('Error updating project', error)
      );
    }
  }

  openDeleteModal(project: any) {
    this.deleteProjectData = project;
  }

  closeDeleteModal() {
    this.deleteProjectData = null;
  }

  confirmDelete() {
    if (this.deleteProjectData) {
      this.projectService.deleteProject(this.deleteProjectData.ProjectID).subscribe(
        () => {
          this.projects = this.projects.filter(p => p.ProjectID !== this.deleteProjectData.ProjectID);
          this.closeDeleteModal();
          this.showSuccessMessage('Project deleted successfully!');
        },
        (error: any) => console.error('Error deleting project', error)
      );
    }
  }

  openAddModal() {
    this.newProject = {
      Title: '',
      Description: '',
      Status: 'Planned',
      ProgressPercentage: 0,
      EligibilityCriteria: { income: '', employment: '' },
      MinCreditScore: null,
      InterestRate: null,
      Price: null,
      ProjectImageUrl: '',
      DeveloperID: '',
      StartDate: new Date().toISOString(),
      CreatedAt: new Date().toISOString(),
      Location: '',
      GIS_Locations: [{ Latitude: null, Longitude: null }] // ✅ Fix: Initialize with an object
    };
    this.showAddModal = true;
  }
  

  closeAddModal() {
    this.showAddModal = false;
    this.resetNewProject();
  }

  resetNewProject() {
    this.newProject = {
      Title: '',
      Description: '',
      Status: 'Planned',
      ProgressPercentage: 0,
      EligibilityCriteria: { income: '', employment: '' },
      MinCreditScore: null,
      InterestRate: null,
      Price: null,
      ProjectImageUrl: '', // ✅ Correct Property Name
      DeveloperID: '', // ✅ Ensure DeveloperID is always included
      StartDate: new Date().toISOString(),
      CreatedAt: new Date().toISOString(),
      Location: '',
      GIS_Locations: [] as GISLocation[] // ✅ Ensured GIS_Locations is an array of GISLocation
    };
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] || null;
  }

  addProject() {
    this.projectService.createProject(this.newProject, this.selectedFile || undefined).subscribe(
      (response: any) => {
        this.projects.push({
          ...response,
          DeveloperID: response.DeveloperID ?? '', // ✅ Ensure DeveloperID is included
          GIS_Locations: response.GIS_Locations ?? [] as GISLocation[] // ✅ Prevents GIS_Locations type errors
        });
        this.closeAddModal();
        this.showSuccessMessage('Project added successfully!');
      },
      (error: any) => console.error('Error adding project', error)
    );
  }

  showSuccessMessage(message: string) {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }
}