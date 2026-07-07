(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var danger = style.getPropertyValue('--danger').trim();
  var warn = style.getPropertyValue('--warn').trim();
  var success = style.getPropertyValue('--success').trim();
  var purple = style.getPropertyValue('--purple').trim();

  // --- Chart: Severity Distribution ---
  var chart1 = echarts.init(document.getElementById('chart-severity'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: function(p) {
        return p.name + ': ' + p.value + ' 项 (' + p.percent + '%)';
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 10,
      itemHeight: 10
    },
    series: [{
      type: 'pie',
      radius: ['55%', '80%'],
      center: ['50%', '48%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderColor: bg2,
        borderWidth: 2
      },
      label: {
        show: true,
        position: 'outside',
        formatter: '{b}\n{d}%',
        color: muted,
        fontSize: 11
      },
      emphasis: {
        label: { fontSize: 14, fontWeight: 'bold' }
      },
      data: [
        { value: 8, name: '致命', itemStyle: { color: danger } },
        { value: 11, name: '高优先级', itemStyle: { color: warn } },
        { value: 9, name: '中优先级', itemStyle: { color: accent } },
        { value: 3, name: '低优先级', itemStyle: { color: success } }
      ]
    }]
  });

  window.addEventListener('resize', function() { chart1.resize(); });
})();