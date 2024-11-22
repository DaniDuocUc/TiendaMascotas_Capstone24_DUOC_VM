import moment from "moment/moment";

export class FileUtils {


    public static downloadFile(blob: any, filename: string): void {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }

    public static goToPage(url: string, target: string): void {
        window.open(url, target);
    }
}
