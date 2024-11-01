/**
 * Copyright (c) UNA, Inc - https://unacms.com
 * MIT License - https://opensource.org/licenses/MIT
 *
 * @format
 * @flow strict-local
 */

import React, { Component, useState } from 'react';
import OneSignal from 'react-native-onesignal';
import SplashScreen from 'react-native-splash-screen';
import Swiper from 'react-native-deck-swiper';
import { WebView } from 'react-native-webview';
import axios from 'axios';


import {
    Platform,
    StyleSheet,
    Linking,
    BackHandler,
    ActivityIndicator,
    Alert,
    Appearance,
    PermissionsAndroid,
    NativeModules,
    TextInput,
    ScrollView,
    TouchableOpacity,
    ImageBackground
} from 'react-native';
import {
    Link,
    Text,
    HStack,
    Center,
    Heading,
    Switch,
    useColorMode,
    NativeBaseProvider,
    VStack,
    Box,
    View,
    Drawer,
    Image,
    Button,
    Input,
    Icon,
    IconButton,
    Pressable,
    StatusBar,
    SearchIcon,
    Checkbox,
} from 'native-base';
import NativeBaseIcon from './src/components/NativeBaseIcon';
import { Path, G } from "react-native-svg";


/*
import RNIap, {
  purchaseErrorListener,
  purchaseUpdatedListener,
  type ProductPurchase,
  type PurchaseError
} from 'react-native-iap';

import JitsiMeet, { JitsiMeetView } from 'react-native-jitsi-meet';
import VideoCall from './VideoCall';
*/
import ErrorPage from './ErrorPage';
import * as Icons from './Icons';
import { themeDark, themeLight, useTheme } from './Theme';

import { version } from './package.json';

type Props = {};

const BASE_URL = 'https://collaborito.net/'; // site URL
const MIX_LIGHT = '0'; // template styles mix for light mode
const MIX_DARK = '0'; // template styles mix for dark mode
const TEMPLATE = 'artificer'; // template name
const TITLE = 'Collaborito| callaborito.com'; // homepage title
const ONESIGNALAPPID = ''; // you can obtain one from https://onesignal.com/
const PAYMENTS_CALLBACK = ''; // empty string means payment functionality is disabled

//todo: questionnarie - handle input change - handle submit - return

const Questionnaire = ({ onClose }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        city: '',
        country: '',
        jobTitle: '',
        socialLinks: {
            linkedin: '',
            instagram: '',
            facebook: '',
            twitter: '',
            youtube: ''
        },
        interests: [],
        goals: [],
        projectDescription: '',
        projectHelp: [],
        skillsNeeded: []
    });



    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Function to handle checkbox changes
    const handleCheckboxChange = (field, value) => {
        setFormData(prevData => {
            const updatedValues = prevData[field].includes(value)
                ? prevData[field].filter(item => item !== value) // Remove if already selected
                : [...prevData[field], value]; // Add if not selected
            return { ...prevData, [field]: updatedValues };
        });
    };

    // Rendering checkboxes
    const renderCheckboxes = (field, options) => (
        options.map(option => (
            <div key={option}>
                <input
                    type="checkbox"
                    id={option}
                    checked={formData[field].includes(option)}
                    onChange={() => handleCheckboxChange(field, option)}
                />
                <label htmlFor={option}>{option}</label>
            </div>
        ))
    );
    const questions = [
        // Pages 1-7
        {
            field: ['firstName', 'lastName'],
            prompt: "What's your name?",
            placeholders: ['First name', 'Last name']
        },
        {
            field: ['city', 'country'],
            prompt: "Where are you based?",
            placeholders: ['City', 'Country']
        },
        {
            field: 'jobTitle',
            prompt: "What's your job title?",
            placeholder: "Enter your job title"
        },
        {
            field: 'socialLinks',
            prompt: "Please enter any social media links you’d like to share.",
            placeholders: ['LinkedIn', 'Instagram', 'Facebook', 'Twitter', 'YouTube']
        },
        {
            field: 'interests',
            prompt: "What topics are you interested in?",
            sidePrompt: "Add a few to make it easier to find people and projects you might find interesting.",
            type: 'search',
            options: ['Music', 'Education', 'Business', 'Sports', 'Entrepreneurship', 'Investing & Finance', 'Science & Tech', 'Social Causes', 'Fashion', 'Art', 'Travel', 'Fitness', 'Food', 'Gaming', 'Parenting', 'Health & Wellness', 'Movies', 'Books', 'Writing', 'Dancing', 'Pets', 'AI', 'Reading', 'Data Science', 'Product Design', 'Robotics', 'Marketing', 'Real Estate']
        },
        // Page 8 - Goals
        //For both pages (9 and 10), the conditional property checks if the goals field includes the required combinations (e.g., 1st & 3rd, 2nd & 3rd, etc.).
        {
            field: 'goals',
            prompt: "What are your goals?",
            options: [
                "Find a co-founder to join my idea",
                "Find people to help with my project",
                "Contribute my skills to an existing project",
                "Explore new ideas"
            ],
            type: 'checkbox', // To handle the checkbox selection
            render: () => renderCheckboxes('goals', ["Find a co-founder to join my idea", "Find people to help with my project", "Contribute my skills to an existing project", "Explore new ideas"])
        },
        // Page 9-1 - Only show if the user selects the first or second option on the Goals page
        {
            field: 'projectDescription',
            prompt: "Please describe your project/idea in 1-2 sentences.",
            placeholder: "E.g. A business collecting musical instruments, fixing them up, and donating them to school children.",
//            conditional: (formData) =>
//                (formData.goals.includes('Find a co-founder to join my idea') &&
//                  !(formData.goals.includes('Contribute my skills to an existing project') ||
//                    formData.goals.includes('Explore new ideas')))||
//                formData.goals.includes('Find people to help with my project') &&
//               !(formData.goals.includes('Contribute my skills to an existing project')) &&
//                !(formData.goals.includes('Explore new ideas'))
            conditional: (formData) => formData.goals.includes('Find a co-founder to join my idea') || formData.goals.includes('Find people to help with my project')
        },
        // Page 9-2 - Only show if the user selects the first or second option on the Goals page
        {
            field: 'projectHelp',
            prompt: "What help do you need on your project?",
            type: 'checkbox',
            options: ['Full-Time Work', 'Part-Time Work', 'Internship', 'Volunteering or Probono', 'Co-Founder', 'Advice & Mentorship', 'Feedback & Research Participation'],
            conditional: (formData) => formData.goals.includes('Find a co-founder to join my idea')
            || formData.goals.includes('Find people to help with my project')

        },
    // Page 9-3 - Only show if the user selects the first or second option on the Goals page

            {
                field: 'skillsNeeded',
                prompt: "What skills are you looking for?",
                type: 'checkbox',
                options: ['Accounting', 'Artificial Intelligence & Machine Learning', 'Biotechnology', 'Business', 'Content Creation (e.g. video, copywriting)', 'Counseling & Therapy', 'Data Analysis', 'DevOps', 'Finance', 'Fundraising', 'Graphic Design', 'Legal', 'Manufacturing', 'Marketing', 'Policy', 'Product Management', 'Project Management', 'Public Relations', 'Research', 'Sales', 'Software Development (Backend)', 'Software Development (Frontend)', 'UI/UX Design', 'Other'],
                conditional: (formData) => formData.goals.includes('Find a co-founder to join my idea')
                || formData.goals.includes('Find people to help with my project')

            },

            // Page 10-1 - Only show if the user selects the third or fourth option on the Goals page

            {
                field: 'projectHelp',
                prompt: "How would you like to contribute to others' projects?",
                type: 'checkbox',
                options: ['Full-Time Work', 'Part-Time Work', 'Internship', 'Volunteering or Probono', 'Co-Founder', 'Advice & Mentorship', 'Feedback & Research Participation'],
//                conditional: (formData) =>
//                        formData.goals.includes('Contribute my skills to an existing project') ||
//                        formData.goals.includes('Explore new ideas') ||
//                        (formData.goals.includes('Find a co-founder to join my idea') ||
//                        formData.goals.includes('Find people to help with my project')) &&
//                        (formData.goals.includes('Contribute my skills to an existing project') ||
//                        formData.goals.includes('Explore new ideas'))
                conditional: (formData) =>
                        (formData.goals.includes('Contribute my skills to an existing project') ||
                        formData.goals.includes('Explore new ideas')) &&
                        !(formData.goals.includes('Find a co-founder to join my idea') ||
                        formData.goals.includes('Find people to help with my project'))

            },

            // Page 10-2 - Only show if the user selects the third or fourth option on the Goals page

            {
                field: 'skillsNeeded',
                prompt: "What skills are you looking for?",
                type: 'checkbox',
                options: ['Accounting', 'Artificial Intelligence & Machine Learning', 'Biotechnology', 'Business', 'Content Creation (e.g. video, copywriting)', 'Counseling & Therapy', 'Data Analysis', 'DevOps', 'Finance', 'Fundraising', 'Graphic Design', 'Legal', 'Manufacturing', 'Marketing', 'Policy', 'Product Management', 'Project Management', 'Public Relations', 'Research', 'Sales', 'Software Development (Backend)', 'Software Development (Frontend)', 'UI/UX Design', 'Other'],
//                conditional: (formData) =>
//                    formData.goals.includes('Contribute my skills to an existing project') ||
//                    formData.goals.includes('Explore new ideas')
                conditional: (formData) =>
                        (formData.goals.includes('Contribute my skills to an existing project') ||
                        formData.goals.includes('Explore new ideas')) &&
                        !(formData.goals.includes('Find a co-founder to join my idea') ||
                        formData.goals.includes('Find people to help with my project'))
    },
    // Page 11-1 - Only show if the user selects combinations involving options 1 or 2 and 3 or 4
        {
            field: 'projectHelp',
            prompt: "How would you like to contribute to other people’s projects?",
            type: 'checkbox',
            options: ['Full-Time Work', 'Part-Time Work', 'Internship', 'Volunteering or Probono', 'Co-Founder', 'Advice & Mentorship', 'Feedback & Research Participation'],
            conditional: (formData) =>
                (formData.goals.includes('Find a co-founder to join my idea') ||
                 formData.goals.includes('Find people to help with my project')) &&
                (formData.goals.includes('Contribute my skills to an existing project') ||
                 formData.goals.includes('Explore new ideas'))
        },
        // Page 11-2 - Only show if the user selects combinations involving options 1 or 2 and 3 or 4
        {
            field: 'skillsNeeded',
            prompt: "What are your skills?",
            type: 'checkbox',
            options: ['Accounting', 'Artificial Intelligence & Machine Learning', 'Biotechnology', 'Business', 'Content Creation (e.g. video, copywriting)', 'Counseling & Therapy', 'Data Analysis', 'DevOps', 'Finance', 'Fundraising', 'Graphic Design', 'Legal', 'Manufacturing', 'Marketing', 'Policy', 'Product Management', 'Project Management', 'Public Relations', 'Research', 'Sales', 'Software Development (Backend)', 'Software Development (Frontend)', 'UI/UX Design', 'Other'],
            conditional: (formData) =>
                (formData.goals.includes('Find a co-founder to join my idea') ||
                 formData.goals.includes('Find people to help with my project')) &&
                (formData.goals.includes('Contribute my skills to an existing project') ||
                 formData.goals.includes('Explore new ideas'))
        }
];

        const handleInputChange = (field, value) => {
            if (Array.isArray(formData[field])) {
                setFormData(prevFormData => ({
                    ...prevFormData,
                    [field]: prevFormData[field].includes(value)
                        ? prevFormData[field].filter(item => item !== value)
                        : [...prevFormData[field], value]
//    const handleInputChange = (field, value, subfield) => {
//        if (subfield) {
//            setFormData(prevFormData => ({
//                ...prevFormData,
//                [field]: {
//                    ...prevFormData[field],
//                    [subfield]: value
//                }
            }));
        } else {
            setFormData(prevFormData => ({
                ...prevFormData,
                [field]: value
            }));
        }
    };

    const handleSubmit = () => {
        // For now, just log the answers to the console
        console.log(formData);
        // TODO: Handle form submission, e.g., send answers to a server
        //use axios for HTTP POST
        const response = axios({
            method: 'post',
            url: 'http://10.0.2.2:5000/hello',
            data: formData,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
            },
        });
        /* const response = axios.get("http://10.0.2.2:5000/hello");
        console.log(response.data) */
        if (onClose) {
            onClose();
        }
    };


//    const isLastQuestion = () => {
//
//            // Check if the current question is the last one that should be shown
//            let nextIndex = currentQuestionIndex + 1;
//            while (nextIndex < questions.length && questions[nextIndex].conditional && !questions[nextIndex].conditional(formData)) {
//                nextIndex++;
//            }
//            return nextIndex >= questions.length;
//        };

    const isLastQuestion = () => {
        // Start with the index of the next question
        let nextIndex = currentQuestionIndex + 1;

        // Iterate through subsequent questions
        while (nextIndex < questions.length) {
            // Check if the next question is conditional
            if (questions[nextIndex].conditional) {
                // If the condition is not met, skip to the next question
                if (!questions[nextIndex].conditional(formData)) {
                    nextIndex++;
                    continue;
                }
            }

            // If we find a question that should be shown, break the loop
            break;
        }

        // Check if we've reached or exceeded the length of the questions array
        return nextIndex >= questions.length;
    };




    const handleNext = () => {
        // Skip questions that should not be displayed based on the user's selections
        let nextIndex = currentQuestionIndex + 1;
        while (nextIndex < questions.length && questions[nextIndex].conditional && !questions[nextIndex].conditional(formData)) {
            nextIndex++;
        }

        if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex);
        }
    };




    const handlePrevious = () => {
        let prevIndex = currentQuestionIndex - 1;
        while (prevIndex >= 0 && questions[prevIndex].conditional && !questions[prevIndex].conditional(formData)) {
            prevIndex--;
        }

        if (prevIndex >= 0) {
            setCurrentQuestionIndex(prevIndex);
        }
    };

    const currentQuestion = questions[currentQuestionIndex];

return (
        <ImageBackground
                    source={require('./img/onboardbg.png')}
                    style={styles.container}
                >
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.label}>{currentQuestion.prompt}</Text>
                {currentQuestion.sidePrompt && <Text style={styles.sidePrompt}>{currentQuestion.sidePrompt}</Text>}
                {currentQuestion.type === 'checkbox' ? (
                    currentQuestion.options.map((option, index) => (
//                        <TouchableOpacity
//                            key={index}
//                            onPress={() => handleInputChange(currentQuestion.field, option)}
//                            style={styles.checkbox}
//                        >
//                            <Text>{option}</Text>
//                        </TouchableOpacity>
                        <View key={index} style={styles.checkboxContainer}>

                            <Checkbox

                                isChecked={formData[currentQuestion.field].includes(option)}

                                onChange={() => handleInputChange(currentQuestion.field, option)}

//                                style={styles.checkbox}
                                _checked={{
                                    bgColor: 'black', // Changes the fill color to black when checked
                                    borderColor: 'black', // Keeps the border color black
                                }}
                                _icon={{
                                    color: 'white', // Icon color inside the checkbox
                                }}
                                style={styles.checkbox}
                            />
                            <Text style={styles.optionText}>{option}</Text>
                        </View>
                    ))
                ) : currentQuestion.type === 'search' ? (
                    // Placeholder for the search component
                    // You can implement a search bar here and populate with the `options`
                    currentQuestion.options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleInputChange(currentQuestion.field, option)}
                            style={styles.searchOption}
                        >
                            <Text>{option}</Text>
                        </TouchableOpacity>
                    ))
                ) : Array.isArray(currentQuestion.field) ? (
                    currentQuestion.field.map((field, index) => (
                        <TextInput
                            key={field}
                            style={styles.input}
                            value={formData[field]}
                            onChangeText={(value) => handleInputChange(field, value)}
                            placeholder={currentQuestion.placeholders[index]}
                        />
                    ))
                ) : currentQuestion.field === 'socialLinks' ? (
                   Object.keys(formData.socialLinks).map((key, index) => (
                       <TextInput
                           key={key}
                           style={styles.input}
                           value={formData.socialLinks[key]}
                           onChangeText={(value) => handleInputChange('socialLinks', value, key)}
                           placeholder={currentQuestion.placeholders[index]}
                       />
                   ))
               ) : (
                   <TextInput
                       style={styles.input}
                       value={formData[currentQuestion.field]}
                       onChangeText={(value) => handleInputChange(currentQuestion.field, value)}
                       placeholder={currentQuestion.placeholder}
                   />
               )}

               <View style={styles.buttonContainer}>
                   {currentQuestionIndex > 0 && (
                       <TouchableOpacity onPress={handlePrevious} style={styles.backButton}>
                           <Text style={styles.backButtonText}>Back</Text>
                       </TouchableOpacity>
                   )}
                   <TouchableOpacity
                       onPress={isLastQuestion() ? handleSubmit : handleNext}
                       style={styles.continueButton}
                   >
                       <Text style={styles.continueButtonText}>
                           {isLastQuestion() ? 'Submit' : 'Continue'}
                       </Text>
                   </TouchableOpacity>
               </View>
           </ScrollView>
       </View>
       </ImageBackground>
   );
};


const requestPermissions = async () => {
    try {
        const oGranted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        ]);

        for (const [sKey, sValue] of Object.entries(oGranted)) {
            console.log(`Permission - ${sKey}: ${sValue}`);
        }
    } catch (err) {
        console.warn(err);
    }
};

function * range (start, end) {
    for (let i = start; i <= end; i++) {
      yield i
    }
}

export default class App extends Component<Props> {

    loading = false;
    videoCallAudio = false;
    purchaseUpdateSubscription = null;
    purchaseErrorSubscription = null;
    products = {};
    url = '';

    constructor(props) {
        super(props);

        var colorScheme = Appearance.getColorScheme();
        this.url = `${BASE_URL}?skin=${TEMPLATE}&mix=${'dark' === colorScheme ? MIX_DARK : MIX_LIGHT}`;

        this.state = {
            status: '',
            backButtonEnabled: false,
            forwardButtonEnabled: false,
            loading: this.loading,
            data: {},
            searchbar: false,
            key: 1,
            videoCall: 0,
            swiperView: 0,
            videoCallUri: false,
            colorScheme: colorScheme,
            drawerOpen: false,
            cards: [...range(1, 50)],
            //cards: ['DO', 'MORE', 'OF', 'WHAT', 'MAKES', 'YOU', 'HAPPY'],
            swipedAllCards: false,
            swipeDirection: '',
            cardIndex: 0,
            //TODO: 2. have showQuestionnaire in state in the constructor
            showQuestionnaire: false, //todo: Controls the visibility of the questionnaire
            questionnaireData: [],     //todo: Holds the questionnaire data
            userResponses: {}          // todo: Stores user responses
        };

        this.onBack = this.onBack.bind(this);
        this.onMainMenu = this.onMainMenu.bind(this);
        this.onBackAndMainMenu = this.onBackAndMainMenu.bind(this);
        this.onSearchMenu = this.onSearchMenu.bind(this);
        this.onNotificationsMenu = this.onNotificationsMenu.bind(this);
        this.onSwiperView = this.onSwiperView.bind(this);
        this.onAddMenu = this.onAddMenu.bind(this);
        this.onMessengerMenu = this.onMessengerMenu.bind(this);
        this.onProfileMenu = this.onProfileMenu.bind(this);
        this.onSearchCancelMenu = this.onSearchCancelMenu.bind(this);
        this.onSearch = this.onSearch.bind(this);

        this.onConferenceTerminated = this.onConferenceTerminated.bind(this);
        this.onConferenceJoined = this.onConferenceJoined.bind(this);
        this.onConferenceWillJoin = this.onConferenceWillJoin.bind(this);

        this.onVideoCallStart = this.onVideoCallStart.bind(this);

        this.onDrawerToggle = this.onDrawerToggle.bind(this);
        //TODO: Binding methods...
        this.handleQuestionnaireResponse = this.handleQuestionnaireResponse.bind(this);
        this.renderQuestionnaire = this.renderQuestionnaire.bind(this);//todo:
    }

    //TODO: 5.load the questionnaire data
    componentDidMount() {
            this.loadQuestionnaireData();
        }

        loadQuestionnaireData = () => {
            // Example of loading data (replace with actual data source)
            const data = [
                { id: 1, question: 'What is your favorite color?', options: ['Red', 'Blue', 'Green'] },
                // Add more questions here
            ];
            this.setState({ questionnaireData: data });
        }

    //TODO: 3.Create a method to render the questionnaire
    renderQuestionnaire() {
            return (
                <View style={styles.containerVideoCall}>
                <Questionnaire
                     data={this.state.questionnaireData}
                     onClose={() => this.setState({ showQuestionnaire: false })}
                />
                </View>
//                <ImageBackground
//                        source={require('./img/containerQuestionnaire.png')} // Path to your background image
//                        style={styles.containerQuestionnaire}
//                      >
//                    <Questionnaire
//                      data={this.state.questionnaireData}
//                      onClose={() => this.setState({ showQuestionnaire: false })}
//                    />
//                  </ImageBackground>
            );
    }

    handleQuestionnaireResponse(questionId, response) {
        this.setState(prevState => ({
            userResponses: { ...prevState.userResponses, [questionId]: response }
        }));
    }

    renderCard = (card, index) => {
        return (
          <View style={styles.card}>
            <Text style={styles.largeText}>User profile </Text>
            <Text style={styles.largeText}> # {card}</Text>
          </View>
        )
    };


    //TODO: questionnaire press
    showQuestionnaire = () => {
        this.setState({ showQuestionnaire: true });
    }

    onSwiped = (type) => {
        console.log(`on swiped ${type}`)
    }

    onSwipedAllCards = () => {
        this.setState({
          swipedAllCards: true
        })
    };

    swipeLeft = () => {
        this.swiper.swipeLeft()
    };
/*
    async onRequestPurchase (sku: string) {
        if ('ios' === Platform.OS)
            RNIap.clearTransactionIOS();
        try {
            await RNIap.requestPurchase(sku, false);
        } catch (err) {
            console.warn(err.code, err.message);
            Alert.alert(err.message);
        }
    }

    async onRequestSubscription (sku: string) {
        if ('ios' === Platform.OS)
            RNIap.clearTransactionIOS();
        try {
            await RNIap.requestSubscription(sku);
        } catch (err) {
            console.warn(err.code, err.message);
            Alert.alert(err.message);
        }
    }
*/
    onConferenceTerminated(e) {
        this.endVideoCall();
        this.injectJavaScript("bx_mobile_apps_video_terminated(" + JSON.stringify(e.nativeEvent) + ")");
    }

    onConferenceJoined(e) {
        this.injectJavaScript("bx_mobile_apps_video_joined(" + JSON.stringify(e.nativeEvent) + ")");
    }

    onConferenceWillJoin(e) {
        this.injectJavaScript("bx_mobile_apps_video_will_join(" + JSON.stringify(e.nativeEvent) + ")");
    }

    endVideoCall() {
        this.videoCallAudio = false;
        this.setState ({
            videoCall: 0,
            videoCallUri: false,
        });
        //JitsiMeet.endCall();
    }

    endSwiperView() {
        this.setState ({
            swiperView: 0,
        });
    }

    onVideoCallStart(sUri, bAudioOnly = false) {
        if (!this.state.videoCall) {
            this.videoCallAudio = bAudioOnly;
            this.setState ({
                videoCall: 1,
                videoCallUri: sUri,
            });
        }
    }

    onVideoCallToggle() {
        if (this.state.videoCall) {
            this.endVideoCall();
        }
        else {
            this.onVideoCallStart('testing-egr58t32g2');
        }
    }

    onBack() {
        this.endVideoCall();
        this.endSwiperView();
        if (this.state.backButtonEnabled) {
    
            if ('android' === Platform.OS)
                this.onWebViewLoadStart(); // show loading screen
            
            this.refs.webView1.goBack();
            // this.injectJavaScript("window.history.go(-1)");
            return true;
        }
        return false;
    }
    
    onMainMenu() {
        this.endVideoCall();
        this.endSwiperView();
        if (this.state.data.loggedin)
            this.injectJavaScript("bx_mobile_apps_show_main_menu()");
        else
            this.drawerOpen();
    }

    onBackAndMainMenu() {
        if (this.state.backButtonEnabled) {
            return this.onBack();
        }
        else {
            return this.onMainMenu();
        }
    }

    onProfileMenu() {
        this.endVideoCall();
        this.endSwiperView();
        this.injectJavaScript("bx_mobile_apps_show_profile_menu()");
        return true;
    }


    onSwiperView() {
        this.endVideoCall();
        this.setState ({
            swiperView: 1,
        });
        return true;
    }

    onAddMenu() {
        this.endVideoCall();
        this.endSwiperView();
        this.injectJavaScript("bx_mobile_apps_show_add_menu()");
        return true;
    }
    
    onNotificationsMenu() {
        this.endVideoCall();
        this.endSwiperView();
        this.injectJavaScript(`document.location = "${BASE_URL}page.php?i=notifications-view"`);
        return true;
    }
    
    onMessengerMenu() {
        this.endVideoCall();
        this.endSwiperView();
        this.injectJavaScript("bx_mobile_apps_show_messenger_menu()");
        return true;
    }
    
    onHomeMenu() {
        this.endVideoCall();
        this.endSwiperView();
        if (`${BASE_URL}` == this.url || this.url.startsWith(`${BASE_URL}?skin=${TEMPLATE}`) || `${BASE_URL}index.php` == this.url) {        
            this.injectJavaScript("bx_mobile_apps_close_sliding_menus()");
        } else {
            this.setState ({
                url: `${BASE_URL}?skin=${TEMPLATE}&mix=${'dark' == this.state.colorScheme ? MIX_DARK : MIX_LIGHT}`,
                status: '',
                searchbar: false,
                key: this.state.key + 1,
            });
        }

        return true;
    }

    onSearch(event) {
        this.onSearchCancelMenu();        
        this.injectJavaScript(`window.location = '${BASE_URL}searchKeyword.php?keyword=${event.nativeEvent.text}';`);
    }

    onSearchCancelMenu() {
        this.setState ({
            loading: this.loading,
            searchbar: false,
        });
        return true;
    }

    onSearchMenu() {
        this.endVideoCall();
        this.endSwiperView();
        this.setState ({
            loading: this.loading,
            searchbar: true,
        });
        return true;
    }

    onDrawerLoginMenu() {
        this.onHomeMenu();
        this.drawerClose();
        return true;
    }

    onDrawerJoinMenu() {
        this.injectJavaScript(`window.location = '${BASE_URL}page/create-account';`);
        this.drawerClose();
        return true;
    }
    
    onDrawerForgotMenu() {
        this.injectJavaScript(`window.location = '${BASE_URL}page/forgot-password';`);
        this.drawerClose();
        return true;
    }

    onWebViewNavigationStateChange(navState) {

        if (-1 != navState.url.indexOf('#') && this.url == navState.url.substring(0, navState.url.indexOf('#'))) {
            this.onWebViewLoadEnd();
            return;   
        }

        this.url = navState.url;
        this.setState ({
            status: navState.title,
            backButtonEnabled: navState.canGoBack,
            forwardButtonEnabled: navState.canGoForward,
            searchbar: false,
        });
    }

    onWebViewLoadStart (syntheticEvent) {
        var sUrl = 'undefined' !== typeof(syntheticEvent) && 'undefined' !== typeof(syntheticEvent['nativeEvent']) && 'undefined' !== typeof(syntheticEvent['nativeEvent']['url']) ? syntheticEvent.nativeEvent.url : false;

        if (sUrl && -1 == sUrl.indexOf(`${BASE_URL}`)) { // loading indicator is supported on original domains only
            this.onWebViewLoadEnd(syntheticEvent);
            return;
        }

        this.loading = true;
        this.setState ({
            loading: this.loading,
            searchbar: false,
        });
    }
    
    onWebViewLoadEnd (syntheticEvent) {

        this.loading = false;
        this.setState ({
            loading: this.loading,
            searchbar: false,
        });
    }

    onWebViewRenderError () {
        return (
            <ErrorPage onReload={() => (this.reload())}></ErrorPage>
        );
    }

    reload() {
        this.refs.webView1.reload();
    }

    postMessage (data) {
        // posts a message to web view
        this.refs.webView1.postMessage(data);
    }

    injectJavaScript (script) {
        // executes JavaScript immediately in web view
        this.refs.webView1.injectJavaScript(script);
    }

    onWebViewShouldStartLoadWithRequest (event) {

        var aExceptionsUrls = [
            'redirect_uri=', 'redirect_uri%', 'redirectUri%', // Facebook/LinkedIn Connect and other Connect apps
            'signin/oauth', 'signin%2Foauth', // Google Connect
            '/m/oauth2', // Dolphin/UNA Connect
            'api.twitter.com', // Twitter Connect
        ];
        var bExceptionUrl = aExceptionsUrls.some(e => {
            return -1 !== event.url.indexOf(e);
        });

        if ('about:blank' === event.url)
            return false;

        if ((0 != event.url.indexOf('http') || (!bExceptionUrl && -1 == event.url.indexOf(`${BASE_URL}`) && ('android' === Platform.OS || ('click' == event.navigationType && 'ios' === Platform.OS)))) || -1 != event.url.indexOf('calendar_sync')) {

            Linking.canOpenURL(event.url).then(supported => {
                if (supported) {
                    Linking.openURL(event.url);
                } 
                else {
                    console.log('Don\'t know how to open URI: ' + event.url);
                }
                return false;
            });
            return false;
        }

        if ('android' === Platform.OS)
            this.onWebViewLoadStart(); // show loading screen

        return true;
    }
  
    javascriptToInject () { 
        return 'glBxNexusApp = ' + JSON.stringify({ver:version});
    }

    componentDidCatch(error, info) {
        SplashScreen.hide();
    }

    async componentDidMount() {

        Appearance.addChangeListener(({ colorScheme }) => { // not working in Android :(
            var s = Appearance.getColorScheme(); // colorScheme param is working incorrect in iOS13, so we need to get it explicitly
            if (s != this.state.colorScheme) {
                var sUrl = this.url;
                var sUri = `skin=${TEMPLATE}&mix=${'dark' === s ? MIX_DARK : MIX_LIGHT}`;
                sUrl += (-1 === sUrl.indexOf('?') ? '?' : '&') + sUri;
                this.setState ({
                    colorScheme: s,
                    url: sUrl,
                });
            }
        });

        OneSignal.setLogLevel(6, 0);
        OneSignal.setAppId(ONESIGNALAPPID);
        OneSignal.promptForPushNotificationsWithUserResponse(response => {
            console.log("OneSignal Prompt response:", response);
        });
        OneSignal.setNotificationWillShowInForegroundHandler(notificationReceivedEvent => {
            console.log("OneSignal: notification in foreground:", notificationReceivedEvent);
        });

        OneSignal.setNotificationOpenedHandler(openResult => {
            console.log("OneSignal: notification opened:", openResult);

            if ('undefined' !== typeof(openResult.notification.additionalData) && 'undefined' !== typeof(openResult.notification.additionalData.url)) {
                this.injectJavaScript(`window.location = '${openResult.notification.additionalData.url}';`);
            }            
        });

        const deviceState = await OneSignal.getDeviceState();
        this.setState({
            isSubscribed : deviceState.isSubscribed
        });

        if (Platform.OS === 'android') {
            this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                if (this.state.backButtonEnabled) {
                    this.onBack(); // works best when the goBack is async
                    return true;
                }
                else {
                    return false;
                }
            });
        }        
/*
        if (PAYMENTS_CALLBACK != '') {
            var _self = this;
            try {
                await RNIap.initConnection();
                const sProducts = await fetch(BASE_URL + 'modules/?r=oauth2/com/get_products_names&module=system&class=BaseServices');
                _self.products = await sProducts.json();
                await RNIap.getSubscriptions(Object.keys(_self.products));
                await RNIap.getProducts(Object.keys(_self.products));
            } catch(err) {
                console.warn(err);
            }

            purchaseUpdateSubscription = purchaseUpdatedListener(async (oPurchaseData: ProductPurchase) => {
                console.log('purchaseUpdatedListener', oPurchaseData);

                if ('undefined' !== typeof(oPurchaseData.transactionId) && _self.state.data.loggedin != 0) {
                    var sProductName = 'undefined' !== typeof(oPurchaseData.productId) ? oPurchaseData.productId : null;
                    var sTxId = 'undefined' !== typeof(oPurchaseData.transactionId) ? oPurchaseData.transactionId : '';
                    var sTxIdOriginal = 'undefined' !== typeof(oPurchaseData.originalTransactionIdentifierIOS) ? oPurchaseData.originalTransactionIdentifierIOS : '';

                    await fetch(PAYMENTS_CALLBACK, {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            'User-Agent': "UNAMobileApp/Mobile (" + Platform.OS + ")",
                        },
                        body: JSON.stringify({
                            notification_type: 'INITIAL_BUY_CUSTOM',
                            module: 'undefined' !== typeof(_self.products[sProductName]) ? _self.products[sProductName] : null,
                            product: sProductName,
                            count: 1,
                            original_transaction: sTxIdOriginal,
                            transaction: sTxId,
                            profile_id: _self.state.data.loggedin ? _self.state.data.user_info.id : 0,
                            original_data: oPurchaseData,
                        })
                    });
    
                    if ('ios' === Platform.OS)
                        RNIap.finishTransactionIOS(sTxId);
                }
            });
            purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
                console.log('purchaseErrorListener', error);
            }); 
        }
*/
        if (Platform.OS === 'android')
            requestPermissions();

        SplashScreen.hide();
    }
    
    componentWillUnmount() {

        if (this.purchaseUpdateSubscription) {
            this.purchaseUpdateSubscription.remove();
            this.purchaseUpdateSubscription = null;
        }
        if (this.purchaseErrorSubscription) {
            this.purchaseErrorSubscription.remove();
            this.purchaseErrorSubscription = null;
        }

        if (Platform.OS === 'android' && this.backHandler) {
            this.backHandler.remove();
        }
    }
        
    onWebViewMessage(event) {

        let oMsgData;
        try {
            oMsgData = JSON.parse(event.nativeEvent.data);
        }
        catch(err) {
            console.warn(err);
            return;
        }

        if ('undefined' !== typeof(oMsgData.loggedin)) {
            this.setState ({
                loading: this.loading,
                data: oMsgData,
                searchbar: false,
                key: 'undefined' === typeof(this.state.data.loggedin) || this.state.data.loggedin != oMsgData.loggedin ? this.state.key + 1 : this.state.key,
            });
        }

        if ('undefined' !== typeof(oMsgData['push_tags']) && oMsgData['push_tags'] !== false) {

            if ('undefined' !== typeof(oMsgData['push_tags']['user']) && oMsgData['push_tags']['user'].length) {
                console.log('User ID: ' + JSON.stringify(oMsgData['push_tags']['user']));
                OneSignal.setExternalUserId(oMsgData['push_tags']['user']);
            }

            if ('undefined' !== typeof(oMsgData['push_tags']['email']) && oMsgData['push_tags']['email'].length) {
                OneSignal.setEmail(oMsgData['push_tags']['email'], oMsgData['push_tags']['email_hash'], (sError) => {
                    if ('undefined' !== typeof(sError))
                        console.warn("OneSignal set email error: " + sError);
                });
                delete oMsgData['push_tags']['email'];
                delete oMsgData['push_tags']['email_hash'];
            }
            OneSignal.sendTags(oMsgData['push_tags']);
        }

        if ('undefined' !== typeof(oMsgData['stop_loading']) && oMsgData['stop_loading']) {
            // this.onWebViewLoadEnd (event);
        }

        if ('undefined' !== typeof(oMsgData['video_call_start'])) {
            this.onVideoCallStart (oMsgData['video_call_start']['uri'], 'undefined' === typeof(oMsgData['video_call_start']['audio']) ? false : oMsgData['video_call_start']['audio']);
        }
        if ('undefined' !== typeof(oMsgData['video_call_stop']) && oMsgData['video_call_stop']) {
            this.endVideoCall ();
        }

        if ('undefined' !== typeof(oMsgData['request_purchase']) && oMsgData['request_purchase']) {
            this.onRequestPurchase (oMsgData['request_purchase']);
        }
        if ('undefined' !== typeof(oMsgData['request_subscription']) && oMsgData['request_subscription']) {
            this.onRequestSubscription (oMsgData['request_subscription']);
        }

        if ('undefined' !== typeof(oMsgData['goto_home']) && oMsgData['goto_home']) {
            this.onHomeMenu ();
        }
        if ('undefined' !== typeof(oMsgData['reload']) && oMsgData['reload']) {
            this.reload ();
        }
    }

    drawerClose () {
        this.setState ({drawerOpen: false});
    }
    
    drawerOpen () {
        this.setState ({drawerOpen: true});
    }

    onDrawerToggle () {
        if ('undefined' === typeof(this.state.drawerOpen) || !this.state.drawerOpen)
            this.setState ({drawerOpen: true});
        else
            this.setState ({drawerOpen: false});
    }

    render() {
        var sUri = `${BASE_URL}?skin=${TEMPLATE}&mix=${'dark' === this.state.colorScheme ? MIX_DARK : MIX_LIGHT}`;
        // if (this.state.data.loggedin && this.state.data.user_info && 'system' == this.state.data.user_info.module) // conditional redirect after login
        //    sUri = `${BASE_URL}create-persons-profile`;

        var sWebview = (
                <WebView
                    useWebKit={true}

                    ref="webView1"
                    key={this.state.key}
                    geolocationEnabled={true}
                    builtInZoomControls={false}
                    decelerationRate="normal"
                    cacheEnabled={true}
                    allowsLinkPreview={true}
                    hideKeyboardAccessoryView={true}
                    injectedJavaScript={this.javascriptToInject()}
                    onShouldStartLoadWithRequest={this.onWebViewShouldStartLoadWithRequest.bind(this)}
                    onNavigationStateChange={this.onWebViewNavigationStateChange.bind(this)}
                    style={styles.webview}
                    source={{uri: sUri}}
                    userAgent={"UNAMobileApp/Mobile (" + Platform.OS + ")"}
                    onMessage={this.onWebViewMessage.bind(this)}
                    allowFileAccess={true}
                    onLoad={this.onWebViewLoadEnd.bind(this)}
                    onLoadStart={this.onWebViewLoadStart.bind(this)}
                    renderError={this.onWebViewRenderError.bind(this)}
                    startInLoadingState={true}
                    renderLoading={() => <View style={styles.webviewFirstLoad} bg={useTheme('colors.background')}><ActivityIndicator size="large" color={useTheme('colors.activityIndicator')} style={styles.webviewFirstLoadIndicator} /></View>}
                />
        );

        var sSwiper = (
            <View style={styles.containerVideoCall}>
              <Swiper
                ref={swiper => {
                  this.swiper = swiper
                }}
                onSwiped={() => this.onSwiped('general')}
                onSwipedLeft={() => this.onSwiped('left')}
                onSwipedRight={() => this.onSwiped('right')}
                onSwipedTop={() => this.onSwiped('top')}
                onSwipedBottom={() => this.onSwiped('bottom')}
                onTapCard={this.swipeLeft}
                cards={this.state.cards}
                cardIndex={this.state.cardIndex}
                cardVerticalMargin={100}
                renderCard={this.renderCard}
                onSwipedAll={this.onSwipedAllCards}
                stackSize={3}
                stackSeparation={1}
                overlayLabels={{
                  bottom: {
                    title: 'NO NO',
                    style: {
                      label: {
                        backgroundColor: 'black',
                        borderColor: 'black',
                        color: 'white',
                        borderWidth: 1
                      },
                      wrapper: {
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }
                    }
                  },
                  left: {
                    title: 'NOPE',
                    style: {
                      label: {
                        backgroundColor: 'black',
                        borderColor: 'black',
                        color: 'white',
                        borderWidth: 1
                      },
                      wrapper: {
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        justifyContent: 'flex-start',
                        marginTop: 30,
                        marginLeft: -30
                      }
                    }
                  },
                  right: {
                    title: 'LIKE',
                    style: {
                      label: {
                        backgroundColor: 'black',
                        borderColor: 'black',
                        color: 'white',
                        borderWidth: 1
                      },
                      wrapper: {
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        marginTop: 30,
                        marginLeft: 30
                      }
                    }
                  },
                  top: {
                    title: 'SUPER LIKE',
                    style: {
                      label: {
                        backgroundColor: 'black',
                        borderColor: 'black',
                        color: 'white',
                        borderWidth: 1
                      },
                      wrapper: {
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }
                    }
                  }
                }}
                animateOverlayLabelsOpacity
                animateCardOpacity
                swipeBackCard
              >
                <Button onPress={() => this.swiper.swipeBack()} title='Swipe Back' />
              </Swiper>
            </View>
          )

        //TODO: 4.Integrate into Main Render Function
        var sQuestionnaire = this.renderQuestionnaire();

        return (
            <NativeBaseProvider> 
                <StatusBar animated={true} backgroundColor={useTheme('colors.statusBar')} barStyle={useTheme('barStyle')} />

                {/* this.state.searchbar ? (
                    <UnaToolbarSearch onSearch={this.onSearch} onSearchCancel={this.onSearchCancelMenu} />
                ) : (
                    <UnaToolbar drawerOpen={this.state.drawerOpen} loading={this.state.loading} loggedin={this.state.data.loggedin} backButtonEnabled={this.state.backButtonEnabled} onMainMenu={this.onMainMenu} onHomeMenu={this.onHomeMenu} onSearchMenu={this.onSearchMenu} onBackAndMainMenu={this.onBackAndMainMenu} onBack={this.onBack} onDrawerToggle={this.onDrawerToggle} title={this.state.status} />
                ) */}


                {this.state.videoCall && this.state.videoCallUri ? (
                    <View style={styles.containerVideoCall}><VideoCall onConferenceTerminated={this.onConferenceTerminated} onConferenceJoined={this.onConferenceJoined} onConferenceWillJoin={this.onConferenceWillJoin} conferenceUri={this.state.videoCallUri} audio={this.videoCallAudio} userInfo={this.state.data.user_info} /></View>
                ) : (
                    <View />
                )}
{/*
                //TODO: 4-1 integrate to main render's return
*/}
                {true ? (sQuestionnaire) : <View />} 
                {this.state.swiperView ? (sSwiper) : 
                (<View />)}

                {true ? (sWebview) : 
                (<View />)}

                { this.state.drawerOpen ? <UnaDrawer onLogin={this.onDrawerLoginMenu.bind(this)} onJoin={this.onDrawerJoinMenu.bind(this)} onForotPassword={this.onDrawerForgotMenu.bind(this)} onClose={this.drawerClose.bind(this)} /> : <View /> }

                {this.state.data.loggedin && (
                    <UnaFooter bubblesNum={this.state.data.bubbles_num} bubbles={this.state.data.bubbles} onMainMenu={this.onMainMenu} onNotificationsMenu={this.onNotificationsMenu} onVideoCallToggle={this.onVideoCallToggle} onRequestPurchase={this.onRequestPurchase} onRequestSubscription={this.onRequestSubscription} onSwiperView={this.onSwiperView} onAddMenu={this.onAddMenu} onMessengerMenu={this.onMessengerMenu} onProfileMenu={this.onProfileMenu} />
                )}
                
            </NativeBaseProvider>
        );
    }
}

function UnaFooter(o) {

    return (
            <HStack bg={useTheme('colors.primary')} borderColor={useTheme('colors.toolbarBorder')} alignItems="center" safeAreaBottom style={styles.footer}>
                {!('decorous' == TEMPLATE && Platform.isPad) &&
                    (<Pressable py="3" flex={1} style={styles.footerTab}>
                        <IconButton icon={<Icons.Apps size="xl" style={styles.footerIcon} color={useTheme('colors.textOnPrimary')} />} onPress={o.onMainMenu} />
                    </Pressable>)
                }
                <Pressable py="3" flex={1} style={styles.footerTab}>
                    <IconButton icon={<Icons.Bell size="xl"style={styles.footerIcon} color={useTheme('colors.textOnPrimary')} />} onPress={o.onNotificationsMenu} />
                    {o.bubbles['notifications-preview'] > 0 && (<Badge num={o.bubbles['notifications-preview']} />)}
                </Pressable>
{/*
                <Pressable py="3" flex={1} style={styles.footerTab}>
                    <Center><IconButton icon={<Icons.Video size="xl" style={styles.footerIcon} color={useTheme('colors.textOnPrimary')} />} onPress={o.onVideoCallToggle} /></Center>
                </Pressable>
*/}

                <Pressable py="3" flex={1} style={styles.footerTab}>
                    <IconButton icon={<Icons.Question size="xl" style={styles.footerIcon} color={useTheme('colors.textOnPrimary')} />} onPress={o.onSwiperView} />
                </Pressable>

                <Pressable py="3" flex={1} style={styles.footerTab}>
                    <IconButton icon={<Icons.Plus size="xl" style={styles.footerIcon} color={useTheme('colors.textOnPrimary')} />} onPress={o.onAddMenu} />
                </Pressable>
{/*                
                <Pressable py="3" flex={1} style={styles.footerTab}>                    
                    <IconButton icon={<Icons.Chat size="xl" style={styles.footerIcon} color={useTheme('colors.textOnPrimary')} />} onPress={o.onMessengerMenu} />
                    {o.bubbles['notifications-messenger'] > 0 && (<Badge num={o.bubbles['notifications-messenger']} />)}
                </Pressable>
*/}
                <Pressable py="3" flex={1} style={styles.footerTab}>
                    <IconButton icon={<Icons.User size="xl" style={styles.footerIcon} color={useTheme('colors.textOnPrimary')} />} onPress={o.onProfileMenu} />
                    {o.bubbles['account'] > 0 && (<Badge num={o.bubbles['account']} />)}
                </Pressable>
{/*
                //TODO: 1.Add Questionnaire Button to Footer
                Shiwen: let's not worry about adding this button for now.
                <Pressable py="3" flex={1} style={styles.footerTab}>
                    <IconButton icon={<Icons.Question size="xl" style={styles.footerIcon} color={useTheme('colors.textOnPrimary')} />} onPress={props.onQuestionnaireToggle} />
                </Pressable>
*/}
            </HStack>
    );
}

function UnaToolbar(o) {

    return (
    <View style={{borderBottomColor: useTheme('colors.toolbarBorder'), borderBottomWidth:0.5}}>
        <Box safeAreaTop bg={useTheme('colors.statusBar')} />
        <HStack bg={useTheme('colors.primary')} px="1" py="1" justifyContent="space-between" alignItems="center" w="100%" style={styles.header}>
            <HStack alignItems="center">

                {o.loading ? (
                    <ActivityIndicator size="small" color={useTheme('colors.activityIndicator')} style={styles.loadingIndicator} />
                ):(
                    o.loggedin ? (
                        <IconButton icon={<Icons.Back size="lg" color={o.backButtonEnabled ? useTheme('colors.textOnPrimary') : useTheme('colors.textOnPrimaryDisabled')} style={styles.headerIcon} />} onPress={o.onBack} />
                    ):(
                        <IconButton icon={o.drawerOpen ? (<Icons.Cross size="lg" color={useTheme('colors.textOnPrimary')} style={styles.headerIcon} />) : (<Icons.Bars size="lg" color={useTheme('colors.textOnPrimary')} style={styles.headerIcon} />)} onPress={o.onDrawerToggle} />
                    )
                )}
                
                {!o.title || TITLE == o.title || o.loading ? (<View>
                    {/*<Image alt="Logo" style={styles.headerImage} source={require('./img/logo.png')} />*/}
                    <Icons.Logo size={75} />
                </View>) : (
                    <Text color={useTheme('colors.textOnPrimary')} numberOfLines={1} ellipsizeMode="tail" style={styles.headerTitle}>{o.title}</Text>
                )}


            </HStack>

            <HStack>
                {o.loggedin && (<IconButton icon={<Icons.Search size="lg" color={useTheme('colors.textOnPrimary')} style={styles.headerIcon} />} onPress={o.onSearchMenu} />)}
            </HStack>

        </HStack>
    </View>
    );
}

function UnaToolbarSearch(o) {
    return (
    <View style={{borderBottomColor: useTheme('colors.toolbarBorder'), borderBottomWidth:0.5}}>
        <StatusBar bg={useTheme('colors.statusBar')} barStyle={useTheme('barStyle')} />
        <Box safeAreaTop bg={useTheme('colors.statusBar')} />
        <HStack bg={useTheme('colors.primary')} px="1" py="1" justifyContent="space-between" alignItems="center" w="100%" style={styles.header}>
            <HStack alignItems="center" style={styles.searchInputContainer}>
                <Input placeholder="Search..." width="89%" borderRadius={'ios' === Platform.OS ? 'full' : 'md'} px="3" fontSize="14" bg={useTheme('searchInputBackground')} color={useTheme('colors.searchInputText')} borderColor={useTheme('colors.searchInputBorder')} onSubmitEditing={o.onSearch} _focus={{ borderColor: useTheme('colors.searchInputBorderActive') }} placeholderTextColor={useTheme('colors.searchInputTextPlaceholder')} />
                <IconButton icon={<Icons.Cross size="sm" color={useTheme('colors.textOnPrimary')} />} onPress={o.onSearchCancel} />
            </HStack>
        </HStack>
    </View>
    );
}

function UnaDrawer(o) {
    const {StatusBarManager} = NativeModules;
    const height = StatusBarManager.HEIGHT;
    return (
        <Box bg={useTheme('colors.drawerBackground')} borderColor={useTheme('colors.drawerBorder')} style={[styles.drawerContainer, {top:height + ('ios' === Platform.OS ? 50 : 25)}]} shadow={2}>
            <VStack space={2}>
                <Pressable style={styles.drawerButton} iconLeft transparent onPress={o.onLogin}>
                    <HStack>
                        <Icons.In size="md" color={useTheme('colors.drawerText')} style={styles.drawerButtonIcon} />
                        <Text fontSize="md" color={useTheme('colors.drawerText')} style={styles.drawerButtonText}>Loginn</Text>
                    </HStack>
                </Pressable>
                <Pressable style={styles.drawerButton} iconLeft transparent onPress={o.onJoin}>
                    <HStack>
                        <Icons.PlusCircle size="md" color={useTheme('colors.drawerText')} style={styles.drawerButtonIcon} />
                        <Text fontSize="md" color={useTheme('colors.drawerText')} style={styles.drawerButtonText}>Join</Text>
                    </HStack>
                </Pressable>
                <Pressable style={styles.drawerButton} iconLeft transparent onPress={o.onForotPassword}>
                    <HStack>
                        <Icons.Question size="md" color={useTheme('colors.drawerText')} style={styles.drawerButtonIcon} />
                        <Text fontSize="md" color={useTheme('colors.drawerText')} style={styles.drawerButtonText}>Forgot Password</Text>
                    </HStack>
                </Pressable>
            </VStack>
        </Box>
  );
}

function Badge(o) {
    return (
        <Box style={styles.badge}><Text style={styles.badgeText}>{o.num}</Text></Box>
    );
}

const styles = new StyleSheet.create({
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
      },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
  },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },

    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    webviewFirstLoad: {
        flex: 9999999999,        
        justifyContent: 'center',  
        alignItems: 'center',
    },

     sidePrompt: {
            fontSize: 14,
            color: 'gray',
            marginBottom: 20,
        },
    checkbox: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
            borderColor: 'black',
            color: 'black', // Icon color when checked
        },

    checkedCheckbox: {
        backgroundColor: 'black', // Black fill color when checked
        borderColor: 'black', // Optional: to keep the border black when checked
      },


    searchOption: {
            padding: 10,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 5,
            marginBottom: 10,
        },
        backButton: {
                backgroundColor: 'white',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 5,
                alignSelf: 'flex-start',
            },
            backButtonText: {
                color: 'black',
                fontSize: 16,
            },
            continueButton: {
                backgroundColor: 'black',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 5,
                alignSelf: 'center',
            },
            continueButtonText: {
               color: 'white',
               fontSize: 16,
            },

//    scrollViewContent: {
//        flexGrow: 1,
//        backgroundColor: '#FFFFFF',
//        justifyContent: 'center', // Optional: Center content if desired
//    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },

     label: {
        fontSize: 18,
        marginBottom: 10,
     },

     input: {
         borderWidth: 1,
         borderColor: '#ccc',
         borderRadius: 5,
         padding: 10,
         fontSize: 18,
         backgroundColor: 'white',
         marginBottom: 20,
     },

     buttonContainer: {
         flexDirection: 'row',
         justifyContent: 'space-between',
     },

     navButton: {
         backgroundColor: '#007bff',
         padding: 10,
         borderRadius: 5,
     },
     submitButton: {
         backgroundColor: 'black',
         paddingVertical: 10,
         paddingHorizontal: 20,
         borderRadius: 5,
         alignSelf: 'center',
     },
     buttonText: {
         color: '#fff',
         fontSize: 18,
     },


    header: {
        height: 50,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerImage: {
        width: 99,
        height: 28,
    },

    searchInputContainer: {
        paddingLeft:5,
    },
    searchInputItem: {        
        borderWidth: 1,
    },

    footer: {
        borderTopWidth: 0.5,        
    },

    containerVideoCall: {
        backgroundColor: '#000',
        flex: 9999999999,
    },

    loadingIndicator: {
        width:44,
        height:44,
    },

    drawerContainer: {
        position: 'absolute',
        top:0,
        left:0,
        width:250,        
        borderWidth: 0.5,
        padding:20,
    },
    drawerButton: {
        justifyContent: 'flex-start',
    },
    drawerButtonIcon: {
        top:3,
        marginRight:10,
        justifyContent: 'center',
        textAlign: 'center',
    },

    badge: {
        backgroundColor:'red', 
        color:'white',
        position:'absolute',
        top:4,
        right:11,
        paddingLeft:4,
        paddingRight:4,
        borderRadius:3
    },
    badgeText: {
        color:'white', 
        fontSize: 11, 
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
//        backgroundColor: '#F5FCFF',
        padding: 20
    },


    card: {
        flex: 1,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#E8E8E8',
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    text: {
        textAlign: 'center',
        fontSize: 10,
        backgroundColor: 'transparent'
    },
    largeText: {
        textAlign: 'center',
        fontSize: 20,
        backgroundColor: 'transparent'
    },
    done: {
        textAlign: 'center',
        fontSize: 30,
        color: 'white',
        backgroundColor: 'transparent'
    }
});
