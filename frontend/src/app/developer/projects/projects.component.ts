import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent {
  projects = [
    {
      ProjectID: '1',
      Title: 'Sunrise Apartments',
      Description: 'Modern and affordable apartments in Nairobi.',
      Status: 'Ongoing',
      ProgressPercentage: 60,
      EligibilityCriteria: { income: 'Above Ksh 50,000', employment: 'Permanent' },
      MinCreditScore: 650,
      InterestRate: 5.5,
      Price: 4500000,
      ProjectImageUrl: 'assets/sunrise.jpg',
      DeveloperID: 'dev-123',
      StartDate: new Date('2024-03-01'),
      CreatedAt: new Date(),
      Location: 'Nairobi, Kenya',
      GISLocation: { lat: -1.286389, lng: 36.817223 }
    },
    {
      ProjectID: '2',
      Title: 'Greenwood Villas',
      Description: 'Luxury villas in Mombasa with a beachfront view.',
      Status: 'Completed',
      ProgressPercentage: 100,
      EligibilityCriteria: { income: 'Above Ksh 80,000', employment: 'Business Owner' },
      MinCreditScore: 700,
      InterestRate: 6.0,
      Price: 5500000,
      ProjectImageUrl: 'assets/greenwood.jpg',
      DeveloperID: 'dev-124',
      StartDate: new Date('2023-06-01'),
      CreatedAt: new Date(),
      Location: 'Mombasa, Kenya',
      GISLocation: { lat: -4.043477, lng: 39.668206 }
    }
  ];

  selectedProject: any = null;
  editProjectData: any = null;
  deleteProjectData: any = null;
  successMessage: string = '';

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
    this.projects = this.projects.map(p => (p.ProjectID === this.editProjectData.ProjectID ? this.editProjectData : p));
    this.closeEditModal();
    this.showSuccessMessage('Project updated successfully!');
  }

  openDeleteModal(project: any) {
    this.deleteProjectData = project;
  }

  closeDeleteModal() {
    this.deleteProjectData = null;
  }

  confirmDelete() {
    this.projects = this.projects.filter(p => p.ProjectID !== this.deleteProjectData.ProjectID);
    this.closeDeleteModal();
    this.showSuccessMessage('Project deleted successfully!');
  }

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
    ProjectImageUrl: '',
    DeveloperID: '',
    StartDate: new Date(),
    CreatedAt: new Date(),
    Location: '',
    GISLocation: { lat: null, lng: null }
  };

  openAddModal() {
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
      ProjectImageUrl: '',
      DeveloperID: '',
      StartDate: new Date(),
      CreatedAt: new Date(),
      Location: '',
      GISLocation: { lat: null, lng: null }
    };
  }

  addProject() {
    const newId = (this.projects.length + 1).toString();
    const projectToAdd = { ...this.newProject, ProjectID: newId };
    this.projects.push(projectToAdd);
    this.closeAddModal();
    this.showSuccessMessage('Project added successfully!');
  }

  showSuccessMessage(message: string) {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newProject.ProjectImage = e.target.result; // Convert file to base64
      };
      reader.readAsDataURL(file);
    }
  }
}
