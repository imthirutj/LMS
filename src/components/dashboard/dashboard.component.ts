import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Employee } from '../../models/leave.model';
import { LeaveService } from '../../services/leave.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @Output() navigate = new EventEmitter<string>();

  currentUser$: Observable<Employee | null>;
  employees: Employee[] = [];
  currentView = 'dashboard';

  constructor(private leaveService: LeaveService) {
    this.currentUser$ = this.leaveService.getCurrentUser();
  }

  ngOnInit() {
    this.employees = this.leaveService.getEmployees();
  }

  onUserChange(event: any) {
    this.leaveService.switchUser(event.target.value);
  }

  navigateTo(view: string) {
    this.navigate.emit(view);
  }
}
