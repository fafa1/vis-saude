import React, { Component } from 'react';
import * as d3 from 'd3';
import * as colorScale from 'd3-scale-chromatic';
import _ from 'lodash';

import * as CONSTANTS from './constants/chart-types';
import './polyfill/polyfill';

import VisControlGroup from './components/vis-control-group/vis-control-group';
import SpiderChart from './components/spider-chart/spider-chart';
import HGraph from './components/hgraph/hgraph';

import data from './data/data.json';

import './App.css';

// Os tipos de visões
const visTypes = [
  {
    value: CONSTANTS.spider,
    label: 'Spider'
  },  
  {
    value: CONSTANTS.radar,
    label: 'Radar'
  },
  {
    value: CONSTANTS.hgraph,
    label: 'hGraph'
  }
];


class App extends Component {
  constructor() {
    super();

    this.state = {
      windowWidth: 0,
      targetDate: new Date('2018-01-01T12:00:01Z'),
      targetDate07: new Date('2017-01-01T12:00:01Z'),
      targetDate06: new Date('2016-01-01T12:00:01Z'),
      activeYear: 2018,
      activeMonth: 1,
      patientData: [],
      dateData: [],
      radarData: [],
      visTypes: visTypes,
      visType: visTypes[1]
    }

    this.state06 = {
      windowWidth: 0,
      targetDate: new Date('2018-01-01T12:00:01Z'),
      targetDate07: new Date('2017-01-01T12:00:01Z'),
      targetDate06: new Date('2016-01-01T12:00:0'),
      activeYear: 2018,
      activeMonth: 1,
      patientData: [],
      dateData: [],
      radarData: [],
      visTypes: visTypes,
      visType: visTypes[2]
    }

    this.color = d3.scaleOrdinal(colorScale.schemeDark2);
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);

    this.mapColorsToData();
    this.initDataState();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  initDataState = () => {
    const patientData = data.map((patient, i) => {
      return {
        id: patient._id,
        label: patient.patient,
        checked: false,
        data: [ this.assembleRadarDataObjectFor(patient._id, this.state.targetDate.getFullYear(), this.state.targetDate.getMonth() + 1) ]
      };
    });
    patientData[0].checked = true;
    this.setState({ patientData }, () => { //setando os dados de patienteData
      // Date data
      const { targetDate } = this.state;
      const { targetDate07 } = this.state;
      const { targetDate06 } = this.state;
      const nextQuarter = new Date(targetDate); // por enquanto n usando
      const lastQuarter = new Date(targetDate);
      const lastQuarterJul = new Date(targetDate);
      const lastQuarterAbr = new Date(targetDate);
      const lastQuarterJan = new Date(targetDate);
      const lastYear = new Date(targetDate);
      const twoYearsAgo = new Date(targetDate);

      const semesLastYear = new Date(targetDate07)
      const semesTwostYear = new Date(targetDate06)

      nextQuarter.setMonth(targetDate.getMonth() + 3);
      lastQuarter.setMonth(targetDate.getMonth() - 3);
      lastQuarterJul.setMonth(targetDate.getMonth() - 6);
      lastQuarterAbr.setMonth(targetDate.getMonth() - 9);
      lastQuarterJan.setMonth(targetDate.getMonth() - 12);

      lastYear.setYear(targetDate.getFullYear() - 1);
      twoYearsAgo.setYear(targetDate.getFullYear() - 2);
      
      semesLastYear.setMonth(targetDate07.getMonth() - 6)
      semesTwostYear.setMonth(twoYearsAgo.getMonth() - 6)

      const dates = [
        {
          date: twoYearsAgo,
          label: 'Ano: 2016'
        },
        {
          date: lastYear,
          label: 'Ano: 2017'
        },        
        {
          date: targetDate,
          label: 'Ano: 2018'
        },
        {
          date: lastQuarterJan,
          label: 'Primeiro Trimestre - 2018'
        },
        {
          date: lastQuarterAbr,
          label: 'Segundo Trimestre - 2018'
        },
        {
          date: lastQuarterJul,
          label: 'Terceiro Trimestre - 2018'
        },
        {
          date: lastQuarter,
          label: 'Ultimo Trimestre - 2018'
        },
        {
          date: semesLastYear,
          label: '1 Semestre 2017'
        },
        /* {
          date: semesTwostYear,
          label: '1 Semestre 2016'
        }, */
        /*{
          date: nextQuarter,
          label: 'Next Quarter'
        }
        */
      ];
      const dateData = dates.map( dateObj => {
        return {
          id: _.uniqueId('date-'),
          date: dateObj.date,
          label: dateObj.label,
          checked: "",
          data: this.getActivepatients().map(patient => { // getFullYear funciona pq do label que esta ligado targetData
            return this.assembleRadarDataObjectFor(patient.id, dateObj.date.getFullYear(), dateObj.date.getMonth() + 1)
          })
        }
      });
      dateData[dateData.length - 2].checked = "checked";
      this.setState({ dateData })

      // Radar data
      if (this.getActivepatients().length) {
        this.setState({ radarData: this.assembleRadarData() });
      } else {
        this.setState({ radarData: [this.assembleRadarDataObjectFor(data[0]._id, this.state.activeYear, this.state.activeMonth)] });
      }
    });
  }

  updateWindowDimensions = () => {
    this.setState({ windowWidth: window.innerWidth });
  }

  assembleRadarData = () => { //os dados sao mostrados basados no ano e mes
    const data = this.getActivepatients().map(patient => {
      return this.assembleRadarDataObjectFor(patient.id, this.state.activeYear, this.state.activeMonth);
    });
    
    return data.sort((a, b) => {
      return b.score - a.score
    });
  }

  mapColorsToData = () => {
    data.forEach((item, i) => {
      item.color = this.color(i);
    });
  }
  // continuara avaliar ...
  assembleRadarDataObjectFor(patientId, year, month) {
    const patientData = data.find(patientItem => patientItem._id === patientId);
    const yearForPatient = patientData.years.find(yearItem => yearItem.year === year);
    const monthForPatient = yearForPatient.months.find(monthItem => monthItem.month === month);
    const valuesForPatient = monthForPatient.values.map(val => {
      return { value: val.value, label: val.measure };
    });

    return {
      id: patientId,
      legendLabel: patientData.patient,
      color: patientData.color,
      values: valuesForPatient,
      //score: parseInt(d3.mean(valuesForPatient, val => val.value) * 100, 10)
    };
  }

  handlePatientControlListChange = (controlList, indexOfChange) => {
    this.setState({ patientData: controlList }, () => {
      const dateData = _.cloneDeep(this.state.dateData);

      dateData.forEach(dateObj => {
        dateObj.data = this.getActivepatients().map(patient => {
          return this.assembleRadarDataObjectFor(patient.id, dateObj.date.getFullYear(), dateObj.date.getMonth() + 1);
        });
      });
      this.setState({
        radarData: this.assembleRadarData(),
        dateData
      });
    });
  }

  handleDateControlListChange = (controlList, indexOfChange) => {
    const newActiveDate = new Date(controlList[indexOfChange].date);
    const newPatientData = _.cloneDeep(this.state.patientData);

    newPatientData.forEach(patient => {
      patient.data = [ this.assembleRadarDataObjectFor(patient.id, newActiveDate.getFullYear(), newActiveDate.getMonth() + 1) ];
    })

    this.setState({
      patientData: newPatientData,
      dateData: controlList,
      activeYear: newActiveDate.getFullYear(),
      activeMonth: newActiveDate.getMonth() + 1
    }, () => {
      this.setState({
        radarData: this.assembleRadarData()
      });
    });
  }

  getActivepatients = () => {
    return this.state.patientData.filter(patient => patient.checked);
  }

  handleVisSelectChange = (visType) => (e) => {
    this.setState({ visType });
  }

  render() {
    const breakpoint = 650;
    const sizeBasedOnWindow = ((this.state.windowWidth / 3) * 2);
    const size = sizeBasedOnWindow > 500 ? 500 : sizeBasedOnWindow;
    const { visType } = this.state;
    const visTypeValue = visType && visType.value;

    return (
      <div className="app app--fixed-header">
        <header className="header header--fixed">
          <h1 className="header__title">
            Visualização de Dados na Saúde
            <span className="header__sub-title">v-1</span>
          </h1>
          
          <nav className="nav">
            <ul className="nav-list">
              <li className="nav-list__item">
                <a href="https://fafa1.github.io/">StarPlot</a>
              </li>
              <li className="nav-list__item">
                <a href="https://github.com/fafa1"></a>
              </li>
            </ul>
          </nav>
        </header>
        <fieldset className="vis-select label">
          <legend>Visualização Radar</legend>
           {this.state.visTypes.map(visType => {
          })}
        </fieldset>
        <div className="vis-container">
          <div className="vis-container__main">
            {
              this.state.visType.value === CONSTANTS.hgraph ?
                <HGraph
                  data={ this.state.radarData } //acredito que seja os dados
                  width={ size }
                  height={ size }
                  type={ CONSTANTS.hgraph}
                  axes={ false }
                  labelOffset={ size < 300 ? 1.2 : 1.1 }
                  levelLabel={ false }
                  pointRadius={ 10 }
                  scoreEnabled={ true } />
               // senão retorna um spiderchart
              :
              <SpiderChart
              data={ this.state.radarData }
              width={ size }
              height={ size }
              type={ this.state.visType.value }
              axes={ true }
              labelOffset={ size < 300 ? 1.2 : 1.1 }
              levelLabel={ true }
              pointRadius={ 4 } />
            }
            <div className="vis-container__controls-container">
              <div className={ `vis-container__date-controls ${sizeBasedOnWindow < breakpoint ? 'vis-container__date-controls--mobile ' : ''}` }>
                <p className="label">Periodo</p>
                <VisControlGroup
                  type="radio"
                  name="date-control"
                  visType={ this.state.visType.value }
                  stacked={ sizeBasedOnWindow < breakpoint ? true : false }
                  blockLabel={ true }
                  controls={ this.state.dateData }
                  onChange={ this.handleDateControlListChange } />
              </div>
              {
                sizeBasedOnWindow < breakpoint ?
                  <div className="vis-container__patient-controls">
                    <p className="label">Pacientes</p>
                    <VisControlGroup
                      type="checkbox"
                      visType={ this.state.visType.value }
                      scoreEnabled={ true }
                      scoreSize="16px"
                      stacked={ true }
                      blockLabel={ true }
                      controls={ this.state.patientData }
                      onChange={ this.handlePatientControlListChange } />
                  </div>
                : null
              }
            </div>
          </div>
          {
            sizeBasedOnWindow >= breakpoint ?
              <div className="vis-container__side-panel">
                <p className="label">Pacientes</p>
                <VisControlGroup
                  type="checkbox"
                  visType={ this.state.visType.value }
                  scoreEnabled={ false }
                  scoreSize="0px"
                  stacked={ true }
                  controls={ this.state.patientData } //dados do paciente
                  onChange={ this.handlePatientControlListChange } />
              </div>
            : null
          }
        </div>
      </div>
    );
  }
}

export default App;
