website_config = [
    {
        "pattern": "youtube.com",
        "query": "#secondary #playlist #items span.ytd-thumbnail-overlay-time-status-renderer"
    },
    {   "pattern": "bilibili.com",
        "query": "#multi_page div.duration"
    }
]

function calculateTotalTime(websiteConfig, webIndex) {
    var web_index = arguments[0];
    let totalSeconds = 0;
    let queryStr =  websiteConfig[webIndex]["query"];
    const timeElements = document.querySelectorAll(queryStr);

    timeElements.forEach((timeElement) => {
      const timeParts = timeElement.textContent.trim().split(':').map(Number);
      totalSeconds += timeParts.reduce((total, part, index) => total + part * Math.pow(60, timeParts.length - index - 1), 0);
    });
    videoCount = timeElements.length;
    return {totalSeconds, videoCount};
}

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    var webIndex = website_config.findIndex(config => activeTab.url.includes(config.pattern));
    if (webIndex !== -1) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: calculateTotalTime,
            args: [website_config, webIndex]
        }, function(results) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                return;
            }
            const { totalSeconds, videoCount } = results[0].result;
            const totalTime = new Date(totalSeconds * 1000).toISOString().substr(11, 8);
            document.getElementById('totalTime').textContent = `Duration: ${totalTime}, Video: ${videoCount}`
        });
    } else {
        document.getElementById('totalTime').textContent = "Invalid";
    }
});