import React, { createContext, useContext, useState, useEffect } from 'react';

// Define available languages
export type Language = 'en' | 'hi' | 'gu' | 'bn';

// Define translations interface
interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

// Initial translations (will be expanded)
const translations: Translations = {
  en: {
    home: 'Home',
    login: 'Login',
    signup: 'Sign Up',
    search: 'Search',
    properties: 'Properties',
    profile: 'Profile',
    logout: 'Logout',
    becomeOwner: 'Become an Owner',
    rentRange: 'Rent Range',
    roomType: 'Room Type',
    location: 'Location',
    furnishing: 'Furnishing',
    furnished: 'Furnished',
    unfurnished: 'Unfurnished',
    filter: 'Filter',
    sort: 'Sort',
    priceHighToLow: 'Price: High to Low',
    priceLowToHigh: 'Price: Low to High',
    newest: 'Newest First',
    viewDetails: 'View Details',
    contactOwner: 'Contact Owner',
    uploadProperty: 'Upload Property',
    propertyDetails: 'Property Details',
    rentAmount: 'Rent Amount',
    depositAmount: 'Deposit Amount',
    availableFrom: 'Available From',
    propertyType: 'Property Type',
    address: 'Address',
    description: 'Description',
    amenities: 'Amenities',
    photos: 'Photos',
    submit: 'Submit',
    cancel: 'Cancel',
    subscriptionPlans: 'Subscription Plans',
    oneWeekPlan: 'One Week Plan',
    oneMonthPlan: 'One Month Plan',
    subscribe: 'Subscribe',
    adminPanel: 'Admin Panel',
    pendingApprovals: 'Pending Approvals',
    approve: 'Approve',
    reject: 'Reject',
    users: 'Users',
    payments: 'Payments',
    statistics: 'Statistics',
    editProfile: 'Edit Profile',
    save: 'Save',
    name: 'Name',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    phoneNumber: 'Phone Number',
    uploadPhoto: 'Upload Photo',
    propertyStatus: 'Property Status',
    available: 'Available',
    booked: 'Booked',
    markAsBooked: 'Mark as Booked',
    unlockFullAccess: 'Unlock Full Access',
    viewBlurred: 'View Blurred',
    paymentRequired: 'Payment Required',
    payNow: 'Pay Now',
    paymentSuccess: 'Payment Success',
    paymentFailed: 'Payment Failed',
    tryAgain: 'Try Again',
    contactUs: 'Contact Us',
    aboutUs: 'About Us',
    termsAndConditions: 'Terms and Conditions',
    privacyPolicy: 'Privacy Policy',
    language: 'Language',
    english: 'English',
    hindi: 'Hindi',
    gujarati: 'Gujarati',
    bengali: 'Bengali',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    theme: 'Theme',
    addProperty: 'Add Property',
    propertyTitlePlaceholder: 'Enter property title',
    propertyDescriptionPlaceholder: 'Describe your property',
    propertyLocationPlaceholder: 'Enter property location',
    imageUploadHint: 'Upload up to 5 images of your property',
    adding: 'Adding...',
    propertyAddedSuccess: 'Property added successfully',
    errorAddingProperty: 'Error adding property',
  },
  hi: {
    home: 'होम',
    login: 'लॉगिन',
    signup: 'साइन अप',
    search: 'खोज',
    properties: 'प्रॉपर्टीज',
    profile: 'प्रोफाइल',
    logout: 'लॉगआउट',
    becomeOwner: 'मालिक बनें',
    rentRange: 'किराया रेंज',
    roomType: 'कमरे का प्रकार',
    location: 'स्थान',
    furnishing: 'फर्निशिंग',
    furnished: 'फर्निश्ड',
    unfurnished: 'अनफर्निश्ड',
    filter: 'फिल्टर',
    sort: 'क्रमबद्ध करें',
    priceHighToLow: 'मूल्य: उच्च से निम्न',
    priceLowToHigh: 'मूल्य: निम्न से उच्च',
    newest: 'नवीनतम पहले',
    viewDetails: 'विवरण देखें',
    contactOwner: 'मालिक से संपर्क करें',
    uploadProperty: 'प्रॉपर्टी अपलोड करें',
    propertyDetails: 'प्रॉपर्टी विवरण',
    rentAmount: 'किराया राशि',
    depositAmount: 'जमा राशि',
    availableFrom: 'उपलब्ध तिथि',
    propertyType: 'प्रॉपर्टी प्रकार',
    address: 'पता',
    description: 'विवरण',
    amenities: 'सुविधाएँ',
    photos: 'फोटो',
    submit: 'सबमिट',
    cancel: 'रद्द करें',
    subscriptionPlans: 'सदस्यता योजनाएँ',
    oneWeekPlan: 'एक सप्ताह की योजना',
    oneMonthPlan: 'एक महीने की योजना',
    subscribe: 'सदस्यता लें',
    adminPanel: 'एडमिन पैनल',
    pendingApprovals: 'लंबित अनुमोदन',
    approve: 'स्वीकृत करें',
    reject: 'अस्वीकार करें',
    users: 'उपयोगकर्ता',
    payments: 'भुगतान',
    statistics: 'आँकड़े',
    editProfile: 'प्रोफ़ाइल संपादित करें',
    save: 'सहेजें',
    name: 'नाम',
    email: 'ईमेल',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    phoneNumber: 'फोन नंबर',
    uploadPhoto: 'फोटो अपलोड करें',
    propertyStatus: 'प्रॉपर्टी स्थिति',
    available: 'उपलब्ध',
    booked: 'बुक किया गया',
    markAsBooked: 'बुक के रूप में चिह्नित करें',
    unlockFullAccess: 'पूर्ण पहुंच अनलॉक करें',
    viewBlurred: 'धुंधला देखें',
    paymentRequired: 'भुगतान आवश्यक',
    payNow: 'अभी भुगतान करें',
    paymentSuccess: 'भुगतान सफल',
    paymentFailed: 'भुगतान विफल',
    tryAgain: 'पुनः प्रयास करें',
    contactUs: 'संपर्क करें',
    aboutUs: 'हमारे बारे में',
    termsAndConditions: 'नियम और शर्तें',
    privacyPolicy: 'गोपनीयता नीति',
    language: 'भाषा',
    english: 'अंग्रे़ी',
    hindi: 'हिंदी',
    gujarati: 'गुजराती',
    bengali: 'बंगाली',
    darkMode: 'डार्क मोड',
    lightMode: 'लाइट मोड',
    theme: 'थीम',
    addProperty: 'जोड़ें संपत्ति',
    propertyTitlePlaceholder: 'संपत्ति का शीर्षक दर्ज करें',
    propertyDescriptionPlaceholder: 'अपनी संपत्ति का वर्णन करें',
    propertyLocationPlaceholder: 'संपत्ति का स्थान दर्ज करें',
    imageUploadHint: 'अपनी संपत्ति के 5 छवियों को अपलोड करें',
    adding: 'जोड़ने का प्रयास',
    propertyAddedSuccess: 'संपत्ति सफलतापूर्वक जोड़ी गई',
    errorAddingProperty: 'संपत्ति जोड़ने में त्रुटि',
  },
  gu: {
    home: 'હોમ',
    login: 'લોગિન',
    signup: 'સાઇન અપ',
    search: 'શોધ',
    properties: 'પ્રોપર્ટીઝ',
    profile: 'પ્રોફાઇલ',
    logout: 'લોગઆઉટ',
    becomeOwner: 'માલિક બનો',
    rentRange: 'ભાડા રેન્જ',
    roomType: 'રૂમનો પ્રકાર',
    location: 'સ્થાન',
    furnishing: 'ફર્નિશિંગ',
    furnished: 'ફર્નિશ્ડ',
    unfurnished: 'અનફર્નિશ્ડ',
    filter: 'ફિલ્ટર',
    sort: 'સોર્ટ',
    priceHighToLow: 'કિંમત: ઉચ્ચથી નીચે',
    priceLowToHigh: 'કિંમત: નીચેથી ઉચ્ચ',
    newest: 'સૌથી નવું પહેલા',
    viewDetails: 'વિગતો જુઓ',
    contactOwner: 'માલિકનો સંપર્ક કરો',
    uploadProperty: 'પ્રોપર્ટી અપલોડ કરો',
    propertyDetails: 'પ્રોપર્ટી વિગતો',
    rentAmount: 'ભાડાની રકમ',
    depositAmount: 'ડિપોઝિટ રકમ',
    availableFrom: 'ઉપલબ્ધ તારીખ',
    propertyType: 'પ્રોપર્ટી પ્રકાર',
    address: 'સરનામું',
    description: 'વર્ણન',
    amenities: 'સુવિધાઓ',
    photos: 'ફોટા',
    submit: 'સબમિટ',
    cancel: 'રદ કરો',
    subscriptionPlans: 'સબ્સ્ક્રિપ્શન પ્લાન',
    oneWeekPlan: 'એક અઠવાડિયાનો પ્લાન',
    oneMonthPlan: 'એક મહિનાનો પ્લાન',
    subscribe: 'સબ્સ્ક્રાઇબ કરો',
    adminPanel: 'એડમિન પેનલ',
    pendingApprovals: 'બાકી મંજૂરીઓ',
    approve: 'મંજૂર કરો',
    reject: 'નકારો',
    users: 'વપરાશકર્તાઓ',
    payments: 'ચુકવણીઓ',
    statistics: 'આંકડા',
    editProfile: 'પ્રોફાઇલ સંપાદિત કરો',
    save: 'સાચવો',
    name: 'નામ',
    email: 'ઇમેઇલ',
    password: 'પાસવર્ડ',
    confirmPassword: 'પાસવર્ડની પુષ્ટિ કરો',
    phoneNumber: 'ફોન નંબર',
    uploadPhoto: 'ફોટો અપલોડ કરો',
    propertyStatus: 'પ્રોપર્ટી સ્થિતિ',
    available: 'ઉપલબ્ધ',
    booked: 'બુક કરેલ',
    markAsBooked: 'બુક તરીકે ચિહ્નિત કરો',
    unlockFullAccess: 'પૂર્ણ ઍક્સેસ અનલૉક કરો',
    viewBlurred: 'ધૂંધળું જુઓ',
    paymentRequired: 'ચુકવણી આવશ્યક',
    payNow: 'હવે ચૂકવો',
    paymentSuccess: 'ચુકવણી સફળ',
    paymentFailed: 'ચુકવણી નિષ્ફળ',
    tryAgain: 'ફરી પ્રયાસ કરો',
    contactUs: 'અમારો સંપર્ક કરો',
    aboutUs: 'અમારા વિશે',
    termsAndConditions: 'નિયમો અને શરતો',
    privacyPolicy: 'ગોપનીયતા નીતિ',
    language: 'ભાષા',
    english: 'અંગ્રેજી',
    hindi: 'હિન્દી',
    gujarati: 'ગુજરાતી',
    bengali: 'બંગાળી',
    darkMode: 'ડાર્ક મોડ',
    lightMode: 'લાઇટ મોડ',
    theme: 'થીમ',
    addProperty: 'વપરાશ જોડવા',
    propertyTitlePlaceholder: 'વપરાશનો શીર્ષક દાખલ કરો',
    propertyDescriptionPlaceholder: 'તમારી વપરાશ વર્ણન કરો',
    propertyLocationPlaceholder: 'વપરાશનો સ્થાન દાખલ કરો',
    imageUploadHint: 'તમારી વપરાશની 5 છબિઓ અપલોડ કરો',
    adding: 'જોડવાનો પ્રયાસ',
    propertyAddedSuccess: 'વપરાશ સફળતાપૂર્વક જોડવામાં આવી',
    errorAddingProperty: 'વપરાશ જોડવામાં ત્રુટિ',
  },
  bn: {
    home: 'হোম',
    login: 'লগইন',
    signup: 'সাইন আপ',
    search: 'অনুসন্ধান',
    properties: 'প্রপার্টি',
    profile: 'প্রোফাইল',
    logout: 'লগআউট',
    becomeOwner: 'মালিক হন',
    rentRange: 'ভাড়ার পরিসীমা',
    roomType: 'রুমের ধরন',
    location: 'অবস্থান',
    furnishing: 'আসবাবপত্র',
    furnished: 'আসবাবযুক্ত',
    unfurnished: 'আসবাবহীন',
    filter: 'ফিল্টার',
    sort: 'সাজান',
    priceHighToLow: 'মূল্য: উচ্চ থেকে নিম্ন',
    priceLowToHigh: 'মূল্য: নিম্ন থেকে উচ্চ',
    newest: 'সর্বাধিক নতুন',
    viewDetails: 'বিস্তারিত দেখুন',
    contactOwner: 'মালিকের সাথে যোগাযোগ করুন',
    uploadProperty: 'প্রপার্টি আপলোড করুন',
    propertyDetails: 'প্রপার্টি বিবরণ',
    rentAmount: 'ভাড়ার পরিমাণ',
    depositAmount: 'জমার পরিমাণ',
    availableFrom: 'উপলব্ধ তারিখ',
    propertyType: 'প্রপার্টির ধরন',
    address: 'ঠিকানা',
    description: 'বিবরণ',
    amenities: 'সুবিধাদি',
    photos: 'ছবি',
    submit: 'জমা দিন',
    cancel: 'বাতিল করুন',
    subscriptionPlans: 'সাবস্ক্রিপশন প্ল্যান',
    oneWeekPlan: 'এক সপ্তাহের প্ল্যান',
    oneMonthPlan: 'এক মাসের প্ল্যান',
    subscribe: 'সাবস্ক্রাইব করুন',
    adminPanel: 'অ্যাডমিন প্যানেল',
    pendingApprovals: 'অপেক্ষারত অনুমোদন',
    approve: 'অনুমোদন করুন',
    reject: 'প্রত্যাখ্যান করুন',
    users: 'ব্যবহারকারী',
    payments: 'পেমেন্ট',
    statistics: 'পরিসংখ্যান',
    editProfile: 'প্রোফাইল সম্পাদনা করুন',
    save: 'সংরক্ষণ করুন',
    name: 'নাম',
    email: 'ইমেইল',
    password: 'পাসওয়ার্ড',
    confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন',
    phoneNumber: 'ফোন নম্বর',
    uploadPhoto: 'ছবি আপলোড করুন',
    propertyStatus: 'প্রপার্টি স্ট্যাটাস',
    available: 'উপলব্ধ',
    booked: 'বুক করা হয়েছে',
    markAsBooked: 'বুক হিসাবে চিহ্নিত করুন',
    unlockFullAccess: 'সম্পূর্ণ অ্যাক্সেস আনলক করুন',
    viewBlurred: 'ঝাপসা দেখুন',
    paymentRequired: 'পেমেন্ট প্রয়োজন',
    payNow: 'এখনই পেমেন্ট করুন',
    paymentSuccess: 'পেমেন্ট সফল',
    paymentFailed: 'পেমেন্ট ব্যর্থ',
    tryAgain: 'আবার চেষ্টা করুন',
    contactUs: 'যোগাযোগ করুন',
    aboutUs: 'আমাদের সম্পর্কে',
    termsAndConditions: 'শর্তাবলী',
    privacyPolicy: 'গোপনীয়তা নীতি',
    language: 'ভাষা',
    english: 'ইংরেজি',
    hindi: 'হিন্দি',
    gujarati: 'গুজরাটি',
    bengali: 'বাংলা',
    darkMode: 'ডার্ক মোড',
    lightMode: 'লাইট মোড',
    theme: 'থিম',
    addProperty: 'প্রপার্টি যোগ করুন',
    propertyTitlePlaceholder: 'প্রপার্টির শিরোনাম দিন',
    propertyDescriptionPlaceholder: 'আপনার প্রপার্টি বর্ণনা করুন',
    propertyLocationPlaceholder: 'প্রপার্টির অবস্থান দিন',
    imageUploadHint: 'আপনার প্রপার্টির 5 ছবি আপলোড করুন',
    adding: 'প্রপার্টি যোগ করার প্রয়াস',
    propertyAddedSuccess: 'প্রপার্টি সফলভাবে যোগ করা হয়েছে',
    errorAddingProperty: 'প্রপার্টি যোগ করার ত্রুটি',
  },
};

// Define the context type
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Create the provider component
interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 