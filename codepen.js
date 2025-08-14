// 云端同步配置
const CLOUD_CONFIG = {
    binId: '689e4597d0ea881f40595b2b',
    apiKey: '$2a$10$c8N28a0QEXmQaJQ3HlZhQes8u9XIhy8vjHMmJ8UNmbt3dvfyuzZPC',
    url: 'https://api.jsonbin.io/v3/b/'
};

let tasks = [];
let currentFilter = 'all';
let currentTaskType = 'task';

// 获取本地日期
function getLocalDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 云端同步功能
async function saveTasks() {
    try {
        // 本地备份
        localStorage.setItem('desktopTasks', JSON.stringify(tasks));
        localStorage.setItem('mobileTasks', JSON.stringify(tasks));
        
        // 云端同步
        await saveToCloud(tasks);
        updateStats();
    } catch (error) {
        console.log('云端同步失败，已保存到本地', error);
        updateStats();
    }
}

// 保存到云端
async function saveToCloud(data) {
    const response = await fetch(CLOUD_CONFIG.url + CLOUD_CONFIG.binId, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': CLOUD_CONFIG.apiKey,
            'X-Bin-Versioning': 'false'
        },
        body: JSON.stringify({
            tasks: data,
            lastUpdated: new Date().toISOString(),
            source: 'mobile'
        })
    });
    
    if (!response.ok) {
        throw new Error('云端保存失败');
    }
}

// 从云端加载
async function loadTasks() {
    try {
        // 先尝试从云端加载
        const cloudData = await loadFromCloud();
        if (cloudData && cloudData.tasks && Array.isArray(cloudData.tasks)) {
            tasks = cloudData.tasks;
            console.log('已从云端加载数据');
            return;
        }
    } catch (error) {
        console.log('云端加载失败，尝试本地数据', error);
    }

    try {
        // 备选：从本地加载
        let saved = localStorage.getItem('mobileTasks') || 
                   localStorage.getItem('desktopTasks');
        
        if (saved) {
            const loadedTasks = JSON.parse(saved);
            if (Array.isArray(loadedTasks)) {
                tasks = loadedTasks;
                console.log('已从本地加载数据');
            }
        }
    } catch (error) {
        console.log('加载失败，使用空数据');
        tasks = [];
    }
}

// 从云端加载数据
async function loadFromCloud() {
    const response = await fetch(CLOUD_CONFIG.url + CLOUD_CONFIG.binId + '/latest', {
        method: 'GET',
        headers: {
            'X-Master-Key': CLOUD_CONFIG.apiKey
        }
    });
    
    if (!response.ok) {
        throw new Error('云端加载失败');
    }
    
    const result = await response.json();
    return result.record;
}

// 定期从云端同步
async function syncFromCloud() {
    try {
        const cloudData = await loadFromCloud();
        if (cloudData && cloudData.tasks && Array.isArray(cloudData.tasks)) {
            // 检查是否有更新
            const cloudTime = new Date(cloudData.lastUpdated);
            const localTime = new Date(localStorage.getItem('lastSyncTime') || '2000-01-01');
            
            if (cloudTime > localTime) {
                tasks = cloudData.tasks;
                renderTasks();
                updateStats();
                localStorage.setItem('lastSyncTime', cloudData.lastUpdated);
                console.log('已同步云端更新');
            }
        }
    } catch (error) {
        console.log('定期同步失败', error);
    }
}

window.onload = async function() {
    await loadTasks();
    renderTasks();
    updateStats();
    updateDate();
    
    const today = getLocalDate();
    document.getElementById('taskDate').value = today;
    document.getElementById('billDueDate').value = today;

    document.getElementById('taskInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    setInterval(updateDate, 1000);
    // 定期云端同步（每30秒检查一次）
    setInterval(syncFromCloud, 30000);
};

function updateDate() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit'
    };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('zh-CN', options);
}

function switchTaskType(type) {
    currentTaskType = type;
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    if (type === 'task') {
        document.getElementById('taskSection').style.display = 'block';
        document.getElementById('billSection').classList.remove('active');
    } else {
        document.getElementById('taskSection').style.display = 'none';
        document.getElementById('billSection').classList.add('active');
    }
}

function addTask() {
    const input = document.getElementById('taskInput');
    const dateInput = document.getElementById('taskDate');
    const reminderSelect = document.getElementById('reminderDays');
    
    if (!input.value.trim()) return;

    const task = {
        id: Date.now(),
        type: 'task',
        text: input.value.trim(),
        date: dateInput.value,
        reminderDays: parseInt(reminderSelect.value),
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(task);
    saveTasks();
    renderTasks();

    input.value = '';
    dateInput.value = getLocalDate();
    reminderSelect.value = '-1';
    input.focus();
}

function addBill() {
    const name = document.getElementById('billName').value.trim();
    const amount = document.getElementById('billAmount').value;
    const dueDate = document.getElementById('billDueDate').value;
    const reminderDays = parseInt(document.getElementById('billReminderDays').value);
    const recurring = document.getElementById('billRecurring').value;
    
    if (!name || !amount || !dueDate) {
        alert('请填写账单名称、金额和到期日期');
        return;
    }
    
    const bill = {
        id: Date.now(),
        type: 'bill',
        text: name,
        amount: parseFloat(amount),
        date: dueDate,
        reminderDays: reminderDays,
        recurring: recurring,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.unshift(bill);
    saveTasks();
    renderTasks();
    
    // 清空表单
    document.getElementById('billName').value = '';
    document.getElementById('billAmount').value = '';
    document.getElementById('billDueDate').value = getLocalDate();
    document.getElementById('billReminderDays').value = '3';
    document.getElementById('billRecurring').value = 'none';
    
    // 切换回普通任务
    switchTaskType('task');
    document.querySelector('.type-btn').click();
}

function renderTasks() {
    const container = document.getElementById('taskList');
    const filteredTasks = filterTasks();

    if (filteredTasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">${getEmptyIcon()}</div>
                <div class="message">${getEmptyMessage()}</div>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredTasks.map(task => {
        const isBill = task.type === 'bill';
        const countdown = getCountdown(task);
        
        return `
            <div class="task-item ${task.completed ? 'completed' : ''} ${isBill ? 'bill-item' : ''}" data-id="${task.id}">
                <div class="task-checkbox" onclick="toggleTask(${task.id})"></div>
                <div class="task-content">
                    <div class="task-text">${isBill ? '💳 ' : ''}${task.text}</div>
                    <div class="task-meta">
                        ${isBill && task.amount ? `<span class="bill-amount">¥${task.amount.toFixed(2)}</span>` : ''}
                        ${task.date ? `<span class="task-date">📅 ${formatDate(task.date)}</span>` : ''}
                        ${countdown}
                        ${isBill && task.recurring !== 'none' ? `<span style="font-size: 11px; color: #667eea;">🔄 ${task.recurring === 'monthly' ? '每月' : '每年'}</span>` : ''}
                    </div>
                </div>
                <button class="delete-btn" onclick="deleteTask(${task.id})">×</button>
            </div>
        `;
    }).join('');
}

function filterTasks() {
    const today = getLocalDate();
    
    switch(currentFilter) {
        case 'today':
            return tasks.filter(t => !t.completed && t.date === today);
        case 'ongoing':
            return tasks.filter(t => !t.completed);
        case 'bills':
            return tasks.filter(t => t.type === 'bill' && !t.completed);
        case 'overdue':
            return tasks.filter(t => !t.completed && t.date && t.date < today);
        case 'upcoming':
            return tasks.filter(t => !t.completed && t.date && t.date > today);
        case 'completed':
            return tasks.filter(t => t.completed);
        default:
            return tasks;
    }
}

function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    renderTasks();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        if (task.completed) {
            task.completedAt = new Date().toISOString();
            
            // 如果是重复账单，创建下一期
            if (task.type === 'bill' && task.recurring !== 'none') {
                createNextBill(task);
            }
        } else {
            delete task.completedAt;
        }
        saveTasks();
        renderTasks();
    }
}

function createNextBill(originalBill) {
    const nextDate = new Date(originalBill.date + 'T00:00:00');
    
    if (originalBill.recurring === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (originalBill.recurring === 'yearly') {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
    } else {
        return;
    }
    
    const year = nextDate.getFullYear();
    const month = String(nextDate.getMonth() + 1).padStart(2, '0');
    const day = String(nextDate.getDate()).padStart(2, '0');
    
    const nextBill = {
        ...originalBill,
        id: Date.now() + 1,
        date: `${year}-${month}-${day}`,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    delete nextBill.completedAt;
    tasks.unshift(nextBill);
}

function deleteTask(id) {
    if (confirm('确定删除这个任务吗？')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }
}

function clearCompleted() {
    if (confirm('清理所有已完成的任务？')) {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
    }
}

function getCountdown(task) {
    if (!task.date || task.completed) return '';
    
    const today = new Date();
    const taskDate = new Date(task.date + 'T00:00:00');
    
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    
    const diffTime = taskDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return `<span class="countdown overdue">逾期${Math.abs(diffDays)}天</span>`;
    } else if (diffDays === 0) {
        return `<span class="countdown today">今天截止</span>`;
    } else if (diffDays === 1) {
        return `<span class="countdown tomorrow">明天截止</span>`;
    } else if (diffDays <= 7) {
        return `<span class="countdown future">还有${diffDays}天</span>`;
    } else {
        return `<span class="countdown future">还有${diffDays}天</span>`;
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[date.getDay()];
    return `${month}月${day}日 周${weekday}`;
}

function updateStats() {
    const today = getLocalDate();
    const ongoing = tasks.filter(t => !t.completed).length;
    const bills = tasks.filter(t => t.type === 'bill' && !t.completed).length;
    const overdue = tasks.filter(t => !t.completed && t.date && t.date < today).length;
    const completed = tasks.filter(t => t.completed).length;
    
    document.getElementById('ongoingCount').textContent = ongoing;
    document.getElementById('billCount').textContent = bills;
    document.getElementById('overdueCount').textContent = overdue;
    document.getElementById('completedCount').textContent = completed;
}

function exportData() {
    const dataStr = JSON.stringify(tasks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `待办清单_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedTasks = JSON.parse(e.target.result);
            if (Array.isArray(importedTasks)) {
                if (confirm('是否合并导入的任务？\n选择"确定"合并，选择"取消"替换')) {
                    const existingIds = new Set(tasks.map(t => t.id));
                    const newTasks = importedTasks.filter(t => !existingIds.has(t.id));
                    tasks = [...tasks, ...newTasks];
                } else {
                    tasks = importedTasks;
                }
                saveTasks();
                renderTasks();
                alert('导入成功！');
            }
        } catch (error) {
            alert('导入失败，请检查文件格式');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function getEmptyIcon() {
    switch(currentFilter) {
        case 'today': return '☀️';
        case 'ongoing': return '🚀';
        case 'bills': return '💳';
        case 'overdue': return '⏰';
        case 'upcoming': return '📅';
        case 'completed': return '🎉';
        default: return '📝';
    }
}

function getEmptyMessage() {
    switch(currentFilter) {
        case 'today': return '今天没有任务，享受美好的一天！';
        case 'ongoing': return '没有进行中的任务';
        case 'bills': return '没有待付账单，财务状况良好！';
        case 'overdue': return '太棒了，没有逾期任务！';
        case 'upcoming': return '未来暂无安排';
        case 'completed': return '还没有完成的任务';
        default: return '暂无任务，开始添加吧！';
    }
}
