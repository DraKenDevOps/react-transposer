import type { Message } from "../types";

export function sendMessageToContentScript(tabId: number, message: Message): void {
    chrome.tabs.sendMessage(tabId, message).catch(() => {});
}

export function sendMessageToPopup(tabId: number, message: Message): void {
    chrome.tabs.sendMessage(tabId, message).catch(() => {});
}
