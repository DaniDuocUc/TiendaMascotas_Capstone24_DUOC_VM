import {Component, Input} from "@angular/core";
import {TitleCasePipe} from "@angular/common";

@Component({
    selector: 'badge',
    standalone: true,
    template: `<span
        [class]="'p-2 font-bold text-white rounded-md text-sm mr-3 opacity-70  ' + classes">{{ (value) ? (value | titlecase) : '-' }}</span>`,
    imports: [
        TitleCasePipe
    ]
})
export class BadgeComponent {
    @Input() public value: string;
    @Input() public classes: string;
}
