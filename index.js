const DOM = {
    cases: document.querySelector('.cases span'),
    recoveries: document.querySelector('.recoveries span'),
    deaths: document.querySelector('.deaths span'),
    country: document.querySelector('#country'),
    chartType: document.querySelector('.chart-type'),
    addCountry: document.querySelector('.extra-country')
}
let covid;
let addCountry;

class Covid {
    constructor(country) {
        this.country = country;
    }
    async getInfo() {
        try {
            //all countries data
            const global = await fetch('https://api.covid19api.com/summary');
            const globalData = await global.json();
            if (this.country === 'global') {
                this.cases = globalData.Global.TotalConfirmed;
                this.recoveries = globalData.Global.TotalRecovered;
                this.deaths = globalData.Global.TotalDeaths;
            } else {
                globalData.Countries.forEach(country => {
                    if (country.Country === this.country) {
                        this.cases = country.TotalConfirmed;
                        this.recoveries = country.TotalRecovered;
                        this.deaths = country.TotalDeaths;
                    }
                })
                if (!this.cases) {
                    this.cases = 0;
                    this.recoveries = 0;
                    this.deaths = 0;
                    alert(`oops. Can\'t display data for this option`);
                }
            }

        } catch (err) {
            alert(err);
        }
    }
    chartView(label) {
        myChart.destroy();
        myChart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'bar',

            // The data for our dataset
            data: {
                labels: ['Cases', 'Recoveries', 'Deaths'],
                datasets: [{
                    label: label,
                    backgroundColor: [
                        '#0e75b9',
                        'rgb(13, 165, 59)',
                        'rgb(228, 13, 13)'
                    ],
                    data: [this.cases, this.recoveries, this.deaths]
                }]
            },

            // Configuration options go here
            options: {
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
                title: {
                    display: true,
                    text: label,
                    fontSize: 25
                }
            }
        });
        DOM.chartType.selectedIndex = 0;
        try {
            myChart.update();

        } catch (e) {
            console.log(e)
            return;
        }

    }
    chartChange(type) {
        myChart.destroy();
            myChart = new Chart(ctx, {
                // The type of chart we want to create
                type: type,

                // The data for our dataset
                data: {
                    labels: ['cases', 'recoveries', 'deaths'],
                    datasets: [{
                        label: this.country,
                        backgroundColor: [
                            '#0e75b9',
                            'rgb(13, 165, 59)',
                            'rgb(228, 13, 13)'
                        ],
                        data: [this.cases, this.recoveries, this.deaths]
                    }]
                },

                // Configuration options go here
                options: {
                    maintainAspectRatio: false,
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    },
                    title: {
                        display: true,
                        text: this.country,
                        fontSize: 25
                    }
                }
            });
        try {
            myChart.update();

        } catch (e) {
            return;
        }

    }
    async getMonthlyInfo() {
        try {
            //Note: to display more monthly data change from july to another month (August, Sep , etc) 
            const url = await fetch(`https://api.covid19api.com/country/${this.country}/status/confirmed?from=2020-02-01T00:00:00Z&to=2020-07-01T00:00:00Z`);
            let data = await url.json();
            //FILTER AND ADD DATA TO GET MONTHS NOT DAYS
            let total = 0;
            let monthsArr = [];
            let number = 2;
            let keys = [];
            let values = [];
            //no data from country
            if (data.message) {
                alert(`oops. Can\'t display data for this option`);
                return;
            }
            data.forEach(cur => {
                //countries with no states
                if (data[0].Province === '' && data.length > 0) {
                    let date = cur.Date;
                    let str = date.split("-");
                    let month = parseInt(str[1]);
                    if (month === number) {
                        total = cur.Cases;
                    } else {
                        monthsArr.push(total);
                        number = month;
                        total = cur.Cases;
                    }
                }
                //countries with states
                else {
                    let date2 = cur.Date;
                    let str2 = date2.split("-");
                    let month2 = parseInt(str2[1]);

                    if (month2 === number) {

                        if (keys.includes(cur.Province)) {
                            const location = keys.indexOf(cur.Province);
                            values.splice(location, 1, cur.Cases);
                        } else {

                            keys.push(cur.Province);
                            values.push(cur.Cases);
                        }
                    } else {
                        values.forEach(cases => {
                            total += cases;
                        })
                        monthsArr.push(total);
                        number++;
                        keys.push(cur.Province);
                        values.push(cur.Cases);
                    }
                }

            })
            this.monthlyData = monthsArr;
            total = 0;
            monthsArr = [];
            keys = [];
            values = [];
        } catch (err) {
            console.log(err);
        }
    }
    displayData() {
        myChart.destroy();
        myChart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
                labels: ['March', 'April', 'May', 'June', 'July'],
                datasets: [{
                    label: `${this.country} cases`,
                    data: [this.monthlyData[0], this.monthlyData[1], this.monthlyData[2], this.monthlyData[3], this.monthlyData[4]]
                }]
            },

            // Configuration options go here
            options: {
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
                title: {
                    display: true,
                    text: this.country,
                    fontSize: 25
                }
            }
        });
        try {
            myChart.update();

        } catch (e) {
            return;
        }

    }
    displayExtraCountry(chartType, covid) {
        const oldData = myChart.data.datasets[0].data;
        const newData = [this.cases, this.recoveries, this.deaths];
        if (chartType === 'bar') {
            myChart.destroy();
            myChart = new Chart(ctx, {
                // The type of chart we want to create
                type: 'bar',

                // The data for our dataset
                data: {
                    labels: ['Cases', 'Recoveries', 'Deaths'],
                    datasets: [{
                        label: covid.country,
                        backgroundColor: [
                            '#0e75b9',
                            'rgb(13, 165, 59)',
                            'rgb(228, 13, 13)'],
                        data: [oldData[0], oldData[1], oldData[2]]
                    },
                    {
                        label: this.country,
                        backgroundColor: [
                            '#0e75b9',
                            'rgb(13, 165, 59)',
                            'rgb(228, 13, 13)'],
                        data: [newData[0], newData[1], newData[2]]
                    }
                    ]
                },

                // Configuration options go here
                options: {
                    maintainAspectRatio: false,
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    },
                    title: {
                        display: true,
                        text: `${covid.country} and ${this.country}`,
                        fontSize: 25
                    }
                }
            });
            myChart.update();
        } else if (chartType === 'line') {
            myChart.destroy();
            myChart = new Chart(ctx, {
                // The type of chart we want to create
                type: 'line',

                // The data for our dataset
                data: {
                    labels: ['March', 'April', 'May', 'June', 'July'],
                    datasets: [{
                        label: `${covid.country} cases`,
                        backgroundColor: '#0e75b9',
                        data: [covid.monthlyData[0], covid.monthlyData[1], covid.monthlyData[2], covid.monthlyData[3], covid.monthlyData[4]],
                        fill: false
                    },
                    {
                        label: `${this.country} cases`,
                        backgroundColor: 'rgb(13, 165, 59)',
                        data: [this.monthlyData[0], this.monthlyData[1], this.monthlyData[2], this.monthlyData[3], this.monthlyData[4]],
                        fill: false
                    }
                    ]
                },

                // Configuration options go here
                options: {
                    maintainAspectRatio: false,
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    },
                    title: {
                        display: true,
                        text: `${covid.country} and ${this.country}`,
                        fontSize: 25
                    }
                }
            });
        }
    }

}
//country select event
DOM.country.addEventListener('change', async (e) => {
    const country = e.target.value;
    //get the data
    covid = new Covid(country);
    await covid.getInfo();
    //display covid data
    DOM.cases.textContent = covid.cases;
    DOM.recoveries.textContent = covid.recoveries;
    DOM.deaths.textContent = covid.deaths;
    //display data on chart
    covid.chartView(country);
});
//change chart type event
DOM.chartType.addEventListener('change', async (e) => {
    //get the value 
    const chartType = e.target.value;
    //change the value in the chart
    try {
        if (!(chartType === 'line')) {
            covid.chartChange(chartType);
        } else {
            await covid.getMonthlyInfo();
            covid.displayData();
        }



    } catch (e) {
        return;
    }
});
//add another country
DOM.addCountry.addEventListener('change', async (e) => {
    const country = e.target.value;
    if (covid) {
        if (covid.cases) {
            //get country data
            addCountry = new Covid(country);
            await addCountry.getInfo();
            await addCountry.getMonthlyInfo();
            //add to chart
            const chartType = DOM.chartType.value;
            addCountry.displayExtraCountry(chartType, covid);

        } else {
            return;

        }
    } else {
        return;
    }
});

//chart.js (deafult chart)
let ctx = document.getElementById('myChart').getContext('2d');
let myChart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'bar',

    // The data for our dataset
    data: {
        labels: ['Cases', 'Recoveries', 'Deaths'],
        datasets: [{
            label: `Cases`,
            backgroundColor: '#0e75b9',
            data: 0
        },
        {
            label: `Recoveries`,
            backgroundColor: 'rgb(13, 165, 59)',
            data: 0
        },
        {
            label: `Deaths`,
            backgroundColor: 'rgb(228, 13, 13)',
            data: 0
        }
        ]
    },

    // Configuration options go here
    options: {
        maintainAspectRatio: false,
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        },
        title: {
            display: true,
            text: `Country`,
            fontSize: 25
        }
    }
});
