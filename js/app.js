// ============ 炉型参数数据库 ============

const furnaceParameters = {
    '150': {
        name: '150t转炉',
        inputSi: 38.06,        // ×10-2％
        inputMn: 27.86,        // ×10-2％
        inputP: 143.15,        // ×10-3％
        inputS: 8.04,          // ×10-3％
        ironTemp: 1349.68,     // ℃
        stopC: 4.32,           // ×10-2％
        stopMn: 8.98,          // ×10-2％
        stopP: 15.27,          // ×10-3％
        stopS: 11.47,          // ×10-3％
        stopTFe: 18.26,        // %
        reblowRate: 1.80,      // %
        coProduct: 2014.16     // 0.01%*PPm
    },
    '250': {
        name: '250t转炉',
        inputSi: 36.28,        // ×10-2％
        inputMn: 28.20,        // ×10-2％
        inputP: 138.97,        // ×10-3％
        inputS: 7.62,          // ×10-3％
        ironTemp: 1372.39,     // ℃
        stopC: 5.11,           // ×10-2％
        stopMn: 10.52,         // ×10-2％
        stopP: 19.14,          // ×10-3％
        stopS: 11.85,          // ×10-3％
        stopTFe: 16.61,        // %
        reblowRate: 1.17,      // %
        coProduct: 2238.84     // 0.01%*PPm
    }
};

let currentFurnaceType = '150';

// ============ 炉型切换函数 ============

function updateFurnaceType() {
    const furnaceType = document.getElementById('furnaceTypeSelect').value;
    currentFurnaceType = furnaceType;
    const params = furnaceParameters[furnaceType];
    
    // 更新顶部显示
    document.getElementById('ironTemp').textContent = params.ironTemp.toFixed(1) + '°C';
    document.getElementById('inputSi').textContent = (params.inputSi / 100).toFixed(2) + '%';
    document.getElementById('inputMn').textContent = (params.inputMn / 100).toFixed(2) + '%';
    document.getElementById('inputP').textContent = params.inputP.toFixed(0) + '‰';
    document.getElementById('inputS').textContent = (params.inputS).toFixed(1) + '‰';
    
    // 更新预测值（基于停吹参数，添加一些随机波动）
    document.getElementById('predTemp').textContent = (1640 + Math.random() * 20).toFixed(0) + '°C';
    document.getElementById('predCarbon').textContent = (params.stopC / 100).toFixed(3) + '%';
    document.getElementById('predPhosphorus').textContent = (params.stopP).toFixed(1) + '‰';
    document.getElementById('predMn').textContent = (params.stopMn / 100).toFixed(3) + '%';
    document.getElementById('predS').textContent = (params.stopS).toFixed(1) + '‰';
    document.getElementById('predTFe').textContent = params.stopTFe.toFixed(1) + '%';
    document.getElementById('predCO').textContent = params.coProduct.toFixed(0);
    document.getElementById('predReblow').textContent = params.reblowRate.toFixed(1) + '%';
    
    // 更新炉次列表
    const furnaceSelect = document.getElementById('furnaceSelect');
    furnaceSelect.innerHTML = '';
    if (furnaceType === '150') {
        furnaceSelect.innerHTML = `
            <option>150t-3#炉 - 20251031-001</option>
            <option>150t-3#炉 - 20251031-002</option>
            <option>150t-3#炉 - 20251030-015</option>
            <option>150t-3#炉 - 20251030-014</option>
        `;
    } else {
        furnaceSelect.innerHTML = `
            <option>250t-1#炉 - 20251031-003</option>
            <option>250t-1#炉 - 20251031-004</option>
            <option>250t-1#炉 - 20251030-012</option>
            <option>250t-1#炉 - 20251030-011</option>
        `;
    }
    
    // 更新底部信息
    document.getElementById('footerFurnaceType').textContent = params.name;
    document.getElementById('footerOnlineMAE').textContent = 
        `温度±${(3.8 + Math.random() * 0.6).toFixed(1)}°C | 再吹率${params.reblowRate.toFixed(1)}%`;
    
    // 更新时间轴兑铁信息
    document.getElementById('timelineIronInfo').textContent = 
        `铁水量: ${furnaceType}t, 温度: ${params.ironTemp.toFixed(1)}°C, Si: ${(params.inputSi/100).toFixed(2)}%, Mn: ${(params.inputMn/100).toFixed(2)}%`;
    
    showNotification('炉型切换', '已切换至 ' + params.name + '，所有参数已更新', 'success');
}

function updateFurnaceData() {
    const selectedFurnace = document.getElementById('furnaceSelect').value;
    showNotification('炉次切换', '已切换至炉次: ' + selectedFurnace, 'info');
    
    // 随机调整参数模拟不同炉次
    const params = furnaceParameters[currentFurnaceType];
    const variation = 0.95 + Math.random() * 0.1; // ±5%变化
    
    document.getElementById('ironTemp').textContent = (params.ironTemp * variation).toFixed(1) + '°C';
    document.getElementById('inputSi').textContent = ((params.inputSi / 100) * variation).toFixed(2) + '%';
}

// ============ 图表初始化 ============

// 时间序列图表
const timeSeriesCtx = document.getElementById('timeSeriesChart').getContext('2d');
let timeSeriesData = generateTimeSeriesData();
const timeSeriesChart = new Chart(timeSeriesCtx, {
    type: 'line',
    data: {
        labels: timeSeriesData.labels,
        datasets: [{
            label: '氧流量',
            data: timeSeriesData.oxygen,
            borderColor: '#2a5298',
            backgroundColor: 'rgba(42, 82, 152, 0.1)',
            tension: 0.4,
            fill: true
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: false
            }
        }
    }
});

// 热力图（用折线图模拟多变量）
const heatMapCtx = document.getElementById('heatMapChart').getContext('2d');
const heatMapChart = new Chart(heatMapCtx, {
    type: 'line',
    data: {
        labels: timeSeriesData.labels,
        datasets: [
            {
                label: '温度 (°C)',
                data: timeSeriesData.temperature,
                borderColor: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            },
            {
                label: '碳含量 (%)',
                data: timeSeriesData.carbon,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                yAxisID: 'y1',
                tension: 0.4
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: '温度 (°C)'
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: '碳含量 (%)'
                },
                grid: {
                    drawOnChartArea: false
                }
            }
        }
    }
});

// 对比图表
const comparisonCtx = document.getElementById('comparisonChart').getContext('2d');
const comparisonChart = new Chart(comparisonCtx, {
    type: 'line',
    data: {
        labels: timeSeriesData.labels,
        datasets: [
            {
                label: '当前炉次',
                data: timeSeriesData.oxygen,
                borderColor: '#2a5298',
                backgroundColor: 'rgba(42, 82, 152, 0.1)',
                tension: 0.4
            },
            {
                label: 'ML建议曲线',
                data: timeSeriesData.oxygen.map(v => v * 0.95),
                borderColor: '#4CAF50',
                borderDash: [5, 5],
                tension: 0.4,
                fill: false
            },
            {
                label: '对比炉次',
                data: timeSeriesData.oxygen.map(v => v * 1.05),
                borderColor: '#ff9800',
                tension: 0.4,
                fill: false
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true
            }
        }
    }
});

// ============ 数据生成函数 ============

function generateTimeSeriesData() {
    const labels = [];
    const data = {
        oxygen: [],
        oxygenIntensity: [],
        lance: [],
        lanceAngle: [],
        temperature: [],
        carbon: [],
        oxygen_content: [],
        slagLevel: [],
        foamIndex: [],
        slagBasicity: [],
        co: [],
        co2: [],
        gasFlow: [],
        pressure: [],
        furnaceAngle: [],
        bottomBlowing: []
    };
    
    for (let i = 0; i <= 70; i++) {
        labels.push(i);
        
        // 氧枪参数
        const oxygenFlow = 28000 - i * 80 + Math.random() * 1000;
        data.oxygen.push(oxygenFlow);
        data.oxygenIntensity.push(oxygenFlow / 150 + Math.random() * 5); // Nm³/t·min
        data.lance.push(1800 - i * 5 + Math.random() * 50);
        data.lanceAngle.push(15 + Math.random() * 3); // 枪位角度
        
        // 温度与成分
        data.temperature.push(1380 + i * 4 + Math.random() * 10);
        data.carbon.push(0.8 - i * 0.01 + Math.random() * 0.02);
        data.oxygen_content.push(400 + i * 5 + Math.random() * 50); // ppm
        
        // 渣况与液面
        data.slagLevel.push(800 + Math.sin(i * 0.1) * 100 + Math.random() * 30);
        data.foamIndex.push(2.5 + Math.sin(i * 0.15) * 0.8 + Math.random() * 0.3);
        data.slagBasicity.push(3.0 + Math.random() * 0.4);
        
        // 烟气分析
        const coRatio = 25 - i * 0.2 + Math.random() * 3;
        data.co.push(coRatio);
        data.co2.push(15 + i * 0.1 + Math.random() * 2);
        data.gasFlow.push(180000 + Math.random() * 20000);
        
        // 设备状态
        data.pressure.push(0.6 + Math.random() * 0.1);
        data.furnaceAngle.push(2 + Math.random() * 0.5);
        data.bottomBlowing.push(80 + Math.random() * 20);
    }
    
    return { labels, ...data };
}

// ============ 变量切换 ============

document.getElementById('variableSelect').addEventListener('change', function(e) {
    const variable = e.target.value;
    let data, label, color;
    
    const variableConfig = {
        'oxygen': { label: '氧流量 (Nm³/min)', color: '#2a5298' },
        'oxygenIntensity': { label: '供氧强度 (Nm³/t·min)', color: '#1e88e5' },
        'lance': { label: '枪位高度 (mm)', color: '#43a047' },
        'lanceAngle': { label: '枪位角度 (°)', color: '#66bb6a' },
        'temperature': { label: '钢水温度 (°C)', color: '#f44336' },
        'carbon': { label: '碳含量[C] (%)', color: '#ff9800' },
        'oxygen_content': { label: '氧活性/氧含量 (ppm)', color: '#e91e63' },
        'slagLevel': { label: '渣位高度 (mm)', color: '#9c27b0' },
        'foamIndex': { label: '泡沫指数', color: '#ab47bc' },
        'slagBasicity': { label: '渣碱度 (CaO/SiO₂)', color: '#ba68c8' },
        'co': { label: '烟气CO浓度 (%)', color: '#ff5722' },
        'co2': { label: '烟气CO₂浓度 (%)', color: '#ff7043' },
        'gasFlow': { label: '烟气流量 (Nm³/h)', color: '#ff8a65' },
        'pressure': { label: '顶压 (MPa)', color: '#00bcd4' },
        'furnaceAngle': { label: '炉倾角 (°)', color: '#26c6da' },
        'bottomBlowing': { label: '底吹流量 (Nm³/min)', color: '#4dd0e1' }
    };
    
    const config = variableConfig[variable];
    data = timeSeriesData[variable];
    label = config.label;
    color = config.color;
    
    timeSeriesChart.data.datasets[0].data = data;
    timeSeriesChart.data.datasets[0].label = label;
    timeSeriesChart.data.datasets[0].borderColor = color;
    timeSeriesChart.data.datasets[0].backgroundColor = color + '20'; // 添加透明度
    timeSeriesChart.update();
});

// ============ 回放控制 ============

let isPlaying = false;
let playInterval;

function replayControl(action) {
    const slider = document.getElementById('replaySlider');
    const playBtn = document.getElementById('playBtn');
    
    if (action === 'play') {
        if (!isPlaying) {
            isPlaying = true;
            playBtn.textContent = '⏸';
            playInterval = setInterval(() => {
                let value = parseInt(slider.value);
                if (value >= 100) {
                    replayControl('play'); // 停止
                } else {
                    slider.value = value + 1;
                    updateReplayTime();
                }
            }, 200);
        } else {
            isPlaying = false;
            playBtn.textContent = '▶';
            clearInterval(playInterval);
        }
    } else if (action === 'forward') {
        slider.value = Math.min(100, parseInt(slider.value) + 5);
        updateReplayTime();
    } else if (action === 'backward') {
        slider.value = Math.max(0, parseInt(slider.value) - 5);
        updateReplayTime();
    }
}

function updateReplayTime() {
    const slider = document.getElementById('replaySlider');
    const value = parseInt(slider.value);
    const minutes = Math.floor(value * 70 / 100);
    const time = `${Math.floor(10 + minutes / 60)}:${String((32 + minutes) % 60).padStart(2, '0')}`;
    document.getElementById('replayTime').textContent = time;
}

document.getElementById('replaySlider').addEventListener('input', updateReplayTime);

// ============ 建议操作 ============

const suggestionActions = {
    1: { action: '降低氧流量至 22000 Nm³/min', type: '氧枪控制' },
    2: { action: '提升氧枪枪位至 1650mm', type: '枪位调整' },
    3: { action: '补加石灰 500kg', type: '造渣操作' },
    4: { action: '增大底吹流量至 95 Nm³/min', type: '底吹控制' },
    5: { action: '调整炉倾角至 2.5°', type: '设备调整' },
    6: { action: '降低枪位50mm + 投入消泡剂200kg', type: '泡沫控制' }
};

function adoptSuggestion(id) {
    const suggestion = suggestionActions[id];
    const confirmMsg = `确认采纳建议 #${id}？\n\n` +
                     `操作类型：${suggestion.type}\n` +
                     `具体操作：${suggestion.action}\n\n` +
                     `此操作将向DCS系统下达控制指令，需要二次确认。`;
    
    if (confirm(confirmMsg)) {
        // 模拟密码验证
        const password = prompt('请输入操作密码（演示用，输入任意内容）：');
        if (password) {
            showNotification(
                '✓ 建议已采纳', 
                `${suggestion.type} - ${suggestion.action}\n已成功下达至DCS系统执行`, 
                'success'
            );
            
            // 视觉反馈：建议卡片变灰
            const card = document.getElementById('suggestion' + id);
            if (card) {
                card.style.opacity = '0.5';
                card.style.borderLeftColor = '#00aa44';
                card.style.boxShadow = '0 2px 10px rgba(0,170,68,0.2)';
                setTimeout(() => {
                    card.querySelector('.suggestion-action').innerHTML += 
                        ' <span style="color: #00aa44; font-size: 11px;">✓ 已执行</span>';
                }, 300);
            }
        }
    }
}

function adjustSuggestion(id) {
    const suggestion = suggestionActions[id];
    let promptMsg = '';
    let defaultValue = '';
    
    switch(id) {
        case 1:
            promptMsg = '请输入调整后的氧流量 (Nm³/min)：';
            defaultValue = '22000';
            break;
        case 2:
            promptMsg = '请输入调整后的枪位高度 (mm)：';
            defaultValue = '1650';
            break;
        case 3:
            promptMsg = '请输入调整后的石灰量 (kg)：';
            defaultValue = '500';
            break;
        case 4:
            promptMsg = '请输入调整后的底吹流量 (Nm³/min)：';
            defaultValue = '95';
            break;
        case 5:
            promptMsg = '请输入调整后的炉倾角 (°)：';
            defaultValue = '2.5';
            break;
        case 6:
            promptMsg = '请输入枪位下降量 (mm) 和消泡剂量 (kg)，用逗号分隔：';
            defaultValue = '50,200';
            break;
    }
    
    const value = prompt(promptMsg, defaultValue);
    if (value) {
        showNotification(
            '⚙ 建议已微调', 
            `${suggestion.type} 参数已调整为: ${value}\n正在重新计算预期效果...`, 
            'info'
        );
        
        setTimeout(() => {
            showNotification('✓ 微调完成', '已更新预期效果，置信度: 89%', 'success');
        }, 1500);
    }
}

function rejectSuggestion(id) {
    const suggestion = suggestionActions[id];
    const reasons = [
        '当前工况不适合',
        '设备限制',
        '操作经验判断',
        '安全考虑',
        '其他原因'
    ];
    
    let reasonList = '请选择拒绝原因（用于模型学习）：\n\n';
    reasons.forEach((r, i) => {
        reasonList += `${i + 1}. ${r}\n`;
    });
    reasonList += '\n请输入序号(1-5)或直接输入原因：';
    
    const input = prompt(reasonList);
    if (input) {
        let reason = input;
        const num = parseInt(input);
        if (num >= 1 && num <= 5) {
            reason = reasons[num - 1];
        }
        
        showNotification(
            '✗ 建议已拒绝', 
            `已记录拒绝原因"${reason}"，将用于模型优化学习`, 
            'warning'
        );
        
        // 视觉反馈
        const card = document.getElementById('suggestion' + id);
        if (card) {
            card.style.opacity = '0.4';
            card.style.borderLeftColor = '#cc0000';
            card.style.boxShadow = '0 2px 10px rgba(204,0,0,0.2)';
        }
    }
}

// ============ 通知系统 ============

function showNotification(title, message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-header">
            <span class="notification-title">${title}</span>
            <span style="cursor: pointer;" onclick="this.parentElement.parentElement.remove()">✕</span>
        </div>
        <div class="notification-body">${message}</div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// ============ 弹窗控制 ============

function openWhatIf() {
    document.getElementById('whatifModal').classList.add('active');
    document.getElementById('whatifResult').style.display = 'none';
}

function openHistory() {
    document.getElementById('historyModal').classList.add('active');
}

function openModelManagement() {
    document.getElementById('modelModal').classList.add('active');
    document.getElementById('modalFurnaceType').textContent = furnaceParameters[currentFurnaceType].name;
}

function showModelDetails(version) {
    let details = '';
    switch(version) {
        case 'v3.1.5':
            details = '模型详情 - v3.1.5\n\n' +
                     '训练数据：150t转炉，820炉次\n' +
                     '时间范围：2025-07-01 ~ 2025-09-28\n' +
                     '温度MAE：±4.1°C\n' +
                     '碳含量MAE：±0.008%\n' +
                     '磷含量MAE：±2.5‰\n' +
                     '再吹率：1.8%\n' +
                     '特征重要性Top5：\n' +
                     '1. 累计吹氧量 (18.3%)\n' +
                     '2. 入炉Si含量 (15.7%)\n' +
                     '3. 当前氧流量 (12.4%)\n' +
                     '4. 铁水温度 (11.2%)\n' +
                     '5. 枪位高度 (9.8%)';
            break;
        case 'v3.1.2':
            details = '模型详情 - v3.1.2\n\n' +
                     '训练数据：250t转炉，730炉次\n' +
                     '时间范围：2025-07-01 ~ 2025-09-10\n' +
                     '温度MAE：±4.5°C\n' +
                     '碳含量MAE：±0.009%\n' +
                     '磷含量MAE：±2.8‰\n' +
                     '再吹率：2.1%\n' +
                     '说明：该版本为250t转炉专用模型';
            break;
    }
    alert(details);
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// 点击弹窗外部关闭
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
});

// ============ What-If 仿真 ============

function runWhatIf() {
    const oxygen = document.getElementById('whatifOxygen').value;
    const lance = document.getElementById('whatifLance').value;
    const duration = document.getElementById('whatifDuration').value;
    
    // 模拟计算
    setTimeout(() => {
        const tempChange = (22000 - oxygen) * 0.0001 + Math.random() * 2;
        const carbonChange = (oxygen - 22000) * 0.0000003;
        const energyChange = (oxygen - 22000) * 0.00005;
        const timeChange = (22000 - oxygen) * 0.00003;
        const hitRate = tempChange * 2 + Math.random() * 3;
        
        document.getElementById('whatifTempChange').textContent = 
            (tempChange >= 0 ? '+' : '') + tempChange.toFixed(1) + '°C';
        document.getElementById('whatifCarbonChange').textContent = 
            (carbonChange >= 0 ? '+' : '') + carbonChange.toFixed(3) + '%';
        document.getElementById('whatifEnergyChange').textContent = 
            (energyChange >= 0 ? '+' : '') + energyChange.toFixed(1) + '%';
        document.getElementById('whatifTimeChange').textContent = 
            (timeChange >= 0 ? '+' : '') + timeChange.toFixed(1) + '分钟';
        document.getElementById('whatifHitRate').textContent = 
            (hitRate >= 0 ? '+' : '') + hitRate.toFixed(1) + '%';
        
        document.getElementById('whatifResult').style.display = 'block';
        showNotification('仿真完成', 'What-If仿真已完成，请查看结果', 'success');
    }, 1000);
}

// ============ 模型管理 ============

function triggerRetrain() {
    if (confirm('确认触发模型重训练？\n\n预计需要 2-4 小时完成训练，训练期间将继续使用当前模型。')) {
        showNotification('训练已启动', '模型重训练任务已提交，将在后台执行', 'success');
    }
}

// ============ 实时数据更新 ============

function updateRealTimeData() {
    // 基于当前炉型参数更新预测值
    const params = furnaceParameters[currentFurnaceType];
    
    // 添加少量随机波动
    const temp = 1648 + (Math.random() - 0.5) * 4;
    const carbon = (params.stopC / 100) + (Math.random() - 0.5) * 0.005;
    const phosphorus = params.stopP + (Math.random() - 0.5) * 2;
    const mn = (params.stopMn / 100) + (Math.random() - 0.5) * 0.005;
    const s = params.stopS + (Math.random() - 0.5) * 1;
    const tfe = params.stopTFe + (Math.random() - 0.5) * 1;
    const co = params.coProduct + (Math.random() - 0.5) * 50;
    const reblow = params.reblowRate + (Math.random() - 0.5) * 0.3;
    
    document.getElementById('predTemp').textContent = temp.toFixed(0) + '°C';
    document.getElementById('predCarbon').textContent = carbon.toFixed(3) + '%';
    document.getElementById('predPhosphorus').textContent = phosphorus.toFixed(1) + '‰';
    document.getElementById('predMn').textContent = mn.toFixed(3) + '%';
    document.getElementById('predS').textContent = s.toFixed(1) + '‰';
    document.getElementById('predTFe').textContent = tfe.toFixed(1) + '%';
    document.getElementById('predCO').textContent = co.toFixed(0);
    document.getElementById('predReblow').textContent = reblow.toFixed(1) + '%';
    
    // 更新过程监控状态
    const coGas = 24.5 + (Math.random() - 0.5) * 2;
    const co2Gas = 16.2 + (Math.random() - 0.5) * 1;
    const slagLevel = 850 + (Math.random() - 0.5) * 30;
    const foamIndex = 3.2 + (Math.random() - 0.5) * 0.4;
    const bottomFlow = 82 + (Math.random() - 0.5) * 8;
    const furnaceAngle = 2.1 + (Math.random() - 0.5) * 0.2;
    
    document.getElementById('monitorCO').textContent = coGas.toFixed(1) + '%';
    document.getElementById('monitorCO2').textContent = co2Gas.toFixed(1) + '%';
    document.getElementById('monitorSlag').textContent = slagLevel.toFixed(0) + 'mm';
    document.getElementById('monitorFoam').textContent = foamIndex.toFixed(1);
    document.getElementById('monitorBottom').textContent = bottomFlow.toFixed(0) + ' Nm³/min';
    document.getElementById('monitorAngle').textContent = furnaceAngle.toFixed(1) + '°';
    
    // 泡沫指数预警颜色
    if (foamIndex > 3.5) {
        document.getElementById('monitorFoam').style.color = '#cc0000';
    } else if (foamIndex > 3.0) {
        document.getElementById('monitorFoam').style.color = '#ff8800';
    } else {
        document.getElementById('monitorFoam').style.color = '#00aa44';
    }
    
    // 更新时间序列图表（模拟新数据点）
    if (timeSeriesChart.data.labels.length > 100) {
        timeSeriesChart.data.labels.shift();
        timeSeriesChart.data.datasets[0].data.shift();
    }
    
    const lastLabel = timeSeriesChart.data.labels[timeSeriesChart.data.labels.length - 1];
    timeSeriesChart.data.labels.push(lastLabel + 1);
    
    const lastValue = timeSeriesChart.data.datasets[0].data[timeSeriesChart.data.datasets[0].data.length - 1];
    timeSeriesChart.data.datasets[0].data.push(lastValue + (Math.random() - 0.5) * 500);
    
    timeSeriesChart.update('none');
}

// 每2秒更新一次实时数据
setInterval(updateRealTimeData, 2000);

// ============ 页面加载完成后的初始化 ============

window.addEventListener('load', function() {
    showNotification('系统已就绪', '转炉终点智能控制系统已连接，实时监控中...', 'success');
    
    // 模拟定期的异常检测通知
    setTimeout(() => {
        showNotification('📊 过程分析', '当前碳氧积2150，接近目标上限，脱碳速率正常', 'info');
    }, 8000);
    
    setTimeout(() => {
        showNotification('⚠️ 泡沫预警', '泡沫指数升至3.2，建议关注渣况变化', 'warning');
    }, 15000);
    
    setTimeout(() => {
        showNotification('✓ ML建议更新', '新增3条优化建议，置信度85%+，建议查看', 'success');
    }, 22000);
    
    // 模拟烟气分析提醒
    setTimeout(() => {
        showNotification('🔥 烟气分析', 'CO浓度24.5%，反应强度适中，终点预计3-5分钟', 'info');
    }, 30000);
});

// ============ 键盘快捷键 ============

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});

