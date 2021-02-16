const iso = {
  Belgium: { cz: 'Belgie', obyv: 11571043 },
  Bulgaria: { cz: 'Bulharsko', obyv: 7050034 },
  Czechia: { cz: 'Česko', obyv: 10693939 },
  Denmark: { cz: 'Dánsko', obyv: 5739963 },
  Germany: { cz: 'Německo', obyv: 82358185 },
  Estonia: { cz: 'Estonsko', obyv: 1228624 },
  Ireland: { cz: 'Irsko', obyv: 4757976 },
  Greece: { cz: 'Řecko', obyv: 10394719 },
  Spain: { cz: 'Španělsko', obyv: 48958159 },
  France: { cz: 'Francie', obyv: 67848156 },
  Croatia: { cz: 'Chorvatsko', obyv: 4171954 },
  Italy: { cz: 'Itálie', obyv: 60507590 },
  Cyprus: { cz: 'Kypr', obyv: 1266676 },
  Latvia: { cz: 'Lotyšsko', obyv: 1934218 },
  Lithuania: { cz: 'Litva', obyv: 2819753 },
  Luxembourg: { cz: 'Lucembursko', obyv: 590667 },
  Hungary: { cz: 'Maďarsko', obyv: 9712887 },
  Malta: { cz: 'Malta', obyv: 452515 },
  Netherlands: { cz: 'Holandsko', obyv: 17400000 },
  Austria: { cz: 'Rakousko', obyv: 8862653 },
  Poland: { cz: 'Polsko', obyv: 38433600 },
  Portugal: { cz: 'Portugalsko', obyv: 10276617 },
  Romania: { cz: 'Rumunsko', obyv: 19653136 },
  Slovenia: { cz: 'Slovinsko', obyv: 2061085 },
  Slovakia: { cz: 'Slovensko', obyv: 5441899 },
  Finland: { cz: 'Finsko', obyv: 5631751 },
  Sweden: { cz: 'Švédsko ', obyv: 10182291 },
};

fetch('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv')
  .then((response) => response.text())
  .then((data) => {
    const euData = d3.csvParse(data).filter((v) => {
      if ((Object.keys(iso).indexOf(v['Country/Region']) > -1) && (v['Province/State'] === '')) {
        return true;
      }
      return false;
    });

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const lastDay = `${yesterday.getMonth() + 1}/${yesterday.getDate()}/${yesterday.getFullYear().toString().slice(2)}`;
    yesterday.setDate(yesterday.getDate() - 15);
    const twoWeeks = `${yesterday.getMonth() + 1}/${yesterday.getDate()}/${yesterday.getFullYear().toString().slice(2)}`;
    const day = lastDay.split('/');
    const dta = [];
    euData.forEach((cnt) => {
      dta.push({
        code: cnt['Country/Region'],
        value: Math.round(((parseInt(cnt[lastDay]) - parseInt(cnt[twoWeeks])) / iso[cnt['Country/Region']].obyv) * 1000000) / 10,
      });
    });

    Highcharts.mapChart('eu-biweek-map', {
      chart: {
        map: 'custom/europe',
        spacing: [10, 0, 15, 0],
      },
      title: {
        text: `Nakažení k ${day[1]}. ${day[0]}.`,
      },
      credits: {
        text: 'OWID',
        href: 'https://github.com/owid/covid-19-data/tree/master/public/data',
      },
      legend: {
        enabled: false,
      },
      colorAxis: {
        type: 'linear',
        minColor: '#fee5d9',
        maxColor: '#a50f15',
      },
      series: [{
        data: dta,
        joinBy: ['name', 'code'],
        name: 'Nakažených za 14 dní',
        tooltip: {
          pointFormatter() {
            return `<b>${iso[this.options.code].cz}:</b> ${this.options.value} nakažených na 100 tis. obyvatel`;
          },
        },
      }],
    });
  });
