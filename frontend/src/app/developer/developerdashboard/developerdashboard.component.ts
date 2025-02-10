import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component'; // Import Sidebar Component

@Component({
  selector: 'app-developerdashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent], // Add Sidebar to imports
  templateUrl: './developerdashboard.component.html',
  styleUrl: './developerdashboard.component.css'
})
export class DeveloperdashboardComponent
 {
  projects = [
    {
      name: 'Green Haven Estate',
      location: 'Nairobi',
      price: 5000000,
      status: 'Ongoing',
      image: 'assets/nakuru.jpg'
    },
    {
      name: 'Sunrise Apartments',
      location: 'Mombasa',
      price: 6500000,
      status: 'Completed',
      image: 'assets/nairobi.jpg'
    },
    {
      name: 'Palm View Villas',
      location: 'Kisumu',
      price: 7000000,
      status: 'Pending Approval',
      image: 'assets/nakuru.jpg'
    }
  ];
}
