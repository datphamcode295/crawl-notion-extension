let hasLoggedPublic = false;
let updateTimeout = null;
let lastEditTime = null;

function checkIfPublicPage() {
    if (hasLoggedPublic) return;

    // Look for the specific text pattern
    const elements = document.querySelectorAll('.tx-uiregular-14-med');
    
    for (const element of elements) {
        const text = element.textContent;
        if (text && text.includes('This page is live on') && text.includes('notion.site')) {
            console.log('this is public');
            hasLoggedPublic = true;
            return;
        }
    }
}

function handleContentChange() {
    // Clear existing timeout if there is one
    if (updateTimeout) {
        clearTimeout(updateTimeout);
    }

    lastEditTime = Date.now();

    // Set new timeout
    updateTimeout = setTimeout(() => {
        const timeSinceLastEdit = Date.now() - lastEditTime;
        if (timeSinceLastEdit >= 10000) { // 10 seconds
            console.log('content updated');
        }
    }, 10000);
}

// Wait for the page to be fully loaded
function waitForLoad() {
    const notionContent = document.querySelector('.notion-page-content');
    if (notionContent) {
        checkIfPublicPage();
        
        // Set up content change observer
        const contentObserver = new MutationObserver(handleContentChange);
        contentObserver.observe(notionContent, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true
        });
    } else {
        // If not loaded yet, wait and try again
        setTimeout(waitForLoad, 500);
    }
}

// Set up a MutationObserver to check when new content is loaded
const pageLoadObserver = new MutationObserver((mutations) => {
    waitForLoad();
});

// Start observing the document with the configured parameters
pageLoadObserver.observe(document.body, {
    childList: true,
    subtree: true
});

// Initial check
waitForLoad();