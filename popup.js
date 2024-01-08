website_config = [{
        "pattern": "youtube.com",
        "query": [
            "#secondary #playlist #items span.ytd-thumbnail-overlay-time-status-renderer"
        ]
    },
    {
        "pattern": "bilibili.com",
        "query": [
            "#multi_page div.duration",
            ".video-sections-item div.video-episode-card__info-duration",
        ]
    }
]

function calculateTotalTime(websiteConfig, webIndex) {
    let totalSeconds = 0;
    let queryStr = websiteConfig[webIndex]["query"];
    for (let i = 0; i < queryStr.length; i++) {
        const timeElements = document.querySelectorAll(queryStr[i]);

        timeElements.forEach((timeElement) => {
            const timeParts = timeElement.textContent.trim().split(':').map(Number);
            totalSeconds += timeParts.reduce((total, part, index) => total + part * Math.pow(60, timeParts.length - index - 1), 0);
        });

        videoCount = timeElements.length;
        if (totalSeconds > 0) {
            break;
        }
    }

    return { totalSeconds, videoCount };
}

function formatSeconds(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const paddedHours = String(hours).padStart(2, '0');
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
}

chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
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
            const totalTime = formatSeconds(totalSeconds);
            document.getElementById('totalTime').textContent = `Duration: ${totalTime}, Video: ${videoCount}`
        });
    } else {
        document.getElementById('totalTime').textContent = "Invalid";
    }
});