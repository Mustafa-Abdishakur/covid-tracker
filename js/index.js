const DOM = {
    cases: document.querySelector('.cases span'),
    recoveries: document.querySelector('.recoveries span'),
    deaths: document.querySelector('.deaths span'),
    country: document.querySelector('#country'),
    chartType: document.querySelector('.chart-type')
}
let countryData;
let monthlyData;

class Covid {
    constructor(country) {
        this.country = country;
    }
    async getInfo() {
        //let countryData = [];
        try {
            //all countries data
            const global = await fetch('https://api.covid19api.com/summary');
            const globalData = await global.json();
            if (this.country === 'global') {
                this.cases = globalData.Global.TotalConfirmed;
                this.recoveries = globalData.Global.TotalRecovered;
                this.deaths = globalData.Global.TotalDeaths;
                //countryData = [this.cases, this.recoveries, this.deaths];
            } else {
                globalData.Countries.forEach(country => {
                    if (country.Country === this.country) {
                        this.cases = country.TotalConfirmed;
                        this.recoveries = country.TotalRecovered;
                        this.deaths = country.TotalDeaths;
                        // countryData = [this.cases, this.recoveries, this.deaths];
                    }
                })
                if (!this.cases) {
                    // countryData = [0, 0, 0];
                    this.cases = 0;
                    this.recoveries = 0;
                    this.deaths = 0;
                    alert('sorry no data for this country');
                }
            }
            
            return this;



        } catch (err) {
            alert(err);
        }
    }
    chartView(chart, label, values){
        chart.destroy();
        myChart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'bar',
        
            // The data for our dataset
            data: {
                labels: ['Cases', 'Recoveries', 'Deaths'],
                datasets: [{
                    label: label,
                    backgroundColor: [
                        'rgb(199, 199, 11)',
                        'rgb(13, 165, 59)',
                        'rgb(228, 13, 13)'
                    ],
                    data: [values.cases, values.recoveries, values.deaths]
                }]
            },
        
            // Configuration options go here
            options: {
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
    try{
        chart.update();

    }catch(e){
        return;
    }

    }
}
//country select event
DOM.country.addEventListener('change', async (e) => {
    const country = e.target.value;
    //get the data
    const covid = new Covid(country);
    countryData = await covid.getInfo();
    //display covid data
    DOM.cases.textContent = countryData.cases;
    DOM.recoveries.textContent = countryData.recoveries;
    DOM.deaths.textContent = countryData.deaths;
    //display data on chart
    covid.chartView(myChart, country, countryData);
});
//change in chart type event
DOM.chartType.addEventListener('change', async(e) => {
    //get the value 
    const chartType = e.target.value;
    //change the value in the chart
    if(!(chartType === 'line')){
        chartChange(myChart,chartType, countryData);
    }else{
        const lineData = new MonthlyData(countryData);
        monthlyData = await lineData.getInfo(countryData);
        lineData.displayData(myChart, monthlyData);
    }

});


//chart.js
let ctx = document.getElementById('myChart').getContext('2d');
let myChart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'bar',

    // The data for our dataset
    data: {
        labels: ['Cases', 'Recoveries', 'Deaths'],
        datasets: [{
            label: `Country`,
            backgroundColor: [
                'rgb(199, 199, 11)',
                'rgb(13, 165, 59)',
                'rgb(228, 13, 13)'
            ],
            data: [0, 0, 0]
        }]
    },

    // Configuration options go here
    options: {
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


function chartChange(chart,type,values){
    chart.destroy();
    myChart = new Chart(ctx, {
        // The type of chart we want to create
        type: type,
    
        // The data for our dataset
        data: {
            labels: ['Cases', 'Recoveries', 'Deaths'],
            datasets: [{
                label: values.country,
                backgroundColor: [
                    'rgb(199, 199, 11)',
                    'rgb(13, 165, 59)',
                    'rgb(228, 13, 13)'
                ],
                data: [values.cases, values.recoveries, values.deaths]
            }]
        },
    
        // Configuration options go here
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            title: {
                display: true,
                text: values.country,
                fontSize: 25
            }
        }
    });
    try{
        chart.update();

    }catch(e){
        return;
    }
    
}

class MonthlyData {
    constructor(countryData){
        this.country = countryData.country;
    }
    async getInfo(){
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
            alert('no data from this country');
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
        return this;
    } catch (err) {
        console.log(err);
    }
    }
    displayData(chart,values){
        chart.destroy();
        myChart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',
        
            // The data for our dataset
            data: {
                labels: ['March','April','May','June','July'],
                datasets: [{
                    label: `${values.country} cases`,
                    data: [values.monthlyData[0],values.monthlyData[1],values.monthlyData[2],values.monthlyData[3],values.monthlyData[4]]
                }]
            },
        
            // Configuration options go here
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
                title: {
                    display: true,
                    text: values.country,
                    fontSize: 25
                }
            }
        });
        try{
            chart.update();
    
        }catch(e){
            return;
        }

}
}