export interface IConfigV2 {
    name: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    multiple?: boolean;
    selectAll?: boolean;
    selectAllLabel?: string;
    options?: any[];
    all?: any;
    values?: ISelectValue[];
    value?: ISelectValue;
}

export interface ISelectValue {
    label: string;
    value: string;
}

export interface ISelectOption {
    onlySelf?: boolean;
    emitEvent?: boolean;
    emitModelToViewChange?: boolean;
    emitViewToModelChange?: boolean;
}
