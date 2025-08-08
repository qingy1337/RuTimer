// public/js/graph.js
document.addEventListener('DOMContentLoaded', () => {
  let timesChart = null;

  // Update graph with times data
  window.updateGraph = (times) => {
    const ctx = document.getElementById('times-chart').getContext('2d');

    // Destroy previous chart if it exists
    if (timesChart) {
      timesChart.destroy();
    }

    // Sort times by timestamp
    times.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Prepare data for the chart
    const labels = times.map((_, index) => `Solve ${index + 1}`);
    const data = times.map(time => time.time_ms / 1000); // Convert to seconds

    // Calculate moving average (last 5 solves)
    const movingAverage = [];
    for (let i = 0; i < times.length; i++) {
      if (i < 4) {
        movingAverage.push(null); // Not enough data for average yet
      } else {
        const avg = (times[i].time_ms + times[i-1].time_ms + times[i-2].time_ms + times[i-3].time_ms + times[i-4].time_ms) / 5000;
        movingAverage.push(avg);
      }
    }

    // Create the chart
    timesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Solve Time (seconds)',
            data: data,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.1,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Moving Average (5 solves)',
            data: movingAverage,
            borderColor: 'rgb(220, 38, 38)',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            borderDash: [5, 5],
            tension: 0.1,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Time (seconds)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Solve Number'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw;
                const minutes = Math.floor(value / 60);
                const seconds = Math.floor(value % 60);
                const milliseconds = Math.floor((value % 1) * 1000);

                return `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
              }
            }
          }
        }
      }
    });
  };
});
