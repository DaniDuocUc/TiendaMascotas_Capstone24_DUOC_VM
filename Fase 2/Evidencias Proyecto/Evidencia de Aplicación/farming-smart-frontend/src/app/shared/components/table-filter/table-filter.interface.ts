import {MatFormFieldAppearance} from "@angular/material/form-field";

export interface IItemFilter {
    name: string;
    type: 'input' | 'select' | 'date' | 'checkbox' | 'radio' | 'string' | 'custom'
    columns?: string[];
    placeholder?: string;
    class?: string;
    label?: string;
    appearance?: MatFormFieldAppearance
    icon?: string;
    iconClass?: string;
    // Select
    multiple?: boolean;
    labelSearch?: string;
    labelAll?: string;
    values?: IItemValue[];
    method?: (item: any) => boolean;
    translate?: string;
}

export interface IItemValue {
    name: string;
    label: string;
    value: any;
}
