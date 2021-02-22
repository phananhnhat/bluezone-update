/*
 * @Project Bluezone
 * @Author Bluezone Global (contact@bluezone.ai)
 * @Createdate 04/26/2020, 16:36
 *
 * This file is part of Bluezone (https://bluezone.ai)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Components
import LoadingScreen from './app/main/components/LoadingScreen';
import Home from './app/main/components/MainScreen';
import Welcome from './app/main/components/WelcomeScreen';
import WatchScan from './app/main/components/WatchScanScreen';
import HistoryScan from './app/main/components/HistoryScanScreen';
import NotifyDetail from './app/main/components/NotifyDetail';
import Invite from './app/main/components/InviteScreen';
import PhoneNumberRegisterScreen from './app/main/components/PhoneNumberRegisterScreen';
import PhoneNumberVerifyOTPScreen from './app/main/components/PhoneNumberVerifyOTPScreen';
import HistoryUploadedByOTPScreen from './app/main/components/HistoryUploadedByOTPScreen';
import PageView from './app/main/components/PageViewScreen';
import DetailNew from './app/main/components/DetailNewScreen';
import ViewLog from './app/main/components/ViewLog';
import DownloadLatestVersionScreen from './app/main/components/DownloadLatestVersionScreen';
import Introduction from './app/main/components/IntroductionScreen';
import StartUse from './app/main/components/StartScreen';
import RegisterInfomation from './app/main/components/RegisterInfomationScreen';
import ContactHistory from './app/main/components/ContactHistoryScreen';
// import ScanScreen from './app/main/components/ScanScreen';
import StepCount from './app/main/components/StepCountScreen';
import StepHistory from './app/main/components/StepHistoryScreen';
import SettingScreen from './app/main/components/SettingScreen';
import FAQScreen from './app/main/components/FAQScreen';
import moment from 'moment';
import ContextProvider from './LanguageContext';
import LanguageProvider from './app/base/LanguageProvider';
import { translationMessages } from './app/i18n';
import { remoteMessageListener } from './app/core/push';
import decorateMainAppStart from './app/main/decorateMainAppStart';
import { navigationRef, navigate } from './RootNavigation';
import { registerMessageHandler } from './app/core/fcm';
import CustomDrawerContent from './app/main/components/CustomDrawerContent';
// Api
import { registerResourceLanguageChange } from './app/core/language';
import { enableScreens } from 'react-native-screens';

enableScreens();

const isLastStepOfWizard = name => {
  return wizard.indexOf(name) + 1 === wizard.length;
};

const nextStepName = name => {
  if (wizard.indexOf(name) + 1 >= wizard.length) {
    throw new Error('nexStepName: Khong ton tai buoc tiep theo');
  }
  return wizard[wizard.indexOf(name) + 1];
};

const prevStepName = name => {
  if (wizard.indexOf(name) - 1 < 0) {
    throw new Error('prevStepName: Khong ton tai buoc tiep theo');
  }
  return wizard[wizard.indexOf(name) - 1];
};

// Const
import { NOTIFICATION_TYPE } from './app/const/notification';
const LOADING_SCREEN_NAME = 'LoadingScreen';
const INTRODUTION_WIZARD_NAME = 'IntrodutionWizard';
const PHONE_NUMBER_REGISTER_WIZARD_NAME = 'PhoneNumberRegisterWizard';
const PHONE_NUMBER_VERITY_OTP_WIZARD_NAME = 'PhoneNumberVerifyOTPWizard';
const REGISTER_INFOMATION_WIZARD_NAME = 'RegisterInfomationWizard';
const START_USE_WIZARD_NAME = 'StartUseWizard';
const WELCOME_WIZARD_NAME = 'WelcomeWizard';
let wizard = [
  LOADING_SCREEN_NAME,
  INTRODUTION_WIZARD_NAME,
  PHONE_NUMBER_REGISTER_WIZARD_NAME,
  PHONE_NUMBER_VERITY_OTP_WIZARD_NAME,
  REGISTER_INFOMATION_WIZARD_NAME,
  START_USE_WIZARD_NAME,
];
const LOADING_INITIAL_ROUTE = LOADING_SCREEN_NAME;
const MAIN_INITIAL_ROUTE = 'Home';
const WELCOME_INITIAL_ROUTE = WELCOME_WIZARD_NAME;

import {
  registerNotificationOpened,
  registerInitialNotification,
  removeDeliveredNotification,
} from './app/core/fcm';
import { getIsFirstLoading, setIsFirstLoading, setFirstTimeOpen, getFirstTimeOpen, setFirstTimeSetup } from './app/core/storage';
import ProfileScreen from './app/main/components/ProfileScreen';
import BmiScreen from './app/main/components/ProfileScreen/BmiScreen';
import ResultBmiScreen from './app/main/components/ProfileScreen/ResultBmiScreen';

// animation transaction
import { TransitionSpecs, HeaderStyleInterpolators } from '@react-navigation/stack';
import { Platform } from 'react-native';
import DemoTarget from './app/main/components/StepCountScreen/DemoTarget';

const MyTransition = {
  gestureDirection: 'horizontal',
  transitionSpec: {
    // open: TransitionSpecs.TransitionIOSSpec,
    // close: TransitionSpecs.TransitionIOSSpec,
    open: {
      animation: 'timing',
      config: {
        duration: 500
      }
    },
    close: {
      animation: 'timing',
      config: {
        duration: 500
      }
    },
  },
  headerStyleInterpolator: HeaderStyleInterpolators.forFade,
  cardStyleInterpolator: ({ current, next, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: Platform.OS == 'ios' ? [layouts.screen.height / 2 - 104, 0] : [layouts.screen.height / 2 - 64, 0], // marginbottom = 27, height = 50
            }),
          },
          {
            scale: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
      },
    };
  },
}

// Components
const HomeScreen = decorateMainAppStart(Home);
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      isHome: false,
      isFirstLoading: '',
      translationMessagesState: translationMessages,
    };

    this.onResourceLanguageChange = this.onResourceLanguageChange.bind(this);
    this.onChangeStackHome = this.onChangeStackHome.bind(this);

    registerResourceLanguageChange(this.onResourceLanguageChange);

    this.LoadingProps = propsComponent => (
      <LoadingScreen
        name={LOADING_SCREEN_NAME}
        onFinished={this.handleFinishedWork}
        {...propsComponent}
      />
    );

    this.IntroducationProps = propsComponent => (
      <Introduction
        name={INTRODUTION_WIZARD_NAME}
        onFinished={this.handleFinishedWork}
        {...propsComponent}
      />
    );

    this.PhoneNumberRegisterProps = propsComponent => (
      <PhoneNumberRegisterScreen
        name={PHONE_NUMBER_REGISTER_WIZARD_NAME}
        onFinished={this.handleFinishedWork}
        {...propsComponent}
      />
    );

    this.PhoneNumberVerifyOTPProps = propsComponent => (
      <PhoneNumberVerifyOTPScreen
        name={PHONE_NUMBER_VERITY_OTP_WIZARD_NAME}
        onFinished={this.handleFinishedWork}
        {...propsComponent}
      />
    );

    this.RegisterInfomationProps = propsComponent => (
      <RegisterInfomation
        name={REGISTER_INFOMATION_WIZARD_NAME}
        onFinished={this.handleFinishedWork}
        {...propsComponent}
      />
    );

    this.StartUseProps = propsComponent => (
      <StartUse
        name={START_USE_WIZARD_NAME}
        onFinished={this.handleFinishedWork}
        {...propsComponent}
      />
    );

    this.WelcomeProps = propsComponent => (
      <Welcome
        name={WELCOME_WIZARD_NAME}
        onFinished={this.onChangeStackHome}
        {...propsComponent}
      />
    );

    this.HomeProps = propsComponent => (
      <HomeScreen name={MAIN_INITIAL_ROUTE} {...propsComponent} />
    );
  }

  async componentDidMount() {
  //   // Check trạng thái lần đầu tiên vào app => hien: Dang khoi tao. Lan sau: Dang dong bo
    const dateInstall = moment().format('yyyy-MM-DD')

    const firstOpenApp = await getFirstTimeOpen();
    if (firstOpenApp == null) {
      setFirstTimeSetup()
      setFirstTimeOpen(dateInstall)
    }
    // const isFirstLoading = await getIsFirstLoading();
    // this.setState({ isFirstLoading: isFirstLoading === null });
    // if (isFirstLoading === null) {
    //   setIsFirstLoading(false);
    // }

  //   this.removeNotificationOpenedListener = registerNotificationOpened(
  //     this.onNotificationOpened,
  //   );

  //   // Check whether an initial notification is available
  //   registerInitialNotification(this.onNotificationOpened);

  //   this.removeMessageListener = registerMessageHandler(async notifyObj => {
  //     // TODO can sua ve dung dev trong server.js het => Khong duoc, __DEV__ nay chi dung cho debugger thoi
  //     if (__DEV__) {
  //       alert(JSON.stringify(notifyObj));
  //     }
  //     await remoteMessageListener(notifyObj);
  //   });
  }

  componentWillUnmount() {
    this.removeNotificationOpenedListener &&
      this.removeNotificationOpenedListener();
    this.removeMessageListener && this.removeMessageListener();
  }

  /**
   * Xu ly khi 1 buoc trong wizard ket thuc
   * @param name
   * @param result la ket qua cua buoc truoc co the chuyen cho buoc sau. VD: PhoneNumberRegister tra ve result = {phoneNumber: '0988888888'}
   * @param gotoMainScreen
   * @param goBack
   */
  handleFinishedWork = (
    name = '',
    result = {},
    gotoMainScreen = false,
    goBack = false,
  ) => {
    const { isFirstLoading, loading } = this.state;

    console.log(
      'handleFinishedWork',
      name,
      gotoMainScreen,
      goBack,
      loading,
      isFirstLoading,
    );

    if (goBack) {
      navigate(prevStepName(name));
      return;
    }

    // Neu khong phai la lan dau vao app hoac khong the hoan thanh 1 buoc trong wizard hoac la buoc cua wizard thi chuyen luon vao giao dien chinh.
    if (!isFirstLoading || isLastStepOfWizard(name)) {
      this.setState({ loading: false });
      return;
    }

    // Trường hợp lấy TokenFirebase === null thì check wizard còn 3 màn hình.
    if (gotoMainScreen) {
      wizard = [
        LOADING_SCREEN_NAME,
        INTRODUTION_WIZARD_NAME,
        START_USE_WIZARD_NAME,
      ];
      name =
        name !== LOADING_SCREEN_NAME
          ? INTRODUTION_WIZARD_NAME
          : LOADING_SCREEN_NAME;
    }

    navigate(nextStepName(name), result);
  };

  onChangeStackHome() {
    this.setState({ isHome: true });
  }

  onResourceLanguageChange(resource) {
    this.setState({ translationMessagesState: resource });
  }

  onNotificationOpened = remoteMessage => {
    const { loading } = this.state;

    if (!remoteMessage) {
      return;
    }
    const obj = remoteMessage.notification;
    if (
      (obj && obj.data._group === 'INFO') ||
      (obj && obj.data._group === NOTIFICATION_TYPE.SEND_SHORT_NEWS)
    ) {
      navigate('NotifyDetail', {
        item: {
          title: obj.title,
          bigText: obj.body,
          timestamp: obj.data.timestamp,
          text: obj.data.text,
          largeIcon: obj.data.largeIcon,
        },
      });
    } else if (obj && obj.data._group === 'MOBILE') {
      if (loading) {
        navigate(PHONE_NUMBER_REGISTER_WIZARD_NAME);
      } else {
        navigate('PhoneNumberRegisterScreen');
      }
    } else if (
      obj &&
      (obj.data._group === NOTIFICATION_TYPE.SEND_URL_NEW ||
        obj.data._group === NOTIFICATION_TYPE.SEND_HTML_NEWS)
    ) {
      if (obj.data._group === NOTIFICATION_TYPE.SEND_HTML_NEWS) {
        navigate('DetailNew', {
          item: {
            title: obj.title,
            data: obj?.data?.data,
          },
        });
      } else {
        navigate('PageView', {
          item: {
            title: obj.title,
            data: obj?.data?.data,
          },
        });
      }
    }
    // getNotifications().cancelNotification(remoteMessage.notification._notificationId);
    removeDeliveredNotification(remoteMessage.notification._notificationId);
    console.log(
      'Notification caused app to open from background state:',
      remoteMessage.notification._notificationId,
    );
  };

  HomeStack = currentProps => () => {
    const currentComponent = currentProps.currentComponent;
    const { loading, isHome } = currentProps.currentComponent.state;
    return loading ? (
      <Stack.Navigator
        id="auth"
        headerMode="none"
        mode="card"
        initialRouteName={LOADING_INITIAL_ROUTE}>
        <Stack.Screen name="Profile2" component={ProfileScreen} />
        <Stack.Screen
          name={LOADING_INITIAL_ROUTE}
          component={currentComponent.LoadingProps}
        />
        <Stack.Screen
          name={INTRODUTION_WIZARD_NAME}
          component={currentComponent.IntroducationProps}
        />
        <Stack.Screen
          name={PHONE_NUMBER_REGISTER_WIZARD_NAME}
          component={currentComponent.PhoneNumberRegisterProps}
        />
        <Stack.Screen
          name={PHONE_NUMBER_VERITY_OTP_WIZARD_NAME}
          component={currentComponent.PhoneNumberVerifyOTPProps}
        />
        <Stack.Screen
          name={REGISTER_INFOMATION_WIZARD_NAME}
          component={currentComponent.RegisterInfomationProps}
        />
        <Stack.Screen
          name={START_USE_WIZARD_NAME}
          component={currentComponent.StartUseProps}
        />
        <Stack.Screen
          path="NotifyDetail"
          name="NotifyDetail"
          component={NotifyDetail}
        />

        <Stack.Screen name="Profile" component={ProfileScreen} path={'Profile'} />
        <Stack.Screen name="Bmi" component={BmiScreen} />
        <Stack.Screen name="resultBmi" component={ResultBmiScreen}
          options={{
            ...MyTransition
          }} />
        <Stack.Screen name={'stepCount'} component={StepCount} path={'stepCount'} />
        <Stack.Screen name={'stepHistory'} component={StepHistory} />
        <Stack.Screen name={'settingScreen'} component={SettingScreen} />
        <Stack.Screen name={'DemoTarget'} component={DemoTarget} />

      </Stack.Navigator>
    ) : !isHome ? (
      <Stack.Navigator
        id="Welcome"
        headerMode="none"
        mode="card"
        initialRouteName={WELCOME_INITIAL_ROUTE}>
        {/* <Stack.Screen
                  name={'stepCount'}
                  component={StepCount}
                ></Stack.Screen> */}
        <Stack.Screen
          name={WELCOME_INITIAL_ROUTE}
          component={currentComponent.WelcomeProps}
        />
        <Stack.Screen name="Profile" component={ProfileScreen} path={'Profile'} />
        <Stack.Screen name="Bmi" component={BmiScreen} />
        <Stack.Screen name="resultBmi" component={ResultBmiScreen}
          options={{
            ...MyTransition
          }} />
        <Stack.Screen name="Profile2" component={ProfileScreen} />
        <Stack.Screen name={'stepCount'} component={StepCount} path={'stepCount'} />
        <Stack.Screen name={'stepHistory'} component={StepHistory} />
        <Stack.Screen name={'settingScreen'} component={SettingScreen} />
        <Stack.Screen name={'DemoTarget'} component={DemoTarget} />
      </Stack.Navigator>
    ) : (
          <Stack.Navigator
            id="home"
            headerMode="none"
            mode="card"
            initialRouteName={MAIN_INITIAL_ROUTE}>
            {/* <Stack.Screen
                      name={'stepCount'}
                      component={StepCount}
                    > */}
            {/* </Stack.Screen> */}
            <Stack.Screen
              name={MAIN_INITIAL_ROUTE}
              component={currentComponent.HomeProps}
            />

            <Stack.Screen name="WatchScan" component={WatchScan} />
            <Stack.Screen name="HistoryScan" component={HistoryScan} />
            <Stack.Screen
              name="NotifyDetail"
              component={NotifyDetail}
              path="NotifyDetail"
            />
            <Stack.Screen name="Invite" component={Invite} />
            <Stack.Screen
              name="PhoneNumberRegisterScreen"
              component={PhoneNumberRegisterScreen}
            />
            <Stack.Screen
              name="PhoneNumberVerifyOTPScreen"
              component={PhoneNumberVerifyOTPScreen}
            />
            <Stack.Screen
              name="RegisterInfomation"
              component={RegisterInfomation}
            />
            <Stack.Screen name="PageView" component={PageView} />
            <Stack.Screen name="DetailNew" component={DetailNew} />
            <Stack.Screen
              name="HistoryUploadedByOTP"
              component={HistoryUploadedByOTPScreen}
            />
            <Stack.Screen name="ViewLog" component={ViewLog} />
            <Stack.Screen
              name="DownloadLatestVersionScreen"
              component={DownloadLatestVersionScreen}
            />
            <Stack.Screen name="ContactHistory" component={ContactHistory} />
            {/*<Stack.Screen name="ScanScreen" component={ScanScreen} />*/}
            <Stack.Screen name="Welcome" component={Welcome} />
            <Stack.Screen name="FAQScreen">
              {props => <FAQScreen {...props} showBack={true} />}
            </Stack.Screen>
            <Stack.Screen name={'stepCount'} component={StepCount} path={'stepCount'} />
            <Stack.Screen name={'stepHistory'} component={StepHistory} />
            <Stack.Screen name={'settingScreen'} component={SettingScreen} />
            <Stack.Screen name={'DemoTarget'} component={DemoTarget} />

            <Stack.Screen name="Profile2" component={ProfileScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} path={'Profile'} />
            <Stack.Screen name="Bmi" component={BmiScreen} />
            <Stack.Screen name="resultBmi" component={ResultBmiScreen}
              options={{
                ...MyTransition
              }} />
          </Stack.Navigator>
        );
  };

  RightDrawer = props => {
    return (
      <Drawer.Navigator
        currentComponent={props.currentComponent}
        initialRouteName="HomeStack"
        drawerPosition="right"
        drawerStyle={{
          width: '80%'
        }}
        edgeWidth={0}
        drawerContent={props => <CustomDrawerContent {...props} />}>
        {/* <Home /> */}
        <Drawer.Screen
          path={'HomeStack'}
          name={'HomeStack'}
          currentComponent={props.currentComponent}
          component={this.HomeStack(props)}
        />
      </Drawer.Navigator>
    );
  };

  // npx uri-scheme open mic.bluezone://bluezone/HomeStack/stepCount --android
  render() {
    const { translationMessagesState, loading, isHome } = this.state;
    const linking = {
      prefixes: ['http://bluezone.mic', 'https://bluezone.mic', 'mic.bluezone://bluezone'],
    };

    return (
      <ContextProvider>
        <LanguageProvider messages={translationMessagesState}>
          <NavigationContainer ref={navigationRef} linking={linking}>
            <this.RightDrawer currentComponent={this} />
          </NavigationContainer>
        </LanguageProvider>
      </ContextProvider>
    );
  }
}

export default App;
