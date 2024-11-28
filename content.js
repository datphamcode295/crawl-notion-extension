// Inject the interceptor script first
(function injectScript() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('inject.js');
  script.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
})();

// Global state
let notionResponse = null;
let notionResponseURL = '';
let notionResponseWorkspaceName = '';
let pageInitialized = false;
let lastUrl = '';
let isPageLoaded = false;

// Start watching for Notion response immediately
function startNotionResponseWatcher() {
  console.log('Starting Notion response watcher...');

  window.addEventListener('message', function messageListener(event) {
    if (event.data.type === 'notionDataCaptured') {
      if (notionResponseURL !== event.data.detail.url || !notionResponse) {
        notionResponseURL = event.data.detail.url;
        notionResponse = event.data.detail.data;
        notionResponseWorkspaceName = event.data.detail.workspaceName;
      }
    }
  });
}

// Initialize the main process
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

function initialize() {
  // Start watching for Notion response immediately
  startNotionResponseWatcher();

  // Set up observer for page changes
  const pageLoadObserver = new MutationObserver(handlePageChanges);

  // Start observing the document with the configured parameters
  pageLoadObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Start the initial page processing
  startPageProcessing();
}

async function startPageProcessing() {
  try {
    // Wait for the page to be fully loaded
    console.log('Waiting for page load...');
    await waitForPageLoad();

    isPageLoaded = true;

    await waitForNotionResponse();

    // If we already have the Notion response, process the content
    if (notionResponse && !pageInitialized) {
      const markdown = await processContent();

      // Send the processed content to the server
      if (markdown) {
        await sendToServer(markdown);
      }
    }
  } catch (error) {
    console.error('Error in page processing:', error);
  }
}

async function handlePageChanges(mutations) {
  const currentUrl = location.href;

  if (currentUrl !== lastUrl) {
    console.log('URL changed, reinitializing...');
    lastUrl = currentUrl;
    pageInitialized = false;
    isPageLoaded = false;

    await startPageProcessing();
  }
}

function waitForNotionResponse() {
  return new Promise((resolve, reject) => {
    console.log('Waiting for Notion response...');

    // Resolve immediately if conditions are met
    if (notionResponse && notionResponseURL === lastUrl) {
      resolve();
      return;
    }

    const MAX_WAIT_TIME = 30000; // 30 seconds timeout
    const CHECK_INTERVAL = 100; // Check every 100ms
    const startTime = Date.now();

    const checkNotion = setInterval(() => {
      if (notionResponse && notionResponseURL === lastUrl) {
        clearInterval(checkNotion);
        resolve();
      } else if (Date.now() - startTime > MAX_WAIT_TIME) {
        clearInterval(checkNotion);
        reject(new Error('Timeout waiting for Notion response'));
      }
    }, CHECK_INTERVAL);
  });
}

function waitForPageLoad() {
  return new Promise((resolve, reject) => {
    const maxAttempts = 30;
    let attempts = 0;

    function checkPageLoad() {
      const notionContent = document.querySelector('.notion-page-content');
      const notionTopBar = document.querySelector('.notion-topbar');
      const isDocumentLoaded = document.readyState === 'complete';

      if (notionContent && notionTopBar && isDocumentLoaded) {
        console.log('Page elements found and document loaded');
        resolve();
      } else if (attempts >= maxAttempts) {
        const missing = [];
        if (!notionContent) missing.push('notion-page-content');
        if (!notionTopBar) missing.push('notion-topbar');
        if (!isDocumentLoaded) missing.push('document complete');
        reject(
          new Error(
            `Timeout waiting for page elements. Missing: ${missing.join(', ')}`
          )
        );
      } else {
        attempts++;
        console.log(`Checking page load attempt ${attempts}/${maxAttempts}...`);
        setTimeout(checkPageLoad, 500);
      }
    }

    checkPageLoad();
  });
}

async function processContent() {
  try {
    if (!pageInitialized) {
      const isPublic = await checkIfPublicPage();
      if (isPublic) {
        console.log('Processing public page...');
        const markdown = processElements();

        pageInitialized = true;

        return markdown;
      } else {
        console.log('Page is not public');
      }
    }
  } catch (error) {
    console.error('Error processing content:', error);
    pageInitialized = false; // Reset on error to allow retry
  }
}

function checkIfPublicPage() {
  return new Promise((resolve) => {
    const maxAttempts = 20;
    let attempts = 0;

    function check() {
      const elements = document.querySelectorAll('.tx-uiregular-14-med');

      for (const element of elements) {
        const text = element.textContent;
        if (
          text &&
          text.includes('This page is live on') &&
          text.includes('notion.site')
        ) {
          console.log('Found public page indicator');
          resolve(true);
          return;
        }
      }

      if (attempts >= maxAttempts) {
        console.log('No public page indicator found after max attempts');
        resolve(false);
      } else {
        attempts++;
        setTimeout(check, 500);
      }
    }

    check();
  });
}

function processElements() {
  const elements = document.querySelectorAll('[data-block-id]');

  const elementMarkdown = [];

  const title = extractNotionTitle(location.href);

  elementMarkdown.push(`# ${title}`);

  for (const element of elements) {
    const markdown = elementToMarkdown(element);
    if (markdown) {
      elementMarkdown.push(markdown);
    }
  }
  return elementMarkdown.join('\n\n');
}

// Keep your existing elementToMarkdown, processingBulletList,
// processingCodeBlock, and other helper functions here...

function elementToMarkdown(element) {
  const classToMarkdown = {
    'notion-header-block': () => `# ${element.textContent}`,
    'notion-sub_header-block': () => `## ${element.textContent}`,
    'notion-sub_sub_header-block': () => `### ${element.textContent}`,
    'notion-table-tbody-selectable': () =>
      htmlTableToMardownTable(element.innerHTML),
    'notion-bulleted_list-block': () => processingBulletList(element),
    'notion-numbered_list-block': () => `1. ${element.textContent}`,
    'notion-to_do-block': () => `- [ ] ${element.textContent}`,
    'notion-to_do-block-checked': () => `- [x] ${element.textContent}`,
    'notion-text-block': () => element.textContent,
    'notion-code-block': () => processingCodeBlock(element),
    'notion-quote-block': () => `> ${element.textContent}`,
    'notion-toggle-block': () => `> ${element.textContent}`,
    'notion-callout-block': () => `> ${element.textContent}`,
    'notion-divider-block': () => '---',
    'notion-equation-block': () => `$${element.textContent}$`,
    'notion-image-block': () => `![${element.textContent}](${element.src})`,
    'notion-video-block': () => `[![Video](${element.src})](${element.src})`,
    'notion-embed-block': () => `[![Embed](${element.src})](${element.src})`,
    'notion-file-block': () => `[![File](${element.src})](${element.src})`,
    'notion-pdf-block': () => `[![PDF](${element.src})](${element.src})`,
    'notion-bookmark-block': () =>
      `[![Bookmark](${element.src})](${element.src})`,
    'notion-link-preview-block': () =>
      `[![Link Preview](${element.src})](${element.src})`,
    'notion-tweet-block': () => `[![Tweet](${element.src})](${element.src})`,
    'notion-gist-block': () => `[![Gist](${element.src})](${element.src})`,
  };

  for (const [className, converter] of Object.entries(classToMarkdown)) {
    if (element.classList.contains(className)) {
      return converter();
    }
  }
  return '';
}

function processingBulletList(element) {
  const blockID = element.dataset.blockId;
  const bulletedBlock = notionResponse?.recordMap?.block[blockID];
  let bullet = '';
  if (bulletedBlock) {
    const value = bulletedBlock.value?.value ?? bulletedBlock.value;
    if (value.properties) {
      bullet = value.properties.title[0][0];
      return `- ${bullet}`;
    }
  }
  return '- ' + element.textContent;
}

function processingCodeBlock(element) {
  const blockID = element.dataset.blockId;
  const codeBlock = notionResponse?.recordMap?.block[blockID];
  let code = '';
  if (codeBlock) {
    const value = codeBlock.value?.value ?? codeBlock.value;
    if (value.properties) {
      code = value.properties.title[0][0];
      return '```\n' + code + '\n```';
    }
  }
  return element.textContent;
}

function cleanCellContent(text) {
  return text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
}

function htmlTableToMardownTable(htmlContent) {
  const container = document.createElement('div');
  container.innerHTML = htmlContent;

  const tables = container.getElementsByTagName('table');
  const markdownOutput = [];

  for (const table of tables) {
    const rows = table.getElementsByTagName('tr');
    const markdownRows = [];
    const maxColumnWidths = [];

    for (let i = 0; i < rows.length; i++) {
      const cells = [
        ...rows[i].getElementsByTagName('th'),
        ...rows[i].getElementsByTagName('td'),
      ];
      const markdownCells = cells.map((cell) => {
        let content = cleanCellContent(cell.textContent);
        const links = cell.getElementsByTagName('a');
        if (links.length > 0) {
          for (const link of links) {
            const text = cleanCellContent(link.textContent);
            const href = link.getAttribute('href');
            content = content.replace(text, `[${text}](${href})`);
          }
        }
        return content;
      });

      markdownCells.forEach((cell, index) => {
        maxColumnWidths[index] = Math.max(
          maxColumnWidths[index] || 0,
          cell.length
        );
      });

      markdownRows.push(markdownCells);
    }

    markdownRows.forEach((row, rowIndex) => {
      const formattedRow = row
        .map((cell, cellIndex) => cell.padEnd(maxColumnWidths[cellIndex], ' '))
        .join(' | ');

      markdownOutput.push(`| ${formattedRow} |`);

      if (rowIndex === 0) {
        const separator = maxColumnWidths
          .map((width) => '-'.repeat(width))
          .join(' | ');
        markdownOutput.push(`| ${separator} |`);
      }
    });

    markdownOutput.push('');
    markdownOutput.push('');
  }

  return markdownOutput.join('\n').replace(/\n+$/, '\n');
}

function extractNotionTitle(url) {
  try {
    const pathname = new URL(url).pathname;
    // Split the pathname by '/' and get the last segment
    const lastSegment = pathname.split('/').pop();

    // If there's a hex string at the end (32 chars), remove it
    const titleWithHex = lastSegment.split('-');
    if (titleWithHex[titleWithHex.length - 1].length === 32) {
      titleWithHex.pop();
    }

    // Join remaining parts and replace hyphens with spaces
    const title = titleWithHex.join('-').replace(/-/g, ' ');

    return title;
  } catch (error) {
    return null;
  }
}

async function sendToServer(markdownData) {
  // Get the current URL and page title
  const pageUrl = window.location.href;

  // Prepare the payload
  const payload = {
    url: pageUrl,
    data: markdownData,
    workspaceName: notionResponseWorkspaceName,
  };

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'sendMarkdown',
      payload: payload,
    });
    return response;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
}
