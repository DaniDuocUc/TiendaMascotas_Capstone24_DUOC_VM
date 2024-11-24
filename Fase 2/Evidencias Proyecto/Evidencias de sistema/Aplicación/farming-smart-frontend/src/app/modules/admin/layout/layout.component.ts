import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'layout-v2',
    standalone: true,
    imports: [CommonModule],
    template: `
        <!-- Main -->
        <div class="flex-auto w-full">
            <!-- CONTENT GOES HERE -->
            <div [class]="'dark:dark rounded  sm:px-4 py-4 w-full h-full ' + customClass">
                <ng-content></ng-content>
            </div>
        </div>
    `,
    exportAs: 'layoutV2'
})
export class LayoutV2Component {
    @Input() public customClass: string;
}
