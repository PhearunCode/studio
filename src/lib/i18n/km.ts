export const km = {
  // General
  actions: 'សកម្មភាព',
  edit: 'កែសម្រួល',
  delete: 'លុប',
  cancel: 'បោះបង់',
  save: 'រក្សាទុក',
  new: 'ថ្មី',
  search: 'ស្វែងរក',
  close: 'បិទ',

  // Sidebar
  sidebar: {
    dashboard: 'ផ្ទាំងគ្រប់គ្រង',
    loans: 'កម្ចី',
    payments: 'ការទូទាត់',
    borrowers: 'អ្នកខ្ចី',
    settings: 'ការកំណត់',
  },

  // Header Dropdown
  header: {
    myAccount: 'គណនីរបស់ខ្ញុំ',
    settings: 'ការកំណត់',
    support: 'ជំនួយ',
    logout: 'ចាកចេញ',
    language: 'ភាសា',
  },

  // Login Page
  loginPage: {
    title: 'LendEasy PH',
    subtitle: 'បញ្ចូលព័ត៌មានសម្ងាត់របស់អ្នក ដើម្បីចូលប្រើផ្ទាំងគ្រប់គ្រង',
    emailLabel: 'អ៊ីមែល',
    passwordLabel: 'ពាក្យសម្ងាត់',
    signInButton: 'ចូល',
  },

  // Toasts / Notifications
  toast: {
    loginFailedTitle: 'ការចូលបរាជ័យ',
    loginFailedDescription: 'អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ។ សូមព្យាយាមម្តងទៀត។',
    success: 'ជោគជ័យ',
    error: 'កំហុស',
    loanCreated: 'ពាក្យស្នើសុំកម្ចីបានដាក់ស្នើដោយជោគជ័យ។',
    loanUpdated: 'កម្ចីត្រូវបានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ។',
    customerSaved: 'អតិថិជនបានរក្សាទុកដោយជោគជ័យ។',
    customerUpdated: 'អតិថិជនត្រូវបានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ។',
    customerCreated: 'អតិថិជនបានបង្កើតដោយជោគជ័យ។',
    customerDeleted: 'អតិថិជន និងកម្ចីដែលពាក់ព័ន្ធទាំងអស់ត្រូវបានលុប។',
    loanStatusUpdated: 'ស្ថានភាពកម្ចីបានធ្វើបច្ចុប្បន្នភាពទៅ {status}។',
    loanDeleted: 'កម្ចីត្រូវបានលុប។',
    paymentMarkedAsPaid: 'ការទូទាត់សម្រាប់ខែ {month} ត្រូវបានសម្គាល់ថាបានបង់។',
    principalPaymentRecorded: 'ការទូទាត់ប្រាក់ដើមបានកត់ត្រាដោយជោគជ័យ។',
    remindersSent: 'បានផ្ញើការរំលឹកការទូទាត់ចំនួន {count} ដោយជោគជ័យ។',
    noRemindersSent: 'គ្មានការទូទាត់ត្រូវដល់ពេលក្នុងរយៈពេល 3 ថ្ងៃ។ គ្មានការរំលឹកត្រូវបានផ្ញើទេ។',
  },

  // Dashboard Page
  dashboard: {
    title: 'ផ្ទាំងគ្រប់គ្រង',
    totalLoanedKhr: 'ប្រាក់កម្ចីសរុប (KHR)',
    totalLoanedUsd: 'ប្រាក់កម្ចីសរុប (USD)',
    totalBorrowers: 'អ្នកខ្ចីសរុប',
    avgInterestRate: 'អត្រាការប្រាក់មធ្យម',
    potentialInterestKhr: 'ការប្រាក់សក្ដានុពល (KHR)',
    potentialInterestUsd: 'ការប្រាក់សក្ដានុពល (USD)',
    totalAmountDisbursedKhr: 'ចំនួនទឹកប្រាក់សរុបដែលបានបញ្ចេញជា KHR',
    totalAmountDisbursedUsd: 'ចំនួនទឹកប្រាក់សរុបដែលបានបញ្ចេញជា USD',
    totalUniqueCustomers: 'ចំនួនអតិថិជនសរុប',
    avgInterestRateDesc: 'អត្រាការប្រាក់មធ្យមសម្រាប់កម្ចីទាំងអស់',
    potentialInterestKhrDesc: 'ការប្រាក់សក្តានុពលពីកម្ចី KHR',
    potentialInterestUsdDesc: 'ការប្រាក់សក្តានុពលពីកម្ចី USD',
    monthlyLoanOverview: 'ទិដ្ឋភាពទូទៅនៃកម្ចីប្រចាំខែ',
    monthlyLoanOverviewDesc: 'ចំនួនទឹកប្រាក់កម្ចីសរុបដែលបានបញ្ចេញក្នុងរយៈពេល 12 ខែចុងក្រោយ។',
    customerList: 'បញ្ជីអតិថិជន',
    customerListDesc: 'បញ្ជីអតិថិជនទាំងអស់ និងសេចក្តីសង្ខេបកម្ចីរបស់ពួកគេ។',
  },
  
  // Loans Page
  loansPage: {
    title: 'កម្ចី',
    newLoan: 'កម្ចីថ្មី',
    loanApplications: 'ពាក្យស្នើសុំកម្ចី',
    loanApplicationsDesc: 'បញ្ជីនៃពាក្យស្នើសុំកម្ចីទាំងអស់។',
    searchPlaceholder: 'ស្វែងរកតាមឈ្មោះអ្នកខ្ចី...',
    table: {
      borrower: 'អ្នកខ្ចី',
      principal: 'ប្រាក់ដើម',
      interest: 'ការប្រាក់',
      term: 'រយៈពេល',
      date: 'កាលបរិច្ឆេទ',
      status: 'ស្ថានភាព',
    },
    actions: {
      viewPayments: 'មើលការទូទាត់',
      makePrincipalPayment: 'ធ្វើការទូទាត់ប្រាក់ដើម',
      editLoan: 'កែសម្រួលកម្ចី',
      deleteLoan: 'លុបកម្ចី',
      changeStatus: 'ផ្លាស់ប្តូរស្ថានភាព',
      approve: 'អនុម័ត',
      reject: 'បដិសេធ',
      setAsPending: 'កំណត់ជាកំពុងរង់ចាំ',
    }
  },

  // Payments Page
  paymentsPage: {
    title: 'ការទូទាត់',
    sendReminders: 'ផ្ញើការរំលឹកការទូទាត់',
    paymentOverview: 'ទិដ្ឋភាពទូទៅនៃការទូទាត់',
    paymentOverviewDesc: 'ទិដ្ឋភាពទូទៅនៃការទូទាត់ប្រចាំខែសម្រាប់កម្ចីសកម្មទាំងអស់។',
    table: {
      borrower: 'អ្នកខ្ចី',
      paymentProgress: 'វឌ្ឍនភាពការទូទាត់',
      monthlyInterest: 'ការប្រាក់ប្រចាំខែ',
      totalInterest: 'ការប្រាក់សរុប',
    },
    paid: 'បានបង់',
    noSchedule: 'គ្មានកាលវិភាគត្រូវបានបង្កើត',
    viewSchedule: 'មើលកាលវិភាគទូទាត់'
  },
  
  // Borrowers Page
  borrowersPage: {
    title: 'អ្នកខ្ចី',
    newCustomer: 'អតិថិជនថ្មី',
    borrowerList: 'បញ្ជីអ្នកខ្ចី',
    borrowerListDesc: 'បញ្ជីអ្នកខ្ចីទាំងអស់ និងសេចក្តីសង្ខេបកម្ចីរបស់ពួកគេ។',
    searchPlaceholder: 'ស្វែងរកតាមឈ្មោះអតិថិជន...',
    table: {
      customer: 'អតិថិជន',
      phone: 'ទូរស័ព្ទ / WhatsApp',
      telegramId: 'លេខសម្គាល់ Telegram',
      idCardNumber: 'លេខអត្តសញ្ញាណប័ណ្ណ',
      address: 'អាសយដ្ឋាន',
      totalLoans: 'កម្ចីសរុប',
      totalLoanedAmount: 'ចំនួនកម្ចីសរុប',
    },
    actions: {
      editCustomer: 'កែសម្រួលអតិថិជន',
      deleteCustomer: 'លុបអតិថិជន',
    }
  },

  // Settings Page
  settingsPage: {
    title: 'ការកំណត់',
    profile: 'ប្រវត្តិរូប',
    profileDesc: 'នេះជារបៀបដែលអ្នកដទៃនឹងឃើញអ្នកនៅលើគេហទំព័រ។',
    avatarLabel: 'URL រូបតំណាង ឬផ្ទុកឡើង',
    upload: 'ផ្ទុកឡើង',
    fullNameLabel: 'ឈ្មោះ​ពេញ',
    emailAddressLabel: 'អាសយដ្ឋានអ៊ីមែល',
    saveChanges: 'រក្សាទុកការផ្លាស់ប្តូរ',
  },
  
  // Generic Dialogs
  deleteDialog: {
      title: 'តើអ្នកពិតជាប្រាកដមែនទេ?',
      customerDesc: 'សកម្មភាពនេះមិនអាចមិនធ្វើវិញបានទេ។ វានឹងលុបអតិថិជន {name} ជាអចិន្ត្រៃយ៍ និងកំណត់ត្រាកម្ចីដែលពាក់ព័ន្ធទាំងអស់របស់ពួកគេ។',
      loanDesc: 'សកម្មភាពនេះមិនអាចមិនធ្វើវិញបានទេ។ វានឹងលុបកំណត់ត្រាកម្ចីសម្រាប់ {name} ជាអចិន្ត្រៃយ៍។'
  },
  
  // Forms
  customerForm: {
      newTitle: 'អតិថិជនថ្មី',
      editTitle: 'កែសម្រួលអតិថិជន',
      newDesc: 'បំពេញព័ត៌មានលម្អិតខាងក្រោមដើម្បីបង្កើតអតិថិជនថ្មី។',
      editDesc: 'ធ្វើបច្ចុប្បន្នភាពព័ត៌មានលម្អិតសម្រាប់អតិថិជននេះ។',
      nameLabel: 'ឈ្មោះអតិថិជន',
      namePlaceholder: 'Juan dela Cruz',
      phoneLabel: 'លេខទូរសព្ទ',
      phonePlaceholder: 'ឧ. +៦៣៩១៧១២៣៤៥៦៧ (រួមបញ្ចូលលេខកូដប្រទេស)',
      telegramLabel: 'ឈ្មោះអ្នកប្រើ Telegram (ស្រេចចិត្ត)',
      telegramPlaceholder: 'ឧ. juandelacruz',
      facebookLabel: 'URL ប្រវត្តិរូប Facebook (ស្រេចចិត្ត)',
      facebookPlaceholder: 'https://facebook.com/username',
      idCardLabel: 'លេខអត្តសញ្ញាណប័ណ្ណ',
      idCardPlaceholder: '1234-5678-9012',
      addressLabel: 'អាសយដ្ឋាន',
      addressPlaceholder: '123 Rizal St, Manila',
      profilePicLabel: 'រូបភាពប្រវត្តិរូប',
      avatarUrlLabel: 'URL ឬផ្ទុកឡើង',
      avatarUrlPlaceholder: 'https://example.com/avatar.png',
  },
  loanForm: {
    newTitle: 'កម្ចីថ្មី',
    newDesc: 'បំពេញព័ត៌មានលម្អិតខាងក្រោមដើម្បីបង្កើតកម្ចីថ្មីសម្រាប់អតិថិជនដែលមានស្រាប់។',
    borrowerNameLabel: 'ឈ្មោះអ្នកខ្ចី',
    borrowerNamePlaceholder: 'ជ្រើសរើសអតិថិជនដែលមានស្រាប់',
    noCustomers: 'សូមបន្ថែមអតិថិជនជាមុនសិន។',
    amountLabel: 'ចំនួនទឹកប្រាក់',
    amountPlaceholder: '50000',
    currencyLabel: 'រូបិយប័ណ្ណ',
    currencyPlaceholder: 'ជ្រើសរើសរូបិយប័ណ្ណ',
    interestRateLabel: 'អត្រាការប្រាក់ (%)',
    interestRatePlaceholder: '5.5',
    termLabel: 'រយៈពេល (ខែ)',
    termPlaceholder: '36',
    loanDateLabel: 'កាលបរិច្ឆេទកម្ចី',
    addressLabel: 'អាសយដ្ឋាន',
    addressPlaceholder: 'អាសយដ្ឋានត្រូវបានបំពេញដោយស្វ័យប្រវត្តិពីអតិថិជន',
    editTitle: 'កែសម្រួលកម្ចី',
    editDesc: 'ធ្វើបច្ចុប្បន្នភាពព័ត៌មានលម្អិតសម្រាប់កម្ចីនេះ។ ឈ្មោះអតិថិជន និងអាសយដ្ឋានមិនអាចផ្លាស់ប្តូរបានទេ។',
  },
  principalPaymentForm: {
    title: 'ធ្វើការទូទាត់ប្រាក់ដើម',
    desc: 'កត់ត្រាការទូទាត់ឆ្ពោះទៅរកចំនួនប្រាក់ដើមសម្រាប់ {name}។ ប្រាក់ដើមដែលនៅសល់បច្ចុប្បន្នគឺ {amount}។',
    paymentAmountLabel: 'ចំនួនទឹកប្រាក់ទូទាត់',
    paymentAmountPlaceholder: 'បញ្ចូលចំនួនទឹកប្រាក់',
    recordPaymentButton: 'កត់ត្រាការទូទាត់',
    summaryTitle: 'សេចក្តីសង្ខេបការទូទាត់',
    summaryDesc: 'ការទូទាត់ចំនួន {paymentAmount} នឹងត្រូវបានកត់ត្រា។ ប្រាក់ដើមដែលនៅសល់ថ្មីនឹង là {newPrincipal}។ ការទូទាត់ការប្រាក់នាពេលអនាគតនឹងត្រូវបានគណនាឡើងវិញ។',
    overpaymentTitle: 'ការទូទាត់លើស',
    overpaymentDesc: 'ចំនួនទឹកប្រាក់ទូទាត់មិនអាចលើសពីប្រាក់ដើមដែលនៅសល់បានទេ។',
  },
  paymentScheduleDialog: {
    title: 'កាលវិភាគទូទាត់ប្រចាំខែ',
    desc: 'សម្រាប់កម្ចីចំនួន {amount} ក្នុងរយៈពេល {term} ខែ ក្នុងអត្រាការប្រាក់ {interestRate}% ។ អ្នកខ្ចីបង់ការប្រាក់ថេរចំនួន {monthlyInterest} ជារៀងរាល់ខែ។ ចំនួនប្រាក់ដើមពេញលេញត្រូវបង់ជាមួយនឹងការទូទាត់ចុងក្រោយ។',
    noSchedule: 'កម្ចីនេះមិនទាន់ត្រូវបានអនុម័តនៅឡើយទេ។ កាលវិភាគទូទាត់នឹងត្រូវបានបង្កើតនៅពេលមានការអនុម័ត។',
    exportToExcel: 'នាំចេញទៅ Excel',
    markAsPaid: 'សម្គាល់ថាបានបង់',
    table: {
      month: 'ខែ',
      dueDate: 'កាលបរិច្ឆេទដល់កំណត់',
      status: 'ស្ថានភាព',
      principal: 'ប្រាក់ដើម',
      interest: 'ការប្រាក់',
      totalPayment: 'ការទូទាត់សរុប',
      remainingBalance: 'សមតុល្យដែលនៅសល់',
      action: 'សកម្មភាព',
    }
  },
  verificationResultDialog: {
    title: 'ការផ្ទៀងផ្ទាត់ AI បានបញ្ចប់',
    desc: 'ពាក្យស្នើសុំកម្ចីត្រូវបានវិភាគដោយស្វ័យប្រវត្តិ។ នេះគឺជាការរកឃើញ។',
    issuesFound: 'រកឃើញបញ្ហាសក្តានុពល',
    noIssuesFound: 'រកមិនឃើញបញ្ហាទេ',
    flagsRaised: 'ទង់ដែលបានលើកឡើង៖'
  }
};
