import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface GISLocation {
  Latitude: number;
  Longitude: number;
}

interface Project {
  Title: string;
  Description: string;
  MinCreditScore: number;
  InterestRate: number;
  Price: number;
  EligibilityCriteria: any;
  ProgressPercentage: number;
  Status: string;
  StartDate: string;
  Location: string;
  GIS_Locations: GISLocation[]; // ✅ Ensuring correct type for GIS_Locations
  ProjectImageUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = 'http://localhost:3000/api/projects';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // ✅ Get all projects
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  // ✅ Get project by ID
  getProjectById(projectId: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${projectId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // ✅ Create project
  createProject(projectData: Project, file?: File): Observable<Project> {
    const formData = new FormData();
    formData.append('Title', projectData.Title || '');
    formData.append('Description', projectData.Description || '');
    formData.append('MinCreditScore', projectData.MinCreditScore?.toString() || '0');
    formData.append('InterestRate', projectData.InterestRate?.toString() || '0');
    formData.append('Price', projectData.Price?.toString() || '0');
    formData.append('EligibilityCriteria', JSON.stringify(projectData.EligibilityCriteria || {}));
    formData.append('ProgressPercentage', projectData.ProgressPercentage?.toString() || '0');
    formData.append('Status', projectData.Status || 'Planned');
    formData.append('StartDate', projectData.StartDate || new Date().toISOString());
    formData.append('Location', projectData.Location || '');
    formData.append('GIS_Locations', JSON.stringify(projectData.GIS_Locations || []));
    
    if (file) {
      formData.append('file', file);
    }

    return this.http.post<Project>(this.apiUrl, formData, {
      headers: this.getAuthHeaders(),
    });
  }

  // ✅ Update an existing project
  updateProject(projectId: string, projectData: Project, file?: File): Observable<Project> {
    const formData = new FormData();
    formData.append('Title', projectData.Title);
    formData.append('Description', projectData.Description);
    formData.append('MinCreditScore', projectData.MinCreditScore.toString());
    formData.append('InterestRate', projectData.InterestRate.toString());
    formData.append('Price', projectData.Price.toString());
    formData.append('EligibilityCriteria', JSON.stringify(projectData.EligibilityCriteria));
    formData.append('ProgressPercentage', projectData.ProgressPercentage.toString());
    formData.append('Status', projectData.Status);
    formData.append('StartDate', projectData.StartDate);
    formData.append('Location', projectData.Location);
    formData.append('GIS_Locations', JSON.stringify(projectData.GIS_Locations));
    
    if (file) formData.append('file', file);

    return this.http.put<Project>(`${this.apiUrl}/${projectId}`, formData, {
      headers: this.getAuthHeaders(),
    });
  }

  // ✅ Delete a project
  deleteProject(projectId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${projectId}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
