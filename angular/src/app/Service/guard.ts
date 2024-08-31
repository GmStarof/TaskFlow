import { AuthService } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.login) {
      return true;
    } else {
      this.router.navigate(['/Account/Login']);
      return false;
    }
  }
}