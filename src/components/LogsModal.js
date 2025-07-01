import firebaseService from '../services/firebaseService.js';

let logsModalContainer = null;
let currentLogsModal = null;

export function createLogsModal() {
  // Create modal container if it doesn't exist
  if (!logsModalContainer) {
    logsModalContainer = document.createElement('div');
    logsModalContainer.id = 'logs-modal-container';
    document.body.appendChild(logsModalContainer);
  }
}

export async function showLogsModal() {
  if (currentLogsModal) {
    closeLogsModal();
  }

  createLogsModal();

  // Show loading state first
  const loadingModal = document.createElement('div');
  loadingModal.className = 'logs-modal-overlay';
  loadingModal.innerHTML = `
    <div class="logs-modal">
      <div class="logs-header">
        <h2>📋 Medication Logs</h2>
        <button class="close-btn" id="close-logs-btn">✕</button>
      </div>
      <div class="logs-content">
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading medication logs...</p>
        </div>
      </div>
    </div>
  `;

  logsModalContainer.appendChild(loadingModal);
  currentLogsModal = loadingModal;

  // Set up close button
  loadingModal.querySelector('#close-logs-btn').addEventListener('click', closeLogsModal);

  try {
    // Fetch logs from Firebase
    const medicineIntakeLogs = await firebaseService.getMedicineIntakeLogs();
    const medicineStats = await firebaseService.getMedicineStats();
    
    // Replace loading modal with actual content
    displayLogsContent(medicineIntakeLogs, medicineStats);
  } catch (error) {
    console.error('Failed to load logs:', error);
    displayErrorState();
  }
}

function displayLogsContent(intakeLogs, stats) {
  if (!currentLogsModal) return;

  // Process and sort logs
  const processedLogs = processLogs(intakeLogs);
  
  const modal = document.createElement('div');
  modal.className = 'logs-modal-overlay';
  modal.innerHTML = `
    <div class="logs-modal">
      <div class="logs-header">
        <h2>📋 Medication Logs</h2>
        <button class="close-btn" id="close-logs-btn">✕</button>
      </div>
      
      <div class="logs-summary">
        ${generateStatsSummary(stats)}
      </div>
      
      <div class="logs-content">
        <div class="logs-filters">
          <button class="filter-btn active" data-filter="all">All</button>
          <button class="filter-btn" data-filter="SUCCESS">✅ Taken</button>
          <button class="filter-btn" data-filter="DISPENSING">🔄 Dispensing</button>
          <button class="filter-btn" data-filter="UNKNOWN">❓ Unknown</button>
        </div>
        
        <div class="logs-list" id="logs-list">
          ${generateLogsHTML(processedLogs)}
        </div>
        
        ${processedLogs.length === 0 ? '<div class="no-logs">No medication logs found.</div>' : ''}
      </div>
    </div>
  `;

  // Replace the loading modal
  logsModalContainer.removeChild(currentLogsModal);
  logsModalContainer.appendChild(modal);
  currentLogsModal = modal;

  // Set up event listeners
  setupLogsModalEvents(processedLogs);
}

function processLogs(intakeLogs) {
  if (!intakeLogs) return [];

  return Object.entries(intakeLogs)
    .map(([id, log]) => ({
      id,
      ...log,
      timestamp: parseInt(log.timestamp),
      displayStatus: getDisplayStatus(log.status)
    }))
    .sort((a, b) => b.timestamp - a.timestamp); // Most recent first
}

function getDisplayStatus(status) {
  switch (status) {
    case 'SUCCESS':
      return { icon: '✅', text: 'Taken', class: 'success' };
    case 'DISPENSING':
      return { icon: '🔄', text: 'Dispensing', class: 'dispensing' };
    default:
      return { icon: '❓', text: 'Unknown', class: 'unknown' };
  }
}

function generateStatsSummary(stats) {
  if (!stats) return '<div class="stats-summary">No statistics available</div>';

  const statsHTML = Object.entries(stats)
    .map(([medicine, data]) => `
      <div class="stat-item">
        <div class="stat-medicine">${medicine}</div>
        <div class="stat-count">${data.total_taken || 0} taken</div>
        <div class="stat-last">${data.last_taken_readable || 'Never'}</div>
      </div>
    `)
    .join('');

  return `
    <div class="stats-summary">
      <h3>📊 Summary</h3>
      <div class="stats-grid">
        ${statsHTML}
      </div>
    </div>
  `;
}

function generateLogsHTML(logs) {
  return logs
    .map(log => `
      <div class="log-entry" data-status="${log.status}">
        <div class="log-icon ${log.displayStatus.class}">
          ${log.displayStatus.icon}
        </div>
        <div class="log-details">
          <div class="log-medicine">${log.medicine}</div>
          <div class="log-status">${log.displayStatus.text}</div>
          <div class="log-time">${log.datetime_readable || formatTimestamp(log.timestamp)}</div>
        </div>
        <div class="log-meta">
          <div class="log-case">Case: ${log.case_code || 'N/A'}</div>
        </div>
      </div>
    `)
    .join('');
}

function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function setupLogsModalEvents(logs) {
  // Close button
  const closeBtn = currentLogsModal.querySelector('#close-logs-btn');
  closeBtn.addEventListener('click', closeLogsModal);

  // Filter buttons
  const filterBtns = currentLogsModal.querySelectorAll('.filter-btn');
  const logsList = currentLogsModal.querySelector('#logs-list');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active filter
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter logs
      const filter = btn.dataset.filter;
      const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.status === filter);
      
      // Update display
      logsList.innerHTML = generateLogsHTML(filteredLogs);
    });
  });

  // Click outside to close
  currentLogsModal.addEventListener('click', (e) => {
    if (e.target === currentLogsModal) {
      closeLogsModal();
    }
  });
}

function displayErrorState() {
  if (!currentLogsModal) return;

  const errorModal = document.createElement('div');
  errorModal.className = 'logs-modal-overlay';
  errorModal.innerHTML = `
    <div class="logs-modal">
      <div class="logs-header">
        <h2>📋 Medication Logs</h2>
        <button class="close-btn" id="close-logs-btn">✕</button>
      </div>
      <div class="logs-content">
        <div class="error-state">
          <div class="error-icon">❌</div>
          <p>Failed to load medication logs</p>
          <button class="retry-btn" id="retry-logs-btn">Try Again</button>
        </div>
      </div>
    </div>
  `;

  logsModalContainer.removeChild(currentLogsModal);
  logsModalContainer.appendChild(errorModal);
  currentLogsModal = errorModal;

  // Set up event listeners
  errorModal.querySelector('#close-logs-btn').addEventListener('click', closeLogsModal);
  errorModal.querySelector('#retry-logs-btn').addEventListener('click', showLogsModal);
}

export function closeLogsModal() {
  if (logsModalContainer && currentLogsModal) {
    logsModalContainer.removeChild(currentLogsModal);
    currentLogsModal = null;
  }
}

export function initializeLogsModal() {
  createLogsModal();
  
  // Add CSS styles if they don't exist
  if (!document.getElementById('logs-modal-styles')) {
    const style = document.createElement('style');
    style.id = 'logs-modal-styles';
    style.textContent = `
      .logs-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
      }
      
      .logs-modal {
        background: white;
        border-radius: 16px;
        padding: 0;
        max-width: 800px;
        width: 95%;
        max-height: 90vh;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease-out;
        display: flex;
        flex-direction: column;
      }
      
      .logs-header {
        padding: 20px 24px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f8f9fa;
      }
      
      .logs-header h2 {
        margin: 0;
        color: #333;
        font-size: 24px;
      }
      
      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 4px 8px;
        border-radius: 4px;
      }
      
      .close-btn:hover {
        background: #e9ecef;
        color: #333;
      }
      
      .logs-summary {
        padding: 16px 24px;
        background: #f8f9fa;
        border-bottom: 1px solid #eee;
      }
      
      .logs-summary h3 {
        margin: 0 0 12px 0;
        color: #333;
        font-size: 18px;
      }
      
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
      }
      
      .stat-item {
        background: white;
        padding: 12px;
        border-radius: 8px;
        border: 1px solid #e9ecef;
      }
      
      .stat-medicine {
        font-weight: bold;
        color: #2196F3;
        margin-bottom: 4px;
      }
      
      .stat-count {
        font-size: 14px;
        color: #666;
      }
      
      .stat-last {
        font-size: 12px;
        color: #999;
      }
      
      .logs-content {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      
      .logs-filters {
        padding: 16px 24px;
        display: flex;
        gap: 8px;
        background: white;
        border-bottom: 1px solid #eee;
      }
      
      .filter-btn {
        padding: 8px 16px;
        border: 1px solid #ddd;
        background: white;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
      }
      
      .filter-btn:hover {
        background: #f8f9fa;
      }
      
      .filter-btn.active {
        background: #2196F3;
        color: white;
        border-color: #2196F3;
      }
      
      .logs-list {
        flex: 1;
        overflow-y: auto;
        padding: 16px 24px;
      }
      
      .log-entry {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        margin-bottom: 8px;
        background: white;
        transition: all 0.2s ease;
      }
      
      .log-entry:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      .log-icon {
        font-size: 24px;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }
      
      .log-icon.success {
        background: #e8f5e8;
      }
      
      .log-icon.dispensing {
        background: #fff3cd;
      }
      
      .log-icon.unknown {
        background: #f8d7da;
      }
      
      .log-details {
        flex: 1;
      }
      
      .log-medicine {
        font-weight: bold;
        color: #333;
        font-size: 16px;
        margin-bottom: 4px;
      }
      
      .log-status {
        color: #666;
        font-size: 14px;
        margin-bottom: 2px;
      }
      
      .log-time {
        color: #999;
        font-size: 12px;
      }
      
      .log-meta {
        text-align: right;
      }
      
      .log-case {
        font-size: 12px;
        color: #999;
      }
      
      .loading-state, .error-state {
        text-align: center;
        padding: 60px 20px;
      }
      
      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #2196F3;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .error-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }
      
      .retry-btn {
        background: #2196F3;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        margin-top: 16px;
      }
      
      .retry-btn:hover {
        background: #1976D2;
      }
      
      .no-logs {
        text-align: center;
        padding: 60px 20px;
        color: #666;
        font-style: italic;
      }
    `;
    document.head.appendChild(style);
  }
} 