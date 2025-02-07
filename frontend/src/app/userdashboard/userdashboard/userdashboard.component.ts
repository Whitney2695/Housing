import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';


@Component({
  selector: 'app-userdashboard',
  standalone: true,
  imports: [FormsModule, CommonModule,RouterLink, NavbarComponent],
  templateUrl: './userdashboard.component.html',
  styleUrls: ['./userdashboard.component.css'] // Corrected `styleUrl` to `styleUrls`
})
export class UserdashboardComponent {
  searchQuery: string = '';
  userMenuOpen: boolean = false;
  

  projects = [
    { id: 1, name: 'Sunset Apartments', location: 'Nairobi', price: 4500000, amount: '3M - 5M', image: 'assets/nairobi.jpg' },
    { id: 2, name: 'Green Valley Homes', location: 'Mombasa', price: 3800000, amount: '2M - 4M', image: 'assets/nakuru.jpg' },
    { id: 3, name: 'Lakeview Villas', location: 'Kisumu', price: 5000000, amount: '4M - 6M', image: 'assets/house.jpg' },
    { id: 4, name: 'Palm Residency', location: 'Nakuru', price: 3200000, amount: '2M - 4M', image: 'assets/nairobi.jpg' },
    { id: 5, name: 'Royal Gardens', location: 'Eldoret', price: 4200000, amount: '3M - 5M', image: 'assets/house2.jpg' },
    { id: 6, name: 'Ocean Breeze Apartments', location: 'Mombasa', price: 5500000, amount: '5M - 7M', image: 'assets/nakuru.jpg' },
    { id: 7, name: 'Savannah Heights', location: 'Thika', price: 3700000, amount: '2M - 4M', image: 'assets/house.jpg.' },
    { id: 8, name: 'Riverside Manor', location: 'Nairobi', price: 6800000, amount: '6M - 8M', image: 'assets/house2.jpeg.' },
    { id: 9, name: 'Hilltop Residences', location: 'Naivasha', price: 2900000, amount: '2M - 3M', image: 'assets/nairobi.jpg' },
    { id: 10, name: 'Emerald Gardens', location: 'Machakos', price: 3300000, amount: '2M - 4M', image: 'assets/nakuru.jpg' },
    { id: 11, name: 'The Grand Lofts', location: 'Nairobi', price: 7500000, amount: '7M - 9M', image: 'assets/house.jpg' },
    { id: 12, name: 'Parklane Villas', location: 'Kisumu', price: 4100000, amount: '3M - 5M', image: 'assets/nairobi.jpg' },
    { id: 13, name: 'Golden Crest Apartments', location: 'Nakuru', price: 4900000, amount: '4M - 6M', image: 'assets/nairobi.jpg' },
    { id: 14, name: 'Blue Sky Residences', location: 'Eldoret', price: 6200000, amount: '6M - 8M', image: 'assets/house.jpg'},
    { id: 15, name: 'Serene Homes', location: 'Nyeri', price: 3500000, amount: '2M - 4M', image: 'assets/nairobi.jpg' }
  ];
  filteredProjects = [...this.projects];
      
  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  filterProjects() {
    const query = this.searchQuery.toLowerCase();
    this.filteredProjects = this.projects.filter(project =>
      project.name.toLowerCase().includes(query) ||
      project.location.toLowerCase().includes(query) ||
      project.price.toString().includes(query) ||
      project.amount.toLowerCase().includes(query)
    );
  }
}


