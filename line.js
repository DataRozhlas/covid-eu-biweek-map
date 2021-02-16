(function () {
  const iso = {
  // Belgium: { cz: 'Belgie', obyv: 11571043 },
  // Bulgaria: { cz: 'Bulharsko', obyv: 7050034 },
    Czechia: { cz: 'Česko', obyv: 10693939 },
    // Denmark: { cz: 'Dánsko', obyv: 5739963 },
    Germany: { cz: 'Německo', obyv: 82358185 },
    // Estonia: { cz: 'Estonsko', obyv: 1228624 },
    // Ireland: { cz: 'Irsko', obyv: 4757976 },
    // Greece: { cz: 'Řecko', obyv: 10394719 },
    // Spain: { cz: 'Španělsko', obyv: 48958159 },
    // France: { cz: 'Francie', obyv: 67848156 },
    // Croatia: { cz: 'Chorvatsko', obyv: 4171954 },
    // Italy: { cz: 'Itálie', obyv: 60507590 },
    // Cyprus: { cz: 'Kypr', obyv: 1266676 },
    // Latvia: { cz: 'Lotyšsko', obyv: 1934218 },
    // Lithuania: { cz: 'Litva', obyv: 2819753 },
    // Luxembourg: { cz: 'Lucembursko', obyv: 590667 },
    Hungary: { cz: 'Maďarsko', obyv: 9712887 },
    // Malta: { cz: 'Malta', obyv: 452515 },
    // Netherlands: { cz: 'Holandsko', obyv: 17400000 },
    Austria: { cz: 'Rakousko', obyv: 8862653 },
    Poland: { cz: 'Polsko', obyv: 38433600 },
    // Portugal: { cz: 'Portugalsko', obyv: 10276617 },
    // Romania: { cz: 'Rumunsko', obyv: 19653136 },
    // Slovenia: { cz: 'Slovinsko', obyv: 2061085 },
    Slovakia: { cz: 'Slovensko', obyv: 5441899 },
  // Finland: { cz: 'Finsko', obyv: 5631751 },
  // Sweden: { cz: 'Švédsko ', obyv: 10182291 },
  };

  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  fetch('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv')
    .then((response) => response.text())
    .then((data) => {
      const euData = d3.csvParse(data).filter((v) => {
        if ((Object.keys(iso).indexOf(v['Country/Region']) > -1) && (v['Province/State'] === '')) {
          return true;
        }
        return false;
      });

      const srs = [];
      euData.forEach((state) => {
        const tmp = [];
        Object.keys(state).forEach((key) => {
          if (isNumeric(key.slice(0, 1))) {
            tmp.push([
              Date.parse(key),
              parseInt(state[key]),
            ]);
          }
        });
        // deagregace
        let deTmp = tmp.map((d, i) => {
          if (i > 0) {
            return [d[0], d[1] - tmp[i - 1][1]];
          }
        });
        deTmp = deTmp.slice(1);
        // rolling 7
        const out = deTmp.map((d, i) => {
          if (i >= 7) {
            const sel = deTmp.slice(i - 7, i);
            const rolling = sel.map((v) => v[1]).reduce((a, b) => a + b) / 7;
            return [d[0], Math.round((rolling / iso[state['Country/Region']].obyv) * 1000000) / 10];
          }
          return null;
        });

        srs.push({
          name: iso[state['Country/Region']].cz,
          data: out.filter((v) => (v !== null) && (v[0] > 1598911199000)),
        });
      });

      const lastDate = srs[0].data.slice(-1)[0][0];

      Highcharts.chart('eu-line', {
        chart: {
          spacing: [10, 0, 15, 0],
        },
        colors: ['#66c2a5', '#e41a1c', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854'],
        title: {
          text: `Zjištění nakažení s covid-19 k ${Highcharts.dateFormat('%d. %m. %Y', lastDate)}`,
        },
        credits: {
          text: 'OWID',
          href: 'https://github.com/owid/covid-19-data/tree/master/public/data',
        },
        subtitle: {
          text: 'klouzavý týdenní průměr, na 100 tis. obyvatel',
        },
        yAxis: {
          title: {
            text: 'průměrně nakažených',
          },
        },
        xAxis: {
          labels: {
            formatter() {
              return Highcharts.dateFormat('%d. %m. %Y', this.value);
            },
          },
        },
        tooltip: {
          shared: true,
          formatter() {
            let ttip = `<b>${Highcharts.dateFormat('%d. %m. %Y', this.x)}</b><br>`;
            this.points.forEach((p) => {
              ttip += `<span style="color: ${p.color};">${p.series.name}</span>: ${p.y}<br>`;
            });
            return ttip;
          },
        },
        series: srs,
      });
    });
}());
