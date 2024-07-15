'use strict';

$(document).ready(function() {
    async function fetchServiceLevel() {
        try {
            const response = await fetch('http://localhost:3000/api/service-level');
            const data = await response.json();
            console.log("mchn level ",data.service_level);
            return data.service_level;
           
        } catch (error) {
            console.error('Error fetching service level:', error);
            return 0; // Default to 0 if there's an error
        }
    }

    async function renderGaugeChart() {
        const serviceLevel = await fetchServiceLevel();
        
        var options = {
            series: [serviceLevel], // Set the series value to the fetched service level
            chart: {
                type: 'radialBar',
                height: 650,
                offsetY: -20,
                sparkline: {
                    enabled: true
                }
            },
            plotOptions: {
                radialBar: {
                    startAngle: -90,
                    endAngle: 90,
                    track: {
                        background: "#e7e7e7",
                        strokeWidth: '97%',
                        margin: 5, // margin is in pixels
                        dropShadow: {
                            enabled: true,
                            top: 2,
                            left: 0,
                            color: '#999',
                            opacity: 1,
                            blur: 2
                        }
                    },
                    dataLabels: {
                        name: {
                            show: false
                        },
                        value: {
                            offsetY: -2,
                            fontSize: '22px'
                        }
                    }
                }
            },
            grid: {
                padding: {
                    top: -10
                }
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shade: 'light',
                    shadeIntensity: 0.4,
                    inverseColors: false,
                    opacityFrom: 1,
                    opacityTo: 1,
                    stops: [0, 50, 53, 91]
                },
            },
            labels: ['Average Results'],
        };

        var chart = new ApexCharts(document.querySelector("#gauge_chart"), options);
        chart.render();

         // Function to update the chart's series
         async function updateGaugeChart() {
            const newServiceLevel = await fetchServiceLevel();
            chart.updateSeries([newServiceLevel]);
        }

        // Update the chart every 5 seconds
        setInterval(updateGaugeChart, 5000);
    }

    if ($('#gauge_chart').length > 0) {
        renderGaugeChart();
    }

    if ($('#sales_chart').length > 0) {
        var columnCtx = document.getElementById("sales_chart"),
            columnConfig = {
                colors: ['#0000FF', '#28C76F','#EA5455'],
                series: [{
                    name: "Inbound",
                    type: "column",
                    data: [70, 150, 80, 180, 150, 175, 201]
                }, {
                    name: "Outbound",
                    type: "column",
                    data: [23, 42, 35, 27, 43, 22, 17]
                }, {
                    name: "Missed",
                    type: "column",
                    data: [23, 42, 35, 27, 43, 22, 17]
                }],
                chart: {
                    type: 'bar',
                    fontFamily: 'Poppins, sans-serif',
                    height: 350,
                    toolbar: {
                        show: false
                    }
                },
                plotOptions: {
                    bar: {
                        horizontal: false,
                        columnWidth: '60%',
                        endingShape: 'rounded'
                    },
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    show: true,
                    width: 2,
                    colors: ['transparent']
                },
                xaxis: {
                    categories: ['2024-07-04', '2024-07-05', '2024-07-06', '2024-07-07', '2024-07-08', '2024-07-09', '2024-07-10'],
                },
                yaxis: {
                    title: {
                        text: 'Count'
                    }
                },
                fill: {
                    opacity: 1
                },
                tooltip: {
                    y: {
                        formatter: function(val) {
                            return val + " Calls"
                        }
                    }
                }
            };
        var columnChart = new ApexCharts(columnCtx, columnConfig);
        columnChart.render();
    }
});
