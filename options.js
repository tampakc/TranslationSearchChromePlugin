import { sourceLanguageList, targetLanguageList } from "./deepl-languages.js";

const wiktionaryToggle = document.getElementById("wiktionaryToggle");
const deeplToggle = document.getElementById("deeplToggle");
const sourceLanguageSelect = document.getElementById("sourceLanguage");
const targetLanguageSelect = document.getElementById("targetLanguage");
const saveButton = document.getElementById("save");

// Populate dropdowns with language options
sourceLanguageList.forEach((lang) => {
	const optionSource = document.createElement("option");
	optionSource.value = lang.displayNameShortLanguage;
	optionSource.text = lang.displayName;
	sourceLanguageSelect.appendChild(optionSource);
});

targetLanguageList.forEach((lang) => {
	const optionTarget = document.createElement("option");
	optionTarget.value = lang.displayNameShortLanguage;
	optionTarget.text = lang.displayName;
	targetLanguageSelect.appendChild(optionTarget);
});

// Load saved selections from chrome.storage
chrome.storage.sync.get(
	["wiktionaryEnabled", "deeplEnabled", "sourceLanguage", "targetLanguage"],
	(data) => {
		wiktionaryToggle.checked = data.wiktionaryEnabled ?? true;
		deeplToggle.checked = data.deeplEnabled ?? true;
		sourceLanguageSelect.value = data.sourceLanguage || "de";
		targetLanguageSelect.value = data.targetLanguage || "en";
	}
);

// Save selected languages to chrome.storage
saveButton.addEventListener("click", () => {
	chrome.storage.sync.set(
		{
			wiktionaryEnabled: wiktionaryToggle.checked,
			deeplEnabled: deeplToggle.checked,
			sourceLanguage: sourceLanguageSelect.value,
			targetLanguage: targetLanguageSelect.value,
		},
		() => {
			alert("Languages saved! Right-click menu will update.");
			chrome.runtime.sendMessage({ action: "updateMenus" }); // Notify background script
		}
	);
});
