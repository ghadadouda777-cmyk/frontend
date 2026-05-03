import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Meal {
  name: string;
  type: string;
  quantite: number;
  cal100: number;
  prot100: number;
}

@Component({
  selector: 'app-bloomer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bloomer-dashboard.html',
  styleUrl: './bloomer-dashboard.css',
})
export class BloomerDashboard implements OnInit {
  water: number = 2;
  goalWater: number = 8;

  sleep: number = 6.5;
  goalSleep: number = 7;

  exo: number = 2;
  goalExo: number = 4;

  goalCal: number = 2000;
  goalProt: number = 150;

  meals: Meal[] = [
    { name: 'Poulet rôti', type: 'dejeuner', quantite: 300, cal100: 165, prot100: 18.3 },
    { name: 'Riz complet', type: 'petit-dej', quantite: 150, cal100: 113, prot100: 8.6 }
  ];

  newMeal: Partial<Meal> = {
    name: '',
    type: 'petit-dej',
    quantite: undefined,
    cal100: undefined,
    prot100: undefined
  };

  ngOnInit() {}

  getPercent(val: number, goal: number): number {
    if (!goal) return 0;
    const p = (val / goal) * 100;
    return p > 100 ? 100 : p;
  }

  calcCal(meal: Meal): number {
    return Math.round((meal.quantite * meal.cal100) / 100);
  }

  calcProt(meal: Meal): number {
    return Math.round((meal.quantite * meal.prot100) / 100);
  }

  get totalCalories(): number {
    return this.meals.reduce((sum, meal) => sum + this.calcCal(meal), 0);
  }

  get totalProteines(): number {
    return this.meals.reduce((sum, meal) => sum + this.calcProt(meal), 0);
  }

  addMeal() {
    if (this.newMeal.name && this.newMeal.quantite && this.newMeal.cal100 && this.newMeal.prot100) {
      this.meals.push(this.newMeal as Meal);
      this.newMeal = {
        name: '',
        type: 'petit-dej',
        quantite: undefined,
        cal100: undefined,
        prot100: undefined
      };
    }
  }

  removeMeal(index: number) {
    this.meals.splice(index, 1);
  }

  getBadgeClass(type: string): string {
    switch (type) {
      case 'petit-dej': return 'badge-petit';
      case 'dejeuner': return 'badge-dej';
      case 'diner': return 'badge-diner';
      case 'collation': return 'badge-collation';
      default: return '';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'petit-dej': return 'Petit-dej';
      case 'dejeuner': return 'Déjeuner';
      case 'diner': return 'Dîner';
      case 'collation': return 'Collation';
      default: return type;
    }
  }

  addWater() {
    this.water++;
  }

  addExercice() {
    this.exo++;
  }

  logSleep() {
    this.sleep += 0.5;
  }
}
