import { ILayout } from "@docsvision/webclient/System/$Layout";
import { Layout } from "@docsvision/webclient/System/Layout";
import { CommonLogic } from "./CommonLogic";
import { $MessageBox } from "@docsvision/webclient/System/$MessageBox";
import { DirectoryDesignerRow } from "@docsvision/webclient/BackOffice/DirectoryDesignerRow";
import { NumberControl } from "@docsvision/webclient/Platform/Number";
import { GenModels } from "@docsvision/webclient/Generated/DocsVision.WebClient.Models";
import { $DepartmentController, $EmployeeController } from "@docsvision/webclient/Generated/DocsVision.WebClient.Controllers";
import { isEmptyGuid } from "@docsvision/webclient/System/GuidUtils";
import { TextArea } from "@docsvision/webclient/Platform/TextArea";
import { DateTimePicker } from "@docsvision/webclient/Platform/DateTimePicker";
import { layoutManager } from "@docsvision/webclient/System/LayoutManager";

export class ApplicationPurchaseEquipmentLogic extends CommonLogic {
    public async savingConfirmed(layout:ILayout): Promise<boolean> {
        try {
            await layout.getService($MessageBox).showConfirmation('Сохранить карточку?');
            return true;
        } catch(e) {
            return false;
        }
    }

    public async sendCardDataMsg(sender: TextArea, sender1: DirectoryDesignerRow) {

        let name = sender.layout.controls.get<TextArea>("name").params.value;
        let dateOfCreate = layoutManager.cardLayout.controls.get<DateTimePicker>("dateOfCreate").params.value;
        let date_from = layoutManager.cardLayout.controls.get<DateTimePicker>("startDate").params.value;
        let date_to = layoutManager.cardLayout.controls.get<DateTimePicker>("endDate").params.value;
        let purpose = sender.layout.controls.get<TextArea>("purpose").params.value;
        let dateOfCreate_str = dateOfCreate ? new Date(dateOfCreate).toLocaleDateString() : "";
        let date_from_str = date_from ? new Date(date_from).toLocaleDateString() : "";
        let date_to_str = date_to ? new Date(date_to).toLocaleDateString() : "";
        let city = layoutManager.cardLayout.controls.get<DirectoryDesignerRow>("directoryDesignerRowCity").params.value.name;

        await sender.getService($MessageBox).showInfo(`Название: ${name}\nДата создания: ${dateOfCreate_str}\nДата с: ${date_from_str}\nДата по: ${date_to_str}\nОснование поездки: ${purpose}\nГород: ${city}`);
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

    public async preSaveCheck(layout:ILayout) {

    let requiredCtrl = layout.controls.tryGet<TextArea>("name");

    if (!requiredCtrl.params.value) {
        await layout.getService($MessageBox).showWarning("Заполните поле 'название'");
        return false;
    }
    else {
        return true;
    }
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