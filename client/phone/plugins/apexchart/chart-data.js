'use strict';

$(document).ready(function() {

    // Function to get URL parameter
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    // Get extensionNumber from URL
    const extensionNumber = getUrlParameter('extension');

    // Service Level
    async function fetchServiceLevel(extensionNumber) {
        try {
            const response = await fetch(`http://localhost:3000/api/service-level?extension=${extensionNumber}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("mchn level", data.service_level);
            return data.service_level;
        } catch (error) {
            console.error('Error fetching service level:', error);
            return 0; // Default to 0 if there's an error
        }
    }

    async function renderGaugeChart(extensionNumber) {
        const serviceLevel = await fetchServiceLevel(extensionNumber);
        
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
            const newServiceLevel = await fetchServiceLevel(extensionNumber);
            chart.updateSeries([newServiceLevel]);
        }

        // Update the chart every 5 seconds
        setInterval(updateGaugeChart, 5000);
    }

    if ($('#gauge_chart').length > 0) {
        renderGaugeChart(extensionNumber);
    }

    // Bar Chart
    async function fetchDailyCallCounts(extensionNumber) {
        try {
            const response = await fetch(`http://localhost:3000/api/dailyCallCounts?extension=${extensionNumber}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Chart Data", data);
            return data;
        } catch (error) {
            console.error('Error fetching daily call counts:', error);
            return [];
        }
    }

    async function renderBarChart(extensionNumber) {
        const dailyCallCounts = await fetchDailyCallCounts(extensionNumber);

        const dates = dailyCallCounts.reduce((acc, curr) => {
            if (!acc.includes(curr.date)) {
                acc.push(curr.date);
            }
            return acc;
        }, []);

        const inboundData = dates.map(date => {
            const count = dailyCallCounts.find(item => item.date === date && item.type === 'inbound');
            return count ? count.count : 0;
        });

        const outboundData = dates.map(date => {
            const count = dailyCallCounts.find(item => item.date === date && item.type === 'outbound');
            return count ? count.count : 0;
        });

        const missedData = dates.map(date => {
            const count = dailyCallCounts.find(item => item.date === date && item.type === 'missed');
            return count ? count.count : 0;
        });

        var columnCtx = document.getElementById("bar_chart");
        var columnConfig = {
            colors: ['#0000FF', '#28C76F', '#EA5455'],
            series: [{
                name: "Inbound",
                type: "column",
                data: inboundData
            }, {
                name: "Outbound",
                type: "column",
                data: outboundData
            }, {
                name: "Missed",
                type: "column",
                data: missedData
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
                categories: dates,
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

        // Update the chart data every 5 seconds
        setInterval(async () => {
            const updatedData = await fetchDailyCallCounts(extensionNumber);

            const updatedInboundData = dates.map(date => {
                const count = updatedData.find(item => item.date === date && item.type === 'inbound');
                return count ? count.count : 0;
            });

            const updatedOutboundData = dates.map(date => {
                const count = updatedData.find(item => item.date === date && item.type === 'outbound');
                return count ? count.count : 0;
            });

            const updatedMissedData = dates.map(date => {
                const count = updatedData.find(item => item.date === date && item.type === 'missed');
                return count ? count.count : 0;
            });

            columnChart.updateSeries([
                { data: updatedInboundData },
                { data: updatedOutboundData },
                { data: updatedMissedData }
            ]);
        }, 5000);
    }

    if ($('#bar_chart').length > 0) {
        renderBarChart(extensionNumber);
    }
});
