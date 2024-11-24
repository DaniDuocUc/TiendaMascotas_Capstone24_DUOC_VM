import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {DatePipe, NgClass, NgFor, NgIf, NgTemplateOutlet} from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import {MatButton, MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {RouterLink} from '@angular/router';
import {Notification} from 'app/layout/common/notifications/notifications.types';
import {Subject} from 'rxjs';
import {SocketService} from "../../../shared/services/socket/socket.service";
import {AlertService} from "../../../modules/admin/alert";

@Component({
    selector: 'notifications',
    templateUrl: './notifications.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'notifications',
    standalone: true,
    imports: [MatButtonModule, NgIf, MatIconModule, MatTooltipModule, NgFor, NgClass, NgTemplateOutlet, RouterLink, DatePipe],
})
export class NotificationsComponent implements OnInit, OnDestroy {
    @ViewChild('notificationsOrigin') private _notificationsOrigin: MatButton;
    @ViewChild('notificationsPanel') private _notificationsPanel: TemplateRef<any>;
    notifications: any[] = [];
    unreadCount: number = 0;
    private _overlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _socketService = inject(SocketService);
    private _alertService = inject(AlertService);

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
    ) {
        if (localStorage.getItem('notifications')) {
            this.notifications = JSON.parse(localStorage.getItem('notifications'));
            this._calculateUnreadCount();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._socketService.message$
            .subscribe({
                next: (message: any) => {
                    if (message?.alerts?.length > 0) {
                        const item = message.alerts.map((alert: any) => {
                            return {
                                ...alert,
                                read: false,
                                link: '/alert',
                                status: '',
                                useRouter: true,
                                title: `${alert.alert_name} - IOT ${alert.device_id}`,
                                description: `${alert.product_name} - ${alert.condition}`,
                                time: new Date(),
                            }
                        })[0];
                        const existingItem = this.notifications.find((notification: Notification) => notification.id === item.id && notification.time === item.time);
                        if (existingItem) {
                            return;
                        }
                        this.notifications.unshift(item);
                        localStorage.setItem('notifications', JSON.stringify(this.notifications));
                    }
                    this._calculateUnreadCount();
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                }
            })
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();

        // Dispose the overlay
        if (this._overlayRef) {
            this._overlayRef.dispose();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------


    changeIndex(): void {
        this._alertService.indexTab = 1;
    }

    /**
     * Open the notifications panel
     */
    openPanel(): void {
        // Return if the notifications panel or its origin is not defined
        if (!this._notificationsPanel || !this._notificationsOrigin) {
            return;
        }

        // Create the overlay if it doesn't exist
        if (!this._overlayRef) {
            this._createOverlay();
        }

        // Attach the portal to the overlay
        this._overlayRef.attach(new TemplatePortal(this._notificationsPanel, this._viewContainerRef));
    }

    /**
     * Close the notifications panel
     */
    closePanel(): void {
        this._overlayRef.detach();
    }

    /**
     * Mark all notifications as read
     */
    markAllAsRead(): void {
        // Mark all as read
        this.notifications = [];
        this._calculateUnreadCount();
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Toggle read status of the given notification
     */
    toggleRead(notification: Notification): void {
        // Toggle the read status
        notification.read = !notification.read;

        // Update the notification
        //this._notificationsService.update(notification.id, notification).subscribe();
    }

    /**
     * Delete the given notification
     */
    delete(notification: Notification): void {
        const index = this.notifications.indexOf(notification);
        this.notifications.splice(index, 1);
        this._calculateUnreadCount();
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Create the overlay
     */
    private _createOverlay(): void {
        // Create the overlay
        this._overlayRef = this._overlay.create({
            hasBackdrop: true,
            backdropClass: 'fuse-backdrop-on-mobile',
            scrollStrategy: this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position()
                .flexibleConnectedTo(this._notificationsOrigin._elementRef.nativeElement)
                .withLockedPosition(true)
                .withPush(true)
                .withPositions([
                    {
                        originX: 'start',
                        originY: 'bottom',
                        overlayX: 'start',
                        overlayY: 'top',
                    },
                    {
                        originX: 'start',
                        originY: 'top',
                        overlayX: 'start',
                        overlayY: 'bottom',
                    },
                    {
                        originX: 'end',
                        originY: 'bottom',
                        overlayX: 'end',
                        overlayY: 'top',
                    },
                    {
                        originX: 'end',
                        originY: 'top',
                        overlayX: 'end',
                        overlayY: 'bottom',
                    },
                ]),
        });

        // Detach the overlay from the portal on backdrop click
        this._overlayRef.backdropClick().subscribe(() => {
            this._overlayRef.detach();
        });
    }

    /**
     * Calculate the unread count
     *
     * @private
     */
    private _calculateUnreadCount(): void {
        let count = 0;

        if (this.notifications.length > 0) {
            count = this.notifications.filter(notification => !notification.read).length;
        }

        this.unreadCount = count;
    }
}
