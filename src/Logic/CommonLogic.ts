import { GenModels } from "@docsvision/webclient/Generated/DocsVision.WebClient.Models";

export class CommonLogic {
    protected tryParseInt(value: string | null | undefined) {
        if (value === null || value === undefined || typeof value !== 'string') {
            return undefined;
        }

        const parsed = parseInt(value, 10);

        return isNaN(parsed) ? undefined : parsed;
    }
    
    public getEmployeeStatusString(status: GenModels.StaffEmployeeStatus): string {
        switch (status) {
        case GenModels.StaffEmployeeStatus.Active:
            return "Активен";
        case GenModels.StaffEmployeeStatus.Sick:
            return "Больничный";
        case GenModels.StaffEmployeeStatus.Vacation:
            return "Отпуск";
        case GenModels.StaffEmployeeStatus.BusinessTrip:
            return "Командировка";
        case GenModels.StaffEmployeeStatus.Absent:
            return "Отсутствует";
        case GenModels.StaffEmployeeStatus.Discharged:
            return "Уволен";
        case GenModels.StaffEmployeeStatus.Transfered:
            return "Переведён";
        case GenModels.StaffEmployeeStatus.DischargedNoRestoration:
            return "Уволен без восстановления";
        default:
            return "Неизвестный статус";
        }
  }
}