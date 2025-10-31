import { ILayout } from "@docsvision/webclient/System/$Layout";
import { CancelableEventArgs } from "@docsvision/webclient/System/CancelableEventArgs";
import { ICardSavingEventArgs } from "@docsvision/webclient/System/ICardSavingEventArgs";
import { Layout } from "@docsvision/webclient/System/Layout";
import { ApplicationPurchaseEquipmentLogic } from "../Logic/ApplicationPurchaseEquipmentLogic";
import { DirectoryDesignerRow } from "@docsvision/webclient/BackOffice/DirectoryDesignerRow";
import { GenModels } from "@docsvision/webclient/Generated/DocsVision.WebClient.Models";
import { IDataChangedEventArgs, IDataChangedEventArgsEx } from "@docsvision/webclient/System/IDataChangedEventArgs";
import { StaffDirectoryItems } from "@docsvision/webclient/BackOffice/StaffDirectoryItems";
import { DateTimePicker } from "@docsvision/webclient/Platform/DateTimePicker";
import { TextArea } from "@docsvision/webclient/Platform/TextArea";


/**
 * Событие нажатия на кнопку "Данные карточки"
 * @param sender контрол
 * @param sender1 контрол
 */
export async function ddApplicationPurchaseEquipment_showCardData(sender: TextArea, sender1: DirectoryDesignerRow) {
  if (!sender) { return; }
  let logic = new ApplicationPurchaseEquipmentLogic();

    await logic.sendCardDataMsg(sender);
}

/**
 * Событие после изменения значения в контроле "Дата с" и "Дата по"
 * @param sender контрол
 */
export async function ddApplicationPurchaseEquipment_onDataChanged(
    sender: DateTimePicker, 
    args: IDataChangedEventArgsEx<Date>) {
  if (!sender) { return; }
  let logic = new ApplicationPurchaseEquipmentLogic();
    await logic.checkChangeDate(sender);
}

/**
 * Событие во время сохранения карточки
 * @param layout разметка
 * @param args аргументы
 */
export async function ddApplicationPurchaseEquipment_cardSaving(layout: ILayout, args: CancelableEventArgs<ICardSavingEventArgs>) {
    if (!layout) { return; }
    
    let logic = new ApplicationPurchaseEquipmentLogic();

    if (!await logic.preSaveCheck(layout)) {
        args.cancel();
        return;
    }

    if (!await logic.savingConfirmed(layout)) {
        args.cancel();
        return;
    }

    args.wait();

    try {
        await logic.sendSavingMsg(layout);
        args.accept();
    } catch (error) {
        args.cancel(); // Отмена при ошибке
    }
}

/**
 * Событие после сохранения карточки
 * @param layout разметка
 */
export async function ddApplicationPurchaseEquipment_cardSaved(layout: Layout) {
	if (!layout) { return; }
	let logic = new ApplicationPurchaseEquipmentLogic();
    await logic.sendSavedMsg(layout);
}

/**
 * Событие после открытия карточки
 * @param layout разметка
 */
export async function ddApplicationPurchaseEquipment_cardOpened(layout: Layout) {
	if (!layout) { return; }
	let logic = new ApplicationPurchaseEquipmentLogic();
    await logic.updatePriceField(layout);
}

/**
 * Событие после изменения значения в контроле "Вид техники"
 * @param sender контрол
 */
export async function ddApplicationPurchaseEquipment_directoryDesignerRowTechType_onDataChanged(
    sender: DirectoryDesignerRow, 
    args: IDataChangedEventArgsEx<GenModels.DirectoryDesignerItem>) {
	if (!sender) { return; }
	let logic = new ApplicationPurchaseEquipmentLogic();
    await logic.updatePriceFieldByTypeCtrl(sender);
}

/**
 * Событие после изменения значения в контроле "Автор"
 * @param sender контрол
 */
export async function ddApplicationPurchaseEquipment_staffDirectoryItemsAuthor_onDataChanged(
    sender: StaffDirectoryItems, 
    args: IDataChangedEventArgsEx<GenModels.IDirectoryItemData>) {
	if (!sender) { return; }
	let logic = new ApplicationPurchaseEquipmentLogic();
    await logic.showEmployeeData(sender.layout, args.newValue);
}