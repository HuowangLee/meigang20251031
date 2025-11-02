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
let allCharts = {};  // 存储所有图表实例
let timeSeriesData = {};  // 存储所有时序数据

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
    
    // 更新预测值
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
            <option>150t-3#炉 - 20251102-001</option>
            <option>150t-3#炉 - 20251102-002</option>
            <option>150t-3#炉 - 20251101-015</option>
        `;
    } else {
        furnaceSelect.innerHTML = `
            <option>250t-1#炉 - 20251102-003</option>
            <option>250t-1#炉 - 20251102-004</option>
            <option>250t-1#炉 - 20251101-012</option>
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
}

// ============ 数据生成函数 ============

function generateTimeSeriesData() {
    const labels = [];
    const data = {};
    
    // 初始化所有数据数组
    const dataKeys = [
        'oxygen', 'oxygenCumulative', 'lance', 'oxygenIntensity',
        'co', 'co2', 'coRatio', 'gasTemp',
        'temperature', 'tempIR', 'carbon', 'oxygenContent',
        'slagOxidation', 'slagBasicity', 'slagLevel', 'foamIndex',
        'noise', 'flameBrightness', 'spectrum',
        'pressure', 'furnaceAngle', 'bottomBlowing'
    ];
    
    dataKeys.forEach(key => data[key] = []);
    
    for (let i = 0; i <= 70; i++) {
        labels.push(i);
        
        // 吹氧系统
        const oxygenFlow = 28000 - i * 80 + (Math.random() - 0.5) * 1000;
        data.oxygen.push(oxygenFlow);
        data.oxygenCumulative.push(i * 180 + Math.random() * 50);
        data.lance.push(1800 - i * 3 + (Math.random() - 0.5) * 50);
        data.oxygenIntensity.push(oxygenFlow / 150 + (Math.random() - 0.5) * 5);
        
        // 炉气信号
        data.co.push(28 - i * 0.05 + (Math.random() - 0.5) * 3);
        data.co2.push(12 + i * 0.06 + (Math.random() - 0.5) * 2);
        const coVal = data.co[i];
        const co2Val = data.co2[i];
        data.coRatio.push(coVal / (coVal + co2Val));
        data.gasTemp.push(1750 + i * 2 + (Math.random() - 0.5) * 30);
        
        // 温度与成分
        data.temperature.push(1380 + i * 3.6 + (Math.random() - 0.5) * 10);
        data.tempIR.push(1370 + i * 3.5 + (Math.random() - 0.5) * 15);
        data.carbon.push(Math.max(0.01, 0.8 - i * 0.011 + (Math.random() - 0.5) * 0.02));
        data.oxygenContent.push(400 + i * 5 + (Math.random() - 0.5) * 50);
        
        // 炉渣状态
        data.slagOxidation.push(12 + i * 0.08 + (Math.random() - 0.5) * 1.5);
        data.slagBasicity.push(2.8 + Math.sin(i * 0.1) * 0.3 + (Math.random() - 0.5) * 0.2);
        data.slagLevel.push(800 + Math.sin(i * 0.15) * 100 + (Math.random() - 0.5) * 30);
        data.foamIndex.push(Math.max(1, 2.5 + Math.sin(i * 0.2) * 0.8 + (Math.random() - 0.5) * 0.4));
        
        // 声学/光学
        data.noise.push(90 + i * 0.1 + (Math.random() - 0.5) * 8);
        data.flameBrightness.push(7000 + i * 15 + (Math.random() - 0.5) * 500);
        data.spectrum.push(Math.sin(i * 0.3) * 100 + 200);
        
        // 设备状态
        data.pressure.push(0.58 + i * 0.001 + (Math.random() - 0.5) * 0.05);
        data.furnaceAngle.push(2.0 + (Math.random() - 0.5) * 0.3);
        data.bottomBlowing.push(75 + i * 0.1 + (Math.random() - 0.5) * 10);
    }
    
    return { labels, ...data };
}

// ============ 图表创建辅助函数 ============

function createLineChart(canvasId, label, data, color, yAxisLabel) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    
    return new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: timeSeriesData.labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: color,
                backgroundColor: color + '20',
                tension: 0.3,
                fill: true,
                borderWidth: 2,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    display: true,
                    title: { display: true, text: '时间 (分钟)' },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                y: {
                    display: true,
                    title: { display: yAxisLabel, text: yAxisLabel },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                }
            },
            animation: { duration: 300 }
        }
    });
}

function createMultiLineChart(canvasId, datasets) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    
    return new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: timeSeriesData.labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    display: true,
                    position: 'top',
                    labels: { boxWidth: 12, font: { size: 10 } }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: { display: true, text: '时间 (分钟)' },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                y: {
                    display: true,
                    grid: { color: 'rgba(0,0,0,0.05)' }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            animation: { duration: 300 }
        }
    });
}

// ============ 初始化所有图表 ============

function initializeAllCharts() {
    timeSeriesData = generateTimeSeriesData();
    
    // 综合视图
    allCharts.overview = createMultiLineChart('overviewChart', [
        {
            label: '温度 (°C)',
            data: timeSeriesData.temperature,
            borderColor: '#f44336',
            backgroundColor: '#f4433620',
            yAxisID: 'y',
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 0
        },
        {
            label: '碳含量 (%) ×100',
            data: timeSeriesData.carbon.map(v => v * 100),
            borderColor: '#4CAF50',
            backgroundColor: '#4CAF5020',
            yAxisID: 'y',
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 0
        },
        {
            label: 'CO浓度 (%) ×10',
            data: timeSeriesData.co.map(v => v * 10),
            borderColor: '#2196F3',
            backgroundColor: '#2196F320',
            yAxisID: 'y',
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 0
        }
    ]);
    
    allCharts.overviewTemp = createLineChart('overviewTempChart', '温度', timeSeriesData.temperature, '#f44336', '°C');
    allCharts.overviewCarbon = createLineChart('overviewCarbonChart', '碳含量', timeSeriesData.carbon, '#4CAF50', '%');
    
    // 吹氧系统
    allCharts.oxygenFlow = createLineChart('oxygenFlowChart', 'O₂流量', timeSeriesData.oxygen, '#2a5298', 'Nm³/min');
    allCharts.oxygenCumulative = createLineChart('oxygenCumulativeChart', '累计氧量', timeSeriesData.oxygenCumulative, '#1e88e5', 'Nm³');
    allCharts.lance = createLineChart('lanceChart', '枪位高度', timeSeriesData.lance, '#43a047', 'mm');
    allCharts.oxygenIntensity = createLineChart('oxygenIntensityChart', '供氧强度', timeSeriesData.oxygenIntensity, '#66bb6a', 'Nm³/t·min');
    
    // 炉气信号
    allCharts.co = createLineChart('coChart', 'CO浓度', timeSeriesData.co, '#ff5722', '%');
    allCharts.co2 = createLineChart('co2Chart', 'CO₂浓度', timeSeriesData.co2, '#ff7043', '%');
    allCharts.coRatio = createLineChart('coRatioChart', 'CO比值', timeSeriesData.coRatio, '#ff8a65', '');
    allCharts.gasTemp = createLineChart('gasTempChart', '炉气温度', timeSeriesData.gasTemp, '#f44336', '°C');
    
    // 温度成分
    allCharts.tempEst = createLineChart('tempEstChart', '估计温度', timeSeriesData.temperature, '#f44336', '°C');
    allCharts.tempIR = createLineChart('tempIRChart', '红外测温', timeSeriesData.tempIR, '#e91e63', '°C');
    allCharts.carbonEst = createLineChart('carbonEstChart', '估计碳含量', timeSeriesData.carbon, '#ff9800', '%');
    allCharts.oxygenContent = createLineChart('oxygenContentChart', '氧含量', timeSeriesData.oxygenContent, '#9c27b0', 'ppm');
    
    // 炉渣状态
    allCharts.slagOx = createLineChart('slagOxChart', '炉渣氧化性', timeSeriesData.slagOxidation, '#e91e63', '%');
    allCharts.slagBasicity = createLineChart('slagBasicityChart', '渣碱度', timeSeriesData.slagBasicity, '#ab47bc', '');
    allCharts.slagLevel = createLineChart('slagLevelChart', '渣位高度', timeSeriesData.slagLevel, '#9c27b0', 'mm');
    allCharts.foamIndex = createLineChart('foamIndexChart', '泡沫指数', timeSeriesData.foamIndex, '#ba68c8', '');
    
    // 声学/光学
    allCharts.noise = createLineChart('noiseChart', '噪声强度', timeSeriesData.noise, '#ff9800', 'dB');
    allCharts.flame = createLineChart('flameChart', '火焰亮度', timeSeriesData.flameBrightness, '#ff6b00', '');
    allCharts.spectrum = createLineChart('spectrumChart', '频谱特征', timeSeriesData.spectrum, '#673ab7', '');
    
    // 设备状态
    allCharts.pressure = createLineChart('pressureChart', '顶压', timeSeriesData.pressure, '#00bcd4', 'MPa');
    allCharts.furnaceAngle = createLineChart('furnaceAngleChart', '炉倾角', timeSeriesData.furnaceAngle, '#26c6da', '°');
    allCharts.bottomBlowing = createLineChart('bottomBlowingChart', '底吹流量', timeSeriesData.bottomBlowing, '#4dd0e1', 'Nm³/min');
}

// ============ 标签页切换 ============

function switchSensorTab(tabName) {
    // 移除所有active类
    document.querySelectorAll('.sensor-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.sensor-content').forEach(content => content.classList.remove('active'));
    
    // 添加active类到当前标签
    event.target.classList.add('active');
    document.getElementById(tabName + '-content').classList.add('active');
    
    // 重新渲染当前显示的图表
    Object.values(allCharts).forEach(chart => {
        if (chart && chart.canvas && chart.canvas.offsetParent !== null) {
            chart.resize();
        }
    });
}

// ============ 实时数据更新 ============

function updateRealTimeData() {
    const params = furnaceParameters[currentFurnaceType];
    
    // 更新所有实时数值显示
    const currentIndex = timeSeriesData.labels.length - 1;
    
    // 综合视图
    document.getElementById('rtTemp').textContent = timeSeriesData.temperature[currentIndex].toFixed(0) + '°C';
    document.getElementById('rtCarbon').textContent = timeSeriesData.carbon[currentIndex].toFixed(3) + '%';
    
    // 吹氧系统
    document.getElementById('rtO2Flow').textContent = timeSeriesData.oxygen[currentIndex].toFixed(0) + ' Nm³/min';
    document.getElementById('rtO2Cumulative').textContent = timeSeriesData.oxygenCumulative[currentIndex].toFixed(0) + ' Nm³';
    document.getElementById('rtLance').textContent = timeSeriesData.lance[currentIndex].toFixed(0) + ' mm';
    document.getElementById('rtO2Intensity').textContent = timeSeriesData.oxygenIntensity[currentIndex].toFixed(0) + ' Nm³/t·min';
    
    // 炉气信号
    document.getElementById('rtCO').textContent = timeSeriesData.co[currentIndex].toFixed(1) + '%';
    document.getElementById('rtCO2').textContent = timeSeriesData.co2[currentIndex].toFixed(1) + '%';
    document.getElementById('rtCORatio').textContent = timeSeriesData.coRatio[currentIndex].toFixed(3);
    document.getElementById('rtGasTemp').textContent = timeSeriesData.gasTemp[currentIndex].toFixed(0) + '°C';
    
    // 温度成分
    document.getElementById('rtTempEst').textContent = timeSeriesData.temperature[currentIndex].toFixed(0) + '°C';
    document.getElementById('rtTempIR').textContent = timeSeriesData.tempIR[currentIndex].toFixed(0) + '°C';
    document.getElementById('rtCarbonEst').textContent = timeSeriesData.carbon[currentIndex].toFixed(3) + '%';
    document.getElementById('rtOxygenContent').textContent = timeSeriesData.oxygenContent[currentIndex].toFixed(0) + ' ppm';
    
    // 炉渣状态
    document.getElementById('rtSlagOx').textContent = timeSeriesData.slagOxidation[currentIndex].toFixed(1) + '%';
    document.getElementById('rtSlagBasicity').textContent = timeSeriesData.slagBasicity[currentIndex].toFixed(2);
    document.getElementById('rtSlagLevel').textContent = timeSeriesData.slagLevel[currentIndex].toFixed(0) + ' mm';
    const foamValue = timeSeriesData.foamIndex[currentIndex];
    document.getElementById('rtFoamIndex').textContent = foamValue.toFixed(1);
    
    // 声光信号
    document.getElementById('rtNoise').textContent = timeSeriesData.noise[currentIndex].toFixed(0) + ' dB';
    document.getElementById('rtFlame').textContent = timeSeriesData.flameBrightness[currentIndex].toFixed(0);
    
    // 设备状态
    document.getElementById('rtPressure').textContent = timeSeriesData.pressure[currentIndex].toFixed(2) + ' MPa';
    document.getElementById('rtFurnaceAngle').textContent = timeSeriesData.furnaceAngle[currentIndex].toFixed(1) + '°';
    document.getElementById('rtBottomBlowing').textContent = timeSeriesData.bottomBlowing[currentIndex].toFixed(0) + ' Nm³/min';
    
    // 更新当前状态估计区域
    document.getElementById('currentTempEst').textContent = timeSeriesData.temperature[currentIndex].toFixed(0) + '°C';
    document.getElementById('currentCarbonEst').textContent = timeSeriesData.carbon[currentIndex].toFixed(3) + '%';
    document.getElementById('currentSlagOx').textContent = timeSeriesData.slagOxidation[currentIndex].toFixed(1) + '%';
    
    // 更新过程监控状态
    document.getElementById('monitorCO').textContent = timeSeriesData.co[currentIndex].toFixed(1) + '%';
    document.getElementById('monitorCO2').textContent = timeSeriesData.co2[currentIndex].toFixed(1) + '%';
    document.getElementById('monitorSlag').textContent = timeSeriesData.slagLevel[currentIndex].toFixed(0) + 'mm';
    document.getElementById('monitorFoam').textContent = foamValue.toFixed(1);
    document.getElementById('monitorBottom').textContent = timeSeriesData.bottomBlowing[currentIndex].toFixed(0) + ' Nm³/min';
    document.getElementById('monitorAngle').textContent = timeSeriesData.furnaceAngle[currentIndex].toFixed(1) + '°';
    
    // 泡沫指数预警颜色
    const foamElement = document.getElementById('monitorFoam');
    if (foamValue > 3.5) {
        foamElement.style.color = '#cc0000';
    } else if (foamValue > 3.0) {
        foamElement.style.color = '#ff8800';
    } else {
        foamElement.style.color = '#00aa44';
    }
    
    // 更新预测值
    document.getElementById('predTemp').textContent = (1640 + Math.random() * 20).toFixed(0) + '°C';
    document.getElementById('predCarbon').textContent = (params.stopC / 100 + (Math.random() - 0.5) * 0.005).toFixed(3) + '%';
    document.getElementById('predPhosphorus').textContent = (params.stopP + (Math.random() - 0.5) * 2).toFixed(1) + '‰';
    document.getElementById('predMn').textContent = (params.stopMn / 100 + (Math.random() - 0.5) * 0.005).toFixed(3) + '%';
    document.getElementById('predS').textContent = (params.stopS + (Math.random() - 0.5) * 1).toFixed(1) + '‰';
    document.getElementById('predTFe').textContent = (params.stopTFe + (Math.random() - 0.5) * 1).toFixed(1) + '%';
    document.getElementById('predCO').textContent = (params.coProduct + (Math.random() - 0.5) * 50).toFixed(0);
    document.getElementById('predReblow').textContent = (params.reblowRate + (Math.random() - 0.5) * 0.3).toFixed(1) + '%';
    
    // 模拟新数据点（滚动窗口）
    if (timeSeriesData.labels.length > 100) {
        // 移除第一个点
        timeSeriesData.labels.shift();
        Object.keys(timeSeriesData).forEach(key => {
            if (key !== 'labels' && Array.isArray(timeSeriesData[key])) {
                timeSeriesData[key].shift();
            }
        });
    }
    
    // 添加新数据点
    const lastLabel = timeSeriesData.labels[timeSeriesData.labels.length - 1];
    timeSeriesData.labels.push(lastLabel + 1);
    
    // 为每个数据系列添加新点（带一些随机波动）
    const lastOxygen = timeSeriesData.oxygen[timeSeriesData.oxygen.length - 1];
    timeSeriesData.oxygen.push(lastOxygen - 80 + (Math.random() - 0.5) * 1000);
    
    const lastCumulative = timeSeriesData.oxygenCumulative[timeSeriesData.oxygenCumulative.length - 1];
    timeSeriesData.oxygenCumulative.push(lastCumulative + 180 + Math.random() * 50);
    
    // 更新其他数据...（简化处理）
    Object.keys(timeSeriesData).forEach(key => {
        if (key !== 'labels' && key !== 'oxygen' && key !== 'oxygenCumulative' && Array.isArray(timeSeriesData[key])) {
            const lastValue = timeSeriesData[key][timeSeriesData[key].length - 1];
            const variation = lastValue * 0.02;  // ±2%变化
            timeSeriesData[key].push(lastValue + (Math.random() - 0.5) * variation);
        }
    });
    
    // 更新所有图表
    Object.values(allCharts).forEach(chart => {
        if (chart) {
            chart.data.labels = timeSeriesData.labels;
            chart.update('none');  // 无动画更新
        }
    });
}

// ============ 其他功能函数 (从原app.js复制) ============

// 热力图（用折线图模拟多变量）
const heatMapCtx = document.getElementById('heatMapChart');
if (heatMapCtx) {
    const heatMapChart = new Chart(heatMapCtx.getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: '温度 (°C)',
                    data: [],
                    borderColor: '#f44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    yAxisID: 'y',
                    tension: 0.4
                },
                {
                    label: '碳含量 (%)',
                    data: [],
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
    
    // 更新热力图数据
    heatMapChart.data.labels = timeSeriesData.labels || [];
    heatMapChart.data.datasets[0].data = timeSeriesData.temperature || [];
    heatMapChart.data.datasets[1].data = timeSeriesData.carbon || [];
    heatMapChart.update();
}

// 对比图表
const comparisonCtx = document.getElementById('comparisonChart');
if (comparisonCtx) {
    const comparisonChart = new Chart(comparisonCtx.getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: '当前炉次',
                    data: [],
                    borderColor: '#2a5298',
                    backgroundColor: 'rgba(42, 82, 152, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'ML建议曲线',
                    data: [],
                    borderColor: '#4CAF50',
                    borderDash: [5, 5],
                    tension: 0.4,
                    fill: false
                },
                {
                    label: '对比炉次',
                    data: [],
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
}

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
                    replayControl('play');
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

if (document.getElementById('replaySlider')) {
    document.getElementById('replaySlider').addEventListener('input', updateReplayTime);
}

// ============ 建议操作 ============

const suggestionActions = {
    1: { action: '降低氧流量至 22000 Nm³/min', type: '氧枪控制' },
    2: { action: '提升氧枪枪位至 1650mm', type: '枪位调整' },
    3: { action: '补加石灰 500kg', type: '造渣操作' },
    4: { action: '延后停氧 1.5 分钟', type: '停氧时机' },
    5: { action: '增大底吹流量至 95 Nm³/min', type: '底吹控制' },
    6: { action: '调整炉倾角至 2.5°', type: '设备调整' },
    7: { action: '降低枪位50mm + 投入消泡剂200kg', type: '泡沫控制' }
};

function adoptSuggestion(id) {
    const suggestion = suggestionActions[id];
    const confirmMsg = `确认采纳建议 #${id}？\n\n` +
                     `操作类型：${suggestion.type}\n` +
                     `具体操作：${suggestion.action}\n\n` +
                     `此操作将向DCS系统下达控制指令，需要二次确认。`;
    
    if (confirm(confirmMsg)) {
        const password = prompt('请输入操作密码（演示用，输入任意内容）：');
        if (password) {
            showNotification(
                '✓ 建议已采纳', 
                `${suggestion.type} - ${suggestion.action}\n已成功下达至DCS系统执行`, 
                'success'
            );
            
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
            promptMsg = '请输入延后时间 (分钟)：';
            defaultValue = '1.5';
            break;
        case 5:
            promptMsg = '请输入调整后的底吹流量 (Nm³/min)：';
            defaultValue = '95';
            break;
        case 6:
            promptMsg = '请输入调整后的炉倾角 (°)：';
            defaultValue = '2.5';
            break;
        case 7:
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
                     '再吹率：1.8%';
            break;
        case 'v3.1.2':
            details = '模型详情 - v3.1.2\n\n' +
                     '训练数据：250t转炉，730炉次\n' +
                     '时间范围：2025-07-01 ~ 2025-09-10\n' +
                     '温度MAE：±4.5°C\n' +
                     '碳含量MAE：±0.009%\n' +
                     '磷含量MAE：±2.8‰\n' +
                     '再吹率：2.1%';
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

function runWhatIf() {
    const oxygen = document.getElementById('whatifOxygen').value;
    const lance = document.getElementById('whatifLance').value;
    const duration = document.getElementById('whatifDuration').value;
    
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

function triggerRetrain() {
    if (confirm('确认触发模型重训练？\n\n预计需要 2-4 小时完成训练，训练期间将继续使用当前模型。')) {
        showNotification('训练已启动', '模型重训练任务已提交，将在后台执行', 'success');
    }
}

// ============ 页面加载完成后的初始化 ============

window.addEventListener('load', function() {
    // 初始化所有图表
    initializeAllCharts();
    
    // 启动实时数据更新
    setInterval(updateRealTimeData, 2000);
    
    showNotification('系统已就绪', '转炉终点智能控制系统已连接，实时监控中...', 'success');
    
    // 模拟定期的异常检测通知
    setTimeout(() => {
        showNotification('📊 过程分析', '当前碳氧积2150，接近目标上限，脱碳速率正常', 'info');
    }, 8000);
    
    setTimeout(() => {
        showNotification('⚠️ 泡沫预警', '泡沫指数升至3.2，建议关注渣况变化', 'warning');
    }, 15000);
    
    setTimeout(() => {
        showNotification('✓ ML建议更新', '新增高优先级建议，置信度89%，建议查看', 'success');
    }, 22000);
});

// ============ 键盘快捷键 ============

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});

