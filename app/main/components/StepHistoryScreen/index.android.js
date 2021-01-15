import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  processColor,
  BackHandler,
} from 'react-native';
// import { BarChart } from 'react-native-charts-wrapper';
import { isIPhoneX } from '../../../core/utils/isIPhoneX';

import { Dimensions } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { ScrollView } from 'react-native-gesture-handler';
// import { LineChart, Grid } from 'react-native-svg-charts'
import moment from 'moment';
import 'moment/locale/vi'; // without this line it didn't work
import Header from '../../../base/components/Header';
import BarChart from './BarChart';
import message from '../../../core/msg/stepCount';
import { injectIntl, intlShape } from 'react-intl';
import * as fontSize from '../../../core/fontSize';
import { useRoute } from '@react-navigation/native';
import dateUtils from 'mainam-react-native-date-utils';
import BartChartHistory from './BarChart/BartChartHistory';

import { objectOf } from 'prop-types';
import { getProfile, getStepChange } from '../../../core/storage';
import { getAbsoluteMonths, getAllDistance, gender, getDistances } from '../../../core/calculation_steps';
import { getListHistory, removeAllHistory } from '../../../core/db/SqliteDb';
import BarChartConvert from './BarChart/BarChartConvert';
Date.prototype.getWeek = function (dowOffset) {
  /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */

  dowOffset = typeof dowOffset == 'int' ? dowOffset : 0; //default dowOffset to zero
  var newYear = new Date(this.getFullYear(), 0, 1);
  var day = newYear.getDay() - dowOffset; //the day of week the year begins on
  day = day >= 0 ? day : day + 7;
  var daynum =
    Math.floor(
      (this.getTime() -
        newYear.getTime() -
        (this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) /
      86400000,
    ) + 1;
  var weeknum;
  //if the year starts before the middle of a week
  if (day < 4) {
    weeknum = Math.floor((daynum + day - 1) / 7) + 1;
    if (weeknum > 52) {
      nYear = new Date(this.getFullYear() + 1, 0, 1);
      nday = nYear.getDay() - dowOffset;
      nday = nday >= 0 ? nday : nday + 7;
      /*if the next year starts before the middle of
              the week, it is week #1 of that year*/
      weeknum = nday < 4 ? 1 : 53;
    }
  } else {
    weeknum = Math.floor((daynum + day - 1) / 7);
  }
  return weeknum;
};
const screenWidth = Dimensions.get('window').width;
const StepCount = ({ props, intl, navigation }) => {
  const route = useRoute();

  const { formatMessage } = intl;

  const [selectDate, setSelectDate] = useState(true);
  const [selectWeek, setSelectWeek] = useState(false);
  const [selectMonth, setSelectMonth] = useState(false);
  const offset = new Date().getTimezoneOffset();
  const [time, setTime] = useState(0);
  const [countTime, setCountTime] = useState(0);
  const [countTimeHour, setCountTimeHour] = useState(0);
  const [countStep, setCountStep] = useState(null);
  const [countRest, setCountRest] = useState(0);
  const [countCarlo, setCountCarlo] = useState(0);
  const [distant, setDistant] = useState(0);
  const [dataChart, setDataChart] = useState([]);
  const [maxDomain, setMaxDomain] = useState(10000)
  const [startTime, setStartTime] = useState(new moment(new Date()).startOf('year').unix())
  const [endTime, setEndTime] = useState(new moment(new Date()).subtract(1, 'days').unix())
  const [listStepToday, setListStepToday] = useState(undefined)
  const [listTotalSteps, setListTotalSteps] = useState([])

  const [widthChart, setWidthChart] = useState(screenWidth)

  useEffect(() => {
    getDataHealth(
      'day',
    );
    setSelectDate(true);
    setSelectMonth(false);
    setSelectWeek(false);
  }, []);

  const onSetSelect = type => async () => {
    if (type == 1) {
      getDataHealth(
        'day',
      );
      setSelectDate(true);
      setSelectMonth(false);
      setSelectWeek(false);
      return;
    }
    if (type == 2) {
      getDataHealth(
        'week',
      );
      setSelectDate(false);
      setSelectMonth(false);
      setSelectWeek(true);
      return;
    }
    if (type == 3) {
      getDataHealth(
        'month',
      );
      setSelectDate(false);
      setSelectMonth(true);
      setSelectWeek(false);
      return;
    }
  };
  const getDataHealth = async (type) => {
    // await removeAllHistory()

    let stepToday = listStepToday
    let step = [...listTotalSteps]

    if (!stepToday) {
      let result = await getDistances();
      let time = result?.time || 0;

      let start = new moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).unix()
      let jj = JSON.stringify({
        step: result?.step || 0,
        distance: result?.distance || 0,
        calories: result?.calories || 0,
        time: time
      })
      stepToday = {
        starttime: start,
        resultStep: jj
      }
      setListStepToday(stepToday)
    }
    if (step.length == 0) {
      step = await getListHistory(startTime, endTime)
      step.push(stepToday)
      setListTotalSteps(step)
    }

    try {
      if (!step || step.length <= 0) {
        return
      }

      let list = [];
      if (type == 'day') {
        list = step.map(item => {
          let tmp = JSON.parse(item?.resultStep || {})
          return {
            x: (new moment().isSame(new moment.unix(item?.starttime), 'days')) ?
              'Hôm nay' :
              moment.unix(item?.starttime).format('DD/MM'),
            y: tmp?.step,
            results: tmp
          }
        });
      }
      else if (type == 'month') {
        let currentMonth = moment().month();
        const groups = step.reduce((acc, current) => {
          const monthYear = moment.unix(current?.starttime).month();
          if (!acc[monthYear]) {
            acc[monthYear] = [];
          }
          acc[monthYear].push(current);
          return acc;
        }, {});

        for (const [key, value] of Object.entries(groups)) {
          let results = value.reduce((t, v) => {
            let tmp = JSON.parse(v?.resultStep)
            return {
              steps: (t?.steps || 0) + (tmp?.step || 0),
              calories: (t?.calories || 0) + (tmp?.calories || 0),
              distance: (t?.distance || 0) + (tmp?.distance || 0),
              time: (t?.time || 0) + (tmp?.time || 0),
            }
          }, {})
          // let label = `Tháng\n${parseInt(key) + 1}`
          let label = `Tháng\n${key < currentMonth ? (parseInt(key) + 1) : 'này'}`
          list.push({
            x: label,
            y: results?.steps || 0,
            results: results
          })
        }
      } else if (type == 'week') {
        const groups = step.reduce((acc, current) => {
          const yearWeek = moment.unix(current?.starttime).week();
          if (!acc[yearWeek]) {
            acc[yearWeek] = [];
          }
          acc[yearWeek].push(current);
          return acc;
        }, {});

        let currentTime = moment();
        for (const [key, value] of Object.entries(groups)) {
          let results = value.reduce((t, v) => {
            let tmp = JSON.parse(v?.resultStep)
            return {
              steps: (t?.steps || 0) + (tmp?.step || 0),
              calories: (t?.calories || 0) + (tmp?.calories || 0),
              distance: (t?.distance || 0) + (tmp?.distance || 0),
              time: (t?.time || 0) + (tmp?.time || 0),
            }
          }, {})
          let startWeek = moment.unix(value[0]?.starttime).startOf('isoWeek')
          let endWeek = moment.unix(value[0]?.starttime).endOf('isoWeek')
          let valueEnd = (endWeek.isAfter(currentTime) || endWeek.isSame(currentTime)) ? 'nay' : `${endWeek.format('DD')}`
          let label = `${startWeek.format('DD')} - ${valueEnd}\nT ${endWeek.format('MM')}`
          list.push({
            x: label,
            y: results?.steps || 0,
            results: results,
          })
        }
      }
      let max = Math.max.apply(Math, list.map(function (o) { return o.y; }))
      setMaxDomain(max + 1000)
      if (list.length <= 7) {
        setWidthChart(screenWidth)
      } else {
        let tmp = (screenWidth - (type == 'month' ? 30 : type == 'day' ? 60 : 60)) / 6;
        let widthTmp = tmp * (list.length - 1)
        setWidthChart(widthTmp)
      }
      console.log('listlistlist', list)
      setDataChart(list);
    } catch (error) { }
  };
  const onBack = () => {
    try {
      navigation.pop();
    } catch (e) { }
  };

  const updateDistance = (result) => {
    console.log('updateDistanceupdateDistance', result)
    let time = result?.time || 0;
    let h = parseInt(time / 3600)
    let m = parseInt((time % 3600) / 60)
    // let timeString = ''
    // if (h > 0) {
    //   timeString += `${h} - Giờ`
    //   if (m > 0) {
    //     timeString += `,\n${m} - Phút`
    //   }
    // } else
    //   timeString += `${m}\nPhút`
    setDistant(result?.distance || 0);
    setCountCarlo(result?.calories || 0);
    // setTime(timeString);
    setCountTime(m)
    setCountTimeHour(h)
    setCountStep(result?.steps || result?.step || 0);

  }

  const renderChart = useMemo(() => {
    if (dataChart.length) {
      return (
        <View>
          <Text style={{
            fontSize: 16,
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: 14
          }}>{new moment().format('YYYY')}</Text>
          <BarChartConvert
            data={dataChart}
            maxDomain={maxDomain}
            onGetDataBySelect={updateDistance}
            widthChart={widthChart} />
        </View>
      )
    }
  }, [dataChart])

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        <Header
          // onBack={onBack}
          colorIcon={'#FE4358'}
          title={formatMessage(message.stepCountHistory)}
          styleHeader={styles.header}
          styleTitle={{
            color: '#000',
            fontSize: fontSize.bigger,
          }}
        />
        <View style={[styles.viewLineChart, { marginTop: 16 }]}>
          {/* {dataChart?.length ? <BartChartHistory
            data={dataChart} /> : null} */}
          {renderChart}
        </View>

        <View style={styles.dataHealth}>
          <View style={styles.viewImgData}>
            <Image
              style={styles.img}
              source={require('./images/ic_step.png')}
            />
            <Text style={styles.txData}>{`${countStep || 0}`}</Text>
            <Text style={styles.txUnit}>{`${formatMessage(
              message.stepsNormal,
            )}`}</Text>
          </View>
          <View style={styles.viewImgData}>
            <Image
              style={styles.img}
              source={require('./images/ic_distance.png')}
            />
            <Text style={styles.txData}>{parseFloat(distant || 0).toFixed(3)}</Text>
            <Text style={styles.txUnit}>{`km`}</Text>
          </View>
          <View style={styles.viewImgData}>
            <Image
              style={styles.img}
              source={require('./images/ic_calories.png')}
            />
            <Text style={styles.txData}>{Number(countCarlo || 0).toFixed(0)}</Text>
            <Text style={styles.txUnit}>{`kcal`}</Text>
          </View>
          <View style={styles.viewImgData}>
            <Image
              style={styles.img}
              source={require('./images/ic_time.png')}
            />

            {
              countTimeHour > 0 ? (
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={[styles.txData, {
                      marginRight: 4
                    }]}>{countTimeHour}</Text>
                    <Text style={styles.txUnit}>{formatMessage(message.hour)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={[styles.txData, {
                      marginRight: 4
                    }]}>{countTime}</Text>
                    <Text style={styles.txUnit}>{formatMessage(message.minute)}</Text>
                  </View>
                </View>
              ) : (
                  <View>
                    <Text style={styles.txData}>{countTime}</Text>
                    <Text style={styles.txUnit}>{formatMessage(message.minute)}</Text>
                  </View>
                )
            }

          </View>
        </View>
      </ScrollView>
      <View style={styles.viewBtn}>
        <TouchableOpacity
          onPress={onSetSelect(1)}
          style={[styles.btnDate, selectDate ? styles.bgRed : {}]}>
          <Text style={[styles.txDate, selectDate ? {} : styles.txGray]}>
            {formatMessage(message.day)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSetSelect(2)}
          style={[styles.btnDate, selectWeek ? styles.bgRed : {}]}>
          <Text style={[styles.txDate, selectWeek ? {} : styles.txGray]}>
            {formatMessage(message.week)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSetSelect(3)}
          style={[styles.btnDate, selectMonth ? styles.bgRed : {}]}>
          <Text style={[styles.txDate, selectMonth ? {} : styles.txGray]}>
            {formatMessage(message.month)}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 30,
  },
  bgRed: {
    backgroundColor: '#fe4358',
  },
  header: {
    backgroundColor: '#ffffff',
    marginTop: isIPhoneX ? 0 : 20,
  },
  txGray: {
    color: '#a1a1a1',
  },
  btnDate: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50
  },
  img: {
    width: 64,
    height: 64
  },
  chart: {
    flex: 1,
  },
  viewLineChart: {
    marginTop: 30,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  viewHeight: {
    height: 10,
  },
  viewImgData: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  txData: {
    color: '#fe4358',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  txUnit: {
    fontSize: 14,
    textAlign: 'center',
    color: '#fe4358',
    marginTop: 5,
  },
  dataHealth: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 30,
    marginTop: 20,
    borderTopColor: '#00000010',
    borderBottomColor: '#00000010',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 20,
  },

  viewCircular: {
    paddingVertical: 30,
    marginTop: 20,
    alignItems: 'center',
    marginHorizontal: 20,
    justifyContent: 'center',
  },
  viewBorderCircular: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 200,
  },
  circular: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewFill: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  txCountStep: {
    color: '#fe4358',
    fontSize: 37,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  txCountTarget: {
    color: '#949494',
    fontSize: 14,
  },
  chart: {
    flex: 1,
    height: 300,
  },
  txDate: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700'
  },
  txtYear: {
    fontSize: fontSize.normal,
    fontWeight: 'bold',
    paddingBottom: 5,
    alignSelf: 'center',
  },
});
StepCount.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(StepCount);
