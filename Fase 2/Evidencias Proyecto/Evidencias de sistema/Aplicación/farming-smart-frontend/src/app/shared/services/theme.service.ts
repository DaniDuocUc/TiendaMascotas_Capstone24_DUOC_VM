import {inject, Injectable, signal} from "@angular/core";
import {FuseConfigService} from "../../../@fuse/services/config";

export type ITheme = 'light' | 'dark';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    theme = signal<ITheme>('dark');
    private _fuseConfigService = inject(FuseConfigService);

    loadThemeWithFuse(theme: ITheme): void {
        this.theme.set(theme);
        this._fuseConfigService.config = {scheme: this.theme()};
    }


    loadTheme(): void {
        const theme: string = window.localStorage.getItem('theme') || 'dark';
        this.loadThemeWithFuse(theme as ITheme);
    }

}
