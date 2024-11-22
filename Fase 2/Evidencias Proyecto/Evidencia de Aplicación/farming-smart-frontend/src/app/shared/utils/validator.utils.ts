export class ValidatorUtils {


    public static onlyNumbers(event: any): boolean {
        const pattern = /[0-9]/;
        const inputChar = String.fromCharCode(event.charCode);
        return pattern.test(inputChar);
    }
}
