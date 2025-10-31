import { ILayout } from "@docsvision/webclient/System/$Layout";
import { CommonLogic } from "./CommonLogic";
import { $MessageBox } from "@docsvision/webclient/System/$MessageBox";
import { DirectoryDesignerRow } from "@docsvision/webclient/BackOffice/DirectoryDesignerRow";
import { NumberControl } from "@docsvision/webclient/Platform/Number";
import { GenModels } from "@docsvision/webclient/Generated/DocsVision.WebClient.Models";
import { $DepartmentController, $EmployeeController } from "@docsvision/webclient/Generated/DocsVision.WebClient.Controllers";
import { isEmptyGuid } from "@docsvision/webclient/System/GuidUtils";
import { TextArea } from "@docsvision/webclient/Platform/TextArea";
import { DateTimePicker } from "@docsvision/webclient/Platform/DateTimePicker";

export class ApplicationPurchaseEquipmentLogic extends CommonLogic {
    public async savingConfirmed(layout:ILayout): Promise<boolean> {
        try {
            await layout.getService($MessageBox).showConfirmation('Сохранить карточку?');
            return true;
        } catch(e) {
            return false;
        }
    }

    public async sendCardDataMsg(sender: TextArea) {
        const layout = sender.layout;
        
        if (!layout) {
            console.error("Layout not found");
            return;
        }

        try {
            const nameCtrl = layout.controls.tryGet<TextArea>("name");
            const dateOfCreateCtrl = layout.controls.tryGet<DateTimePicker>("dateOfCreate");
            const startDateCtrl = layout.controls.tryGet<DateTimePicker>("startDate");
            const endDateCtrl = layout.controls.tryGet<DateTimePicker>("endDate");
            const purposeCtrl = layout.controls.tryGet<TextArea>("purpose");
            const cityCtrl = layout.controls.tryGet<DirectoryDesignerRow>("directoryDesignerRowCity");

            // Безопасное получение значений
            const name = nameCtrl?.params.value || "не указано";
            const dateOfCreate = dateOfCreateCtrl?.params.value;
            const date_from = startDateCtrl?.params.value;
            const date_to = endDateCtrl?.params.value;
            const purpose = purposeCtrl?.params.value || "не указано";
            
            // Получение названия города
            let city = cityCtrl?.params.value?.name || "не указан";


            // Форматирование дат
            const formatDate = (date: Date | null): string => {
                return date ? new Date(date).toLocaleDateString('ru-RU') : "не указана";
            };

            const message = `Название: ${name}
            Дата создания: ${formatDate(dateOfCreate)}
            Дата с: ${formatDate(date_from)}
            Дата по: ${formatDate(date_to)}
            Основание поездки: ${purpose}
            Город: ${city}`;

            await layout.getService($MessageBox).showInfo(message);

        } catch (error) {
            console.error("Ошибка при получении данных карточки:", error);
            await layout.getService($MessageBox).showError("Не удалось получить данные карточки");
        }
    }   


    public async checkChangeDate(sender: DateTimePicker) {

        const dateFrom = sender.layout.controls.tryGet<DateTimePicker>("startDate").params.value; 
        const dateTo = sender.layout.controls.tryGet<DateTimePicker>("endDate").params.value;

        if (dateFrom && dateTo) {
            if (dateFrom >= dateTo) {
                await sender.layout.getService($MessageBox).showWarning("Дата 'с' должна быть меньше даты 'по'!");
                sender.params.value = null;
            }
        }
    }

    public async preSaveCheck(layout: ILayout): Promise<boolean> {

        const requiredCtrl = layout.controls.tryGet<TextArea>("name");
        
        if (!requiredCtrl || !requiredCtrl.params.value || requiredCtrl.params.value.trim().length === 0) {
            await layout.getService($MessageBox).showWarning("Заполните поле 'Название'");
            return false;
        }
        
        return true;
    }

    public async sendSavingMsg(layout:ILayout) {
        await layout.getService($MessageBox).showInfo('Карточка сохраняется!');
    }
    
    public async sendSavedMsg(layout:ILayout) {
        await layout.getService($MessageBox).showInfo('Карточка сохранена!');
    }
    
    public async updatePriceField(layout:ILayout) {
        const typeCtrl = layout.controls.tryGet<DirectoryDesignerRow>("directoryDesignerRowTechType");
        if (!typeCtrl) {
             await layout.getService($MessageBox).showError('Элемент управления directoryDesignerRowTechType отсутствует в разметке!');
             return;
        }

        await this.updatePriceFieldByTypeCtrl(typeCtrl);
    }
    
    public async updatePriceFieldByTypeCtrl(typeCtrl:DirectoryDesignerRow) {
        const layout = typeCtrl.layout;
        const priceControl = layout.controls.tryGet<NumberControl>("numberPrice");

        const messageBoxSvc = layout.getService($MessageBox);

        if (!priceControl) {
            await messageBoxSvc.showError('Элемент управления numberPrice отсутствует в разметке!');
            return;
        }

        if (!typeCtrl.params.value || isEmptyGuid(typeCtrl.params.value.id)) {
            priceControl.params.value = null;
            return;
        }
        
        typeCtrl.params.value

        var parsedValue = this.tryParseInt(typeCtrl.params.value.description);
        if (parsedValue === undefined) {
            await messageBoxSvc
                .showError(`В описании строки справочника ${typeCtrl.params.value.name} содержится не число! Значение: ${typeCtrl.params.value.description}`);
            return;
        }

        priceControl.params.value = parsedValue;
        return;
    }

    public async showEmployeeData(layout: ILayout, itemData:GenModels.IDirectoryItemData) {
        if (!itemData) { return; }
        const messageBoxSvc = layout.getService($MessageBox);
        if (itemData.dataType !== GenModels.DirectoryDataType.Employee) {
            await messageBoxSvc.showError("Неверный тип объекта");
            console.log(itemData);
        }

        const employeeModel = await layout.getService($EmployeeController).getEmployee(itemData.id);
        if (employeeModel) {
            const empUnitModel = await layout.getService($DepartmentController).getStaffDepartment(employeeModel.unitId);
            const lines = [
                `ФИО: ${employeeModel.lastName} ${employeeModel.firstName ?? ''} ${employeeModel.middleName ?? ''}`,
                employeeModel.position ? `Должность: ${employeeModel.position}` : null,
                `Статус: ${this.getEmployeeStatusString(employeeModel.status)}`,
                empUnitModel ? `Подразделение: ${empUnitModel.name}` : null,
            ].filter(Boolean).join('\n');

            await messageBoxSvc.showInfo(lines, "Информация о выбранном сотруднике");
        }
    }
}