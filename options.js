import { sourceLanguageList, targetLanguageList } from "./deepl-languages.js";

const wiktionaryToggle = document.getElementById("wiktionaryToggle");
const deeplToggle = document.getElementById("deeplToggle");
const addConfigButton = document.getElementById("addConfig");
const deeplConfigContainer = document.getElementById("deeplConfigContainer");
const saveButton = document.getElementById("save");

// Load saved selections from chrome.storage
chrome.storage.sync.get(
	["wiktionaryEnabled", "deeplEnabled", "deeplConfigurations"],
	(data) => {
		wiktionaryToggle.checked = data.wiktionaryEnabled ?? true;
		deeplToggle.checked = data.deeplEnabled ?? true;

		const pairs = data.deeplConfigurations ?? [{ source: "de", target: "en" }];
		pairs.forEach((pair) => createTranslationPair(pair.source, pair.target));
	}
);

function createLanguageOptionElement(langList, selectedValue) {
	const select = document.createElement("select");
	langList.forEach((lang) => {
		const option = document.createElement("option");
		option.value = lang.displayNameShortLanguage;
		option.textContent = lang.displayName;
		if (lang.displayNameShortLanguage === selectedValue) {
			option.selected = true;
		}
		select.appendChild(option);
	});
	return select;
}

function createTranslationPair(sourceLang = "de", targetLang = "en") {
	const wrapper = document.createElement("div");
	wrapper.className = "translation-pair";

	const sourceLabel = document.createElement("label");
	sourceLabel.textContent = "Source: ";
	const sourceSelect = createLanguageOptionElement(
		sourceLanguageList,
		sourceLang
	);
	sourceSelect.className = "sourceLanguage";
	sourceLabel.appendChild(sourceSelect);

	const targetLabel = document.createElement("label");
	targetLabel.textContent = " Target: ";
	const targetSelect = createLanguageOptionElement(
		targetLanguageList,
		targetLang
	);
	targetSelect.className = "targetLanguage";
	targetLabel.appendChild(targetSelect);

	const removeButton = document.createElement("button");
	removeButton.textContent = "Remove";
	removeButton.className = "removePair";
	removeButton.addEventListener("click", () => {
		deeplConfigContainer.removeChild(wrapper);
	});

	wrapper.appendChild(sourceLabel);
	wrapper.appendChild(targetLabel);
	wrapper.appendChild(removeButton);

	deeplConfigContainer.appendChild(wrapper);
}

// Add a new row for deepl configurations
addConfigButton.addEventListener("click", () => {
	createTranslationPair();
});

// Save selected languages to chrome.storage
saveButton.addEventListener("click", () => {
	const pairElements =
		deeplConfigContainer.getElementsByClassName("translation-pair");
	const deeplConfigurations = Array.from(pairElements).map((el) => {
		return {
			source: el.querySelector(".sourceLanguage").value,
			target: el.querySelector(".targetLanguage").value,
		};
	});

	chrome.storage.sync.set(
		{
			wiktionaryEnabled: wiktionaryToggle.checked,
			deeplEnabled: deeplToggle.checked,
			deeplConfigurations: deeplConfigurations,
		},
		() => {
			alert("Languages saved! Right-click menu will update.");
			chrome.runtime.sendMessage({ action: "updateMenus" }); // Notify background script
		}
	);
});
