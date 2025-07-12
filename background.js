function createContextMenus() {
	chrome.contextMenus.removeAll(() => {
		chrome.storage.sync.get(
			["wiktionaryEnabled", "deeplEnabled", "deeplConfigurations"],
			(data) => {
				if (data.wiktionaryEnabled ?? true) {
					chrome.contextMenus.create({
						id: "wiktionarySearch",
						title: "Search Wiktionary for '%s'",
						contexts: ["selection"],
					});
				}
				if (data.deeplEnabled ?? true) {
					const deeplConfigurations = data.deeplConfigurations || [];

					console.log(deeplConfigurations);
					deeplConfigurations.forEach((pair) => {
						chrome.contextMenus.create({
							id: `deeplTranslate-${pair.source}-${pair.target}`,
							title: `Translate with DeepL (${pair.source.toUpperCase()} → ${pair.target.toUpperCase()})`,
							contexts: ["selection"],
						});
					});
				}
			}
		);
	});
}

// Create menu on install or update
chrome.runtime.onInstalled.addListener(createContextMenus);
chrome.runtime.onStartup.addListener(createContextMenus);

// Listen for settings change from options.js
chrome.runtime.onMessage.addListener((message) => {
	if (message.action === "updateMenus") {
		createContextMenus();
	}
});

// Handle clicks
chrome.contextMenus.onClicked.addListener((info) => {
	if (info.menuItemId === "wiktionarySearch") {
		const query = encodeURIComponent(info.selectionText);
		chrome.tabs.create({ url: `https://en.wiktionary.org/wiki/${query}` });
	}
	if (info.menuItemId === "deeplTranslate") {
		const query = encodeURIComponent(info.selectionText);
		chrome.storage.sync.get(["sourceLanguage", "targetLanguage"], (data) => {
			const sourceLanguage = data.sourceLanguage || "de";
			const targetLanguage = data.targetLanguage || "en";
			chrome.tabs.create({
				url: `https://www.deepl.com/en/translator#${sourceLanguage.toLowerCase()}/${targetLanguage.toLowerCase()}/${query}`,
			});
		});
	}
});
