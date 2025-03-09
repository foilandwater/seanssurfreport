<!-- tides-forecast.js -->

class TidesForecast extends HTMLElement {
  // ... (keeping all other existing methods unchanged) ...

  renderChart(container, extremesData) {
    // Filter to get only High and Low tides
    const dailyExtremes = [];
    let currentDate = '';
    
    // Group extremes by day and take only 2 highs and 2 lows
    extremesData.forEach(entry => {
      const date = new Date(entry.date).toLocaleDateString();
      if (date !== currentDate) {
        currentDate = date;
        dailyExtremes.push(...extremesData
          .filter(e => new Date(e.date).toLocaleDateString() === date)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .filter((e, i, arr) => {
            const highs = arr.filter(x => x.type === 'High').length;
            const lows = arr.filter(x => x.type === 'Low').length;
            return (e.type === 'High' && highs <= 2) || 
                   (e.type === 'Low' && lows <= 2);
          })
          .slice(0, 4)); // Ensure max 4 points per day
      }
    });

    const dataPoints = dailyExtremes.map(entry => {
      const dateTime = new Date(entry.date);
      const timeLabel = dateTime.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        timeZone: "Asia/Dubai"
      });
      const dateLabel = dateTime.toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        timeZone: "Asia/Dubai"
      });
      
      return {
        x: `${dateLabel} ${timeLabel}`,
        y: entry.height,
        time: timeLabel,
        type: entry.type
      };
    });

    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 300;
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: [{
          label: "Tide Extremes",
          data: dataPoints,
          backgroundColor: "blue",
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: "category",
            position: "bottom",
            grid: {
              display: true
            }
          },
          y: {
            title: {
              display: true,
              text: "Height (m)"
            },
            grid: {
              display: true
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.raw.type}: ${context.raw.y}m at ${context.raw.time}`;
              }
            }
          },
          // Add data labels plugin
          datalabels: {
            anchor: "end",
            align: "top",
            formatter: (value) => value.time,
            color: "black",
            font: {
              size: 10
            }
          }
        }
      },
      plugins: [ChartDataLabels] // Need to include ChartDataLabels plugin
    });
  }

  // ... (keeping formatDateTime and other methods unchanged) ...
}

customElements.define("tides-forecast", TidesForecast);