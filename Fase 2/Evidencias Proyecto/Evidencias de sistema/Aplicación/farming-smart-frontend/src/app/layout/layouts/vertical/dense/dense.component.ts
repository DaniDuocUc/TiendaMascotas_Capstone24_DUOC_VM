import {NgIf, NgOptimizedImage} from '@angular/common';
import {Component, inject, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {RouterOutlet} from '@angular/router';
import {FuseFullscreenComponent} from '@fuse/components/fullscreen';
import {FuseLoadingBarComponent} from '@fuse/components/loading-bar';
import {FuseNavigationService, FuseVerticalNavigationComponent} from '@fuse/components/navigation';
import {FuseMediaWatcherService} from '@fuse/services/media-watcher';
import {NavigationService} from 'app/core/navigation/navigation.service';
import {Navigation} from 'app/core/navigation/navigation.types';
import {LanguagesComponent} from 'app/layout/common/languages/languages.component';
import {MessagesComponent} from 'app/layout/common/messages/messages.component';
import {NotificationsComponent} from 'app/layout/common/notifications/notifications.component';
import {QuickChatComponent} from 'app/layout/common/quick-chat/quick-chat.component';
import {SearchComponent} from 'app/layout/common/search/search.component';
import {ShortcutsComponent} from 'app/layout/common/shortcuts/shortcuts.component';
import {UserComponent} from 'app/layout/common/user/user.component';
import {Subject, takeUntil} from 'rxjs';
import {MatTooltipModule} from "@angular/material/tooltip";
import {TranslocoModule} from "@ngneat/transloco";
import {ThemeService} from "../../../../shared/services/theme.service";
import {SettingsComponent} from "../../../common/settings/settings.component";

@Component({
    selector: 'dense-layout',
    templateUrl: './dense.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [FuseLoadingBarComponent, FuseVerticalNavigationComponent, MatButtonModule, MatIconModule, LanguagesComponent, FuseFullscreenComponent, SearchComponent, ShortcutsComponent, MessagesComponent, NotificationsComponent, UserComponent, NgIf, RouterOutlet, QuickChatComponent, MatTooltipModule, TranslocoModule, NgOptimizedImage, SettingsComponent],
})
export class DenseLayoutComponent implements OnInit, OnDestroy {
    isScreenSmall: boolean;
    navigation: Navigation;
    navigationAppearance: 'default' | 'dense' = 'dense';
    theme: string = 'light';
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _themeService = inject(ThemeService);

    /**
     * Constructor
     */
    constructor(
        private _navigationService: NavigationService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._themeService.loadTheme();
        this.theme = this._themeService.theme();
        // Subscribe to navigation data
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) => {
                this.navigation = navigation;
            });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {
                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');

                // Change the navigation appearance
                this.navigationAppearance = this.isScreenSmall ? 'default' : 'dense';
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void {
        // Get the navigation
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);

        if (navigation) {
            // Toggle the opened status
            navigation.toggle();
        }
    }

    /**
     * Toggle the navigation appearance
     */
    toggleNavigationAppearance(): void {
        this.navigationAppearance = (this.navigationAppearance === 'default' ? 'dense' : 'default');
    }

    setScheme(): void {
        this.theme = (this.theme === 'light' ? 'dark' : 'light');
        window.localStorage.setItem('theme', this.theme);
        this._themeService.loadThemeWithFuse(this.theme as 'light' | 'dark');
    }
}
